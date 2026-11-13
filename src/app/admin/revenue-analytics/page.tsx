'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Order } from '@/app/admin/orders/page';
import OrderDetailModal from '@/components/Admin/OrderDetailModal';
import AnalyticsCalendar, { DateRange } from '@/components/Admin/AnalyticsCalendar';
import Link from 'next/link';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Area, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { 
  ArrowLeft, 
  Calendar as CalendarIcon, 
  Coins, 
  ClipboardList, 
  TrendingUp, 
  RefreshCw, 
  Eye, 
  Download, 
  Search, 
  Filter, 
  Sparkles, 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  Truck, 
  AlertCircle,
  Percent,
  CalendarRange
} from 'lucide-react';

type Granularity = 'daily' | 'monthly' | 'yearly';
type MetricView = 'combined' | 'revenue' | 'volume';
type ChartStyle = 'area' | 'bar';

interface AggregatedDataPoint {
  key: string;       // Date label for X-axis
  fullDate: string;  // Full date label for tooltip
  revenue: number;   // Total earnings (৳)
  volume: number;    // Order count
  aov: number;       // Average Order Value
  orders: Order[];   // Orders in this bucket
}

export default function RevenueAnalyticsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Selected date range state
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    // Default to last 30 days
    const now = new Date();
    const d30 = new Date(now);
    d30.setDate(d30.getDate() - 29);

    const format = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return {
      startDate: format(d30),
      endDate: format(now),
      label: 'Last 30 Days',
      mode: 'range'
    };
  });

  // Chart configuration states
  const [granularity, setGranularity] = useState<Granularity>('daily');
  const [metricView, setMetricView] = useState<MetricView>('combined');
  const [chartStyle, setChartStyle] = useState<ChartStyle>('area');

  // Order Details Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Table search & filter
  const [tableSearch, setTableSearch] = useState('');
  const [tableStatus, setTableStatus] = useState<string>('all');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch orders matching current date range
  const fetchOrders = useCallback(async () => {
    try {
      setIsRefreshing(true);
      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: true });

      if (dateRange.startDate) {
        query = query.gte('created_at', `${dateRange.startDate}T00:00:00.000Z`);
      }
      if (dateRange.endDate) {
        query = query.lte('created_at', `${dateRange.endDate}T23:59:59.999Z`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching analytics orders:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [dateRange.startDate, dateRange.endDate]);

  useEffect(() => {
    fetchOrders();

    // Setup Supabase Realtime channel for live order updates
    const channel = supabase
      .channel('analytics-orders-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOrders]);

  // Aggregate orders into chart data points based on granularity
  const chartData = useMemo<AggregatedDataPoint[]>(() => {
    if (!orders.length) return [];

    const isSingleDay = dateRange.startDate === dateRange.endDate;

    if (isSingleDay) {
      // Intra-day hourly aggregation
      const hourlyMap = new Map<number, { revenue: number; volume: number; orders: Order[] }>();
      for (let h = 0; h < 24; h++) {
        hourlyMap.set(h, { revenue: 0, volume: 0, orders: [] });
      }

      orders.forEach((o) => {
        const orderHour = new Date(o.created_at).getHours();
        const curr = hourlyMap.get(orderHour);
        if (curr) {
          curr.revenue += o.total_price || 0;
          curr.volume += 1;
          curr.orders.push(o);
        }
      });

      return Array.from(hourlyMap.entries()).map(([hour, data]) => {
        const label = `${String(hour).padStart(2, '0')}:00`;
        const aov = data.volume > 0 ? Math.round(data.revenue / data.volume) : 0;
        return {
          key: label,
          fullDate: `${dateRange.startDate} at ${label}`,
          revenue: data.revenue,
          volume: data.volume,
          aov,
          orders: data.orders
        };
      });
    }

    if (granularity === 'monthly') {
      // Group by YYYY-MM
      const monthlyMap = new Map<string, { revenue: number; volume: number; orders: Order[] }>();

      orders.forEach((o) => {
        const d = new Date(o.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyMap.has(key)) {
          monthlyMap.set(key, { revenue: 0, volume: 0, orders: [] });
        }
        const bucket = monthlyMap.get(key)!;
        bucket.revenue += o.total_price || 0;
        bucket.volume += 1;
        bucket.orders.push(o);
      });

      return Array.from(monthlyMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, data]) => {
          const [yr, mo] = key.split('-');
          const monthName = new Date(parseInt(yr), parseInt(mo) - 1, 1).toLocaleDateString('en-US', { month: 'short' });
          const aov = data.volume > 0 ? Math.round(data.revenue / data.volume) : 0;
          return {
            key: `${monthName} '${yr.slice(2)}`,
            fullDate: `${new Date(parseInt(yr), parseInt(mo) - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
            revenue: data.revenue,
            volume: data.volume,
            aov,
            orders: data.orders
          };
        });
    }

    if (granularity === 'yearly') {
      // Group by YYYY
      const yearlyMap = new Map<string, { revenue: number; volume: number; orders: Order[] }>();

      orders.forEach((o) => {
        const d = new Date(o.created_at);
        const key = `${d.getFullYear()}`;
        if (!yearlyMap.has(key)) {
          yearlyMap.set(key, { revenue: 0, volume: 0, orders: [] });
        }
        const bucket = yearlyMap.get(key)!;
        bucket.revenue += o.total_price || 0;
        bucket.volume += 1;
        bucket.orders.push(o);
      });

      return Array.from(yearlyMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, data]) => {
          const aov = data.volume > 0 ? Math.round(data.revenue / data.volume) : 0;
          return {
            key,
            fullDate: `Year ${key}`,
            revenue: data.revenue,
            volume: data.volume,
            aov,
            orders: data.orders
          };
        });
    }

    // Default: Daily aggregation
    // Generate chronological map for every day in the range or days with orders
    const dailyMap = new Map<string, { revenue: number; volume: number; orders: Order[] }>();

    orders.forEach((o) => {
      const d = new Date(o.created_at);
      const yr = d.getFullYear();
      const mo = String(d.getMonth() + 1).padStart(2, '0');
      const da = String(d.getDate()).padStart(2, '0');
      const key = `${yr}-${mo}-${da}`;

      if (!dailyMap.has(key)) {
        dailyMap.set(key, { revenue: 0, volume: 0, orders: [] });
      }
      const bucket = dailyMap.get(key)!;
      bucket.revenue += o.total_price || 0;
      bucket.volume += 1;
      bucket.orders.push(o);
    });

    return Array.from(dailyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, data]) => {
        const [yr, mo, da] = key.split('-').map(Number);
        const d = new Date(yr, mo - 1, da);
        const shortLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const aov = data.volume > 0 ? Math.round(data.revenue / data.volume) : 0;

        return {
          key: shortLabel,
          fullDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          revenue: data.revenue,
          volume: data.volume,
          aov,
          orders: data.orders
        };
      });
  }, [orders, dateRange.startDate, dateRange.endDate, granularity]);

  // Overall Calculated Summary Metrics
  const summary = useMemo(() => {
    const totalRevenue = orders.reduce((acc, o) => acc + (o.total_price || 0), 0);
    const totalOrders = orders.length;
    const aov = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // Highest revenue day
    let highestDay = { date: 'N/A', amount: 0 };
    chartData.forEach((dp) => {
      if (dp.revenue > highestDay.amount) {
        highestDay = { date: dp.fullDate, amount: dp.revenue };
      }
    });

    // Fulfillment status counts
    let deliveredCount = 0;
    let shippedCount = 0;
    let pendingCount = 0;
    let cancelledCount = 0;

    orders.forEach((o) => {
      const st = (o.status || '').toLowerCase();
      if (st === 'delivered') deliveredCount++;
      else if (st === 'shipped') shippedCount++;
      else if (st === 'cancelled') cancelledCount++;
      else pendingCount++;
    });

    const fulfillmentRate = totalOrders > 0 
      ? Math.round(((deliveredCount + shippedCount) / totalOrders) * 100) 
      : 0;

    return {
      totalRevenue,
      totalOrders,
      aov,
      highestDay,
      deliveredCount,
      shippedCount,
      pendingCount,
      cancelledCount,
      fulfillmentRate
    };
  }, [orders, chartData]);

  // Filtered orders for the breakdown table
  const filteredTableOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch = 
        (o.delivery_name || '').toLowerCase().includes(tableSearch.toLowerCase()) ||
        (o.delivery_email || '').toLowerCase().includes(tableSearch.toLowerCase()) ||
        (o.id || '').toLowerCase().includes(tableSearch.toLowerCase()) ||
        (o.product_name || '').toLowerCase().includes(tableSearch.toLowerCase());

      const matchStatus = 
        tableStatus === 'all' || 
        (o.status || '').toLowerCase() === tableStatus.toLowerCase();

      return matchSearch && matchStatus;
    });
  }, [orders, tableSearch, tableStatus]);

  // CSV Exporter for accounting
  const handleExportCSV = () => {
    if (!orders.length) return;

    const headers = [
      'Manifest ID',
      'Created Date',
      'Consignee Name',
      'Email',
      'Phone',
      'Address',
      'Zone',
      'Selection / Products',
      'Variant Size',
      'Quantity',
      'Payment Method',
      'Subtotal',
      'Delivery Cost',
      'Total Price (BDT)',
      'Status'
    ];

    const rows = orders.map((o) => {
      let productClean = o.product_name;
      try {
        if (o.product_name.startsWith('[') && o.product_name.endsWith(']')) {
          const items = JSON.parse(o.product_name);
          productClean = items.map((i: { name: string; size: string }) => `${i.name} (${i.size})`).join('; ');
        }
      } catch {
        // Keep raw
      }

      return [
        `#${o.id.slice(0, 8).toUpperCase()}`,
        new Date(o.created_at).toISOString(),
        `"${o.delivery_name || ''}"`,
        `"${o.delivery_email || ''}"`,
        `"${o.whatsapp_number || ''}"`,
        `"${(o.delivery_address || '').replace(/"/g, '""')}"`,
        `"${o.delivery_zone || ''}"`,
        `"${productClean.replace(/"/g, '""')}"`,
        `"${o.variant_size || ''}"`,
        o.quantity || 1,
        `"${o.payment_method || ''}"`,
        o.subtotal || 0,
        o.delivery_cost || 0,
        o.total_price || 0,
        `"${o.status || ''}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sufyra-revenue-manifest-${dateRange.startDate}-to-${dateRange.endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: string) => {
    switch ((status || '').toLowerCase()) {
      case 'delivered':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-bold uppercase tracking-wider">
            <CheckCircle2 size={11} />
            Delivered
          </span>
        );
      case 'shipped':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 text-[9px] font-bold uppercase tracking-wider">
            <Truck size={11} />
            Shipped
          </span>
        );
      case 'processing':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-luxury-gold/15 text-luxury-gold border border-luxury-gold/30 text-[9px] font-bold uppercase tracking-wider">
            <RefreshCw size={11} className="animate-spin" />
            Processing
          </span>
        );
      case 'received':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] font-bold uppercase tracking-wider">
            <Clock size={11} />
            Received
          </span>
        );
      case 'cancelled':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-[9px] font-bold uppercase tracking-wider">
            <AlertCircle size={11} />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-bold uppercase tracking-wider">
            <Clock size={11} />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-20">
      {/* Top Breadcrumb & Executive Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-(--foreground)/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.2em] text-luxury-gold/80 hover:text-luxury-gold transition-colors"
            >
              <ArrowLeft size={12} />
              Executive Console
            </Link>
            <span className="text-(--foreground)/30">•</span>
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-(--foreground)/50 flex items-center gap-1">
              <Sparkles size={11} className="text-luxury-gold" />
              Intelligence Suite
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-(--foreground)">
            Revenue &amp; Procurement <span className="text-luxury-gold">Analytics</span>
          </h1>
          <p className="text-xs sm:text-sm text-(--foreground)/60 mt-1">
            Historical financial yields, time-bound order cadence, and flacon procurement forensics.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchOrders}
            disabled={isRefreshing}
            className="p-3 rounded-xl border border-(--foreground)/15 hover:border-luxury-gold bg-(--card) text-(--foreground)/70 hover:text-luxury-gold transition-all shadow-sm"
            title="Refresh Live Analytics"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin text-luxury-gold' : ''} />
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            disabled={orders.length === 0}
            className="px-4 py-3 rounded-xl border border-(--foreground)/15 hover:border-luxury-gold bg-(--card) text-(--foreground)/80 hover:text-luxury-gold text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm disabled:opacity-40"
          >
            <Download size={14} />
            <span>Export Manifest CSV</span>
          </button>
        </div>
      </div>

      {/* Calendar Filter & Granularity Control Bar */}
      <div className="relative z-30 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-(--card) border border-(--foreground)/10 shadow-lg">
        {/* Left: Interactive Calendar Trigger */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
            className="w-full sm:w-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-(--foreground)/3 hover:bg-luxury-gold/10 border border-(--foreground)/15 hover:border-luxury-gold text-xs font-semibold text-(--foreground) transition-all shadow-xs group"
          >
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-luxury-gold/15 text-luxury-gold group-hover:scale-110 transition-transform">
                <CalendarIcon size={16} />
              </span>
              <div className="text-left">
                <span className="text-[9px] uppercase tracking-wider text-(--foreground)/50 block font-bold">
                  Active Timeframe
                </span>
                <span className="text-xs sm:text-sm font-serif font-bold text-luxury-gold">
                  {dateRange.label || `${dateRange.startDate} → ${dateRange.endDate}`}
                </span>
              </div>
            </div>
            <CalendarRange size={15} className="text-(--foreground)/40 group-hover:text-luxury-gold transition-colors ml-2" />
          </button>

          {/* Calendar Dropdown Widget */}
          <AnalyticsCalendar 
            dateRange={dateRange}
            onChange={(newRange) => {
              setDateRange(newRange);
              setIsCalendarOpen(false);
            }}
            isOpen={isCalendarOpen}
            onClose={() => setIsCalendarOpen(false)}
          />
        </div>

        {/* Right: Granularity & Metric Toggles */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Granularity switch: Daily / Monthly / Yearly */}
          <div className="flex items-center bg-(--foreground)/5 p-1 rounded-xl border border-(--foreground)/10 text-[10px] font-bold uppercase tracking-wider">
            <button
              type="button"
              onClick={() => setGranularity('daily')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                granularity === 'daily' 
                  ? 'bg-luxury-gold text-black shadow-md' 
                  : 'text-(--foreground)/60 hover:text-(--foreground)'
              }`}
            >
              Daily
            </button>
            <button
              type="button"
              onClick={() => setGranularity('monthly')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                granularity === 'monthly' 
                  ? 'bg-luxury-gold text-black shadow-md' 
                  : 'text-(--foreground)/60 hover:text-(--foreground)'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setGranularity('yearly')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                granularity === 'yearly' 
                  ? 'bg-luxury-gold text-black shadow-md' 
                  : 'text-(--foreground)/60 hover:text-(--foreground)'
              }`}
            >
              Yearly
            </button>
          </div>

          {/* Metric switch: Combined / Revenue / Orders */}
          <div className="hidden sm:flex items-center bg-(--foreground)/5 p-1 rounded-xl border border-(--foreground)/10 text-[10px] font-bold uppercase tracking-wider">
            <button
              type="button"
              onClick={() => setMetricView('combined')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                metricView === 'combined' 
                  ? 'bg-luxury-gold text-black shadow-md' 
                  : 'text-(--foreground)/60 hover:text-(--foreground)'
              }`}
            >
              Combined
            </button>
            <button
              type="button"
              onClick={() => setMetricView('revenue')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                metricView === 'revenue' 
                  ? 'bg-luxury-gold text-black shadow-md' 
                  : 'text-(--foreground)/60 hover:text-(--foreground)'
              }`}
            >
              Yield Only
            </button>
            <button
              type="button"
              onClick={() => setMetricView('volume')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                metricView === 'volume' 
                  ? 'bg-luxury-gold text-black shadow-md' 
                  : 'text-(--foreground)/60 hover:text-(--foreground)'
              }`}
            >
              Volume Only
            </button>
          </div>

          {/* Chart Style Switch: Area / Bar */}
          <div className="flex items-center bg-(--foreground)/5 p-1 rounded-xl border border-(--foreground)/10 text-[10px] font-bold uppercase tracking-wider">
            <button
              type="button"
              onClick={() => setChartStyle('area')}
              className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                chartStyle === 'area' 
                  ? 'bg-luxury-gold text-black shadow-md' 
                  : 'text-(--foreground)/60 hover:text-(--foreground)'
              }`}
              title="Continuous Curve"
            >
              <TrendingUp size={12} />
              Curve
            </button>
            <button
              type="button"
              onClick={() => setChartStyle('bar')}
              className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                chartStyle === 'bar' 
                  ? 'bg-luxury-gold text-black shadow-md' 
                  : 'text-(--foreground)/60 hover:text-(--foreground)'
              }`}
              title="Bar Histogram"
            >
              <BarChart3 size={12} />
              Bars
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards Grid (Synchronized to Selected Calendar Period) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Earnings */}
        <div className="p-5 sm:p-6 rounded-2xl bg-(--card) border border-luxury-gold/30 hover:border-luxury-gold shadow-md transition-all group flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-luxury-gold/15 border border-luxury-gold/30 flex items-center justify-center text-luxury-gold group-hover:scale-110 transition-transform">
              <Coins size={18} />
            </div>
            <span className="text-[9px] font-mono text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <TrendingUp size={11} />
              Total Earning
            </span>
          </div>
          <div className="mt-4">
            <p className="text-2xl sm:text-3xl font-serif text-(--foreground) font-bold">
              ৳{summary.totalRevenue.toLocaleString()}
            </p>
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-(--foreground)/60 mt-1">
              Gross Yield ({dateRange.label || 'Selected Span'})
            </p>
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-5 sm:p-6 rounded-2xl bg-(--card) border border-(--foreground)/10 hover:border-luxury-gold/40 shadow-md transition-all group flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <ClipboardList size={18} />
            </div>
            <span className="text-[9px] font-mono text-blue-400 font-bold uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
              Total Orders
            </span>
          </div>
          <div className="mt-4">
            <p className="text-2xl sm:text-3xl font-serif text-(--foreground) font-bold">
              {summary.totalOrders}
            </p>
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-(--foreground)/60 mt-1">
              Completed Procurements
            </p>
          </div>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="p-5 sm:p-6 rounded-2xl bg-(--card) border border-(--foreground)/10 hover:border-luxury-gold/40 shadow-md transition-all group flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <Percent size={18} />
            </div>
            <span className="text-[9px] font-mono text-purple-400 font-bold uppercase tracking-widest bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
              AOV Metric
            </span>
          </div>
          <div className="mt-4">
            <p className="text-2xl sm:text-3xl font-serif text-(--foreground) font-bold">
              ৳{summary.aov.toLocaleString()}
            </p>
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-(--foreground)/60 mt-1">
              Average Cart Value
            </p>
          </div>
        </div>

        {/* Fulfillment Rate & Peak Yield */}
        <div className="p-5 sm:p-6 rounded-2xl bg-(--card) border border-(--foreground)/10 hover:border-luxury-gold/40 shadow-md transition-all group flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <CheckCircle2 size={18} />
            </div>
            <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              {summary.fulfillmentRate}% Fulfilled
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xl sm:text-2xl font-serif text-luxury-gold font-bold truncate">
              {summary.highestDay.amount > 0 ? `৳${summary.highestDay.amount.toLocaleString()}` : '—'}
            </p>
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-(--foreground)/60 mt-1 truncate">
              Peak Day: {summary.highestDay.date}
            </p>
          </div>
        </div>
      </div>

      {/* Main Interactive Recharts Graph */}
      <div className="p-6 sm:p-8 rounded-3xl bg-(--card) border border-(--foreground)/10 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-luxury-gold animate-pulse" />
              <h2 className="text-lg font-serif font-bold text-(--foreground)">
                Yield &amp; Cadence Trajectory
              </h2>
            </div>
            <p className="text-xs text-(--foreground)/60 mt-1">
              Interactive timeline visualization. Hover over data nodes to inspect granular procurements.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-luxury-gold inline-block" />
              <span className="text-[11px] font-medium text-(--foreground)/70">Revenue (৳)</span>
            </div>
            {(metricView === 'combined' || metricView === 'volume') && (
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                <span className="text-[11px] font-medium text-(--foreground)/70">Order Volume</span>
              </div>
            )}
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="w-full h-[360px] sm:h-[420px] pt-4">
          {!isMounted || isLoading ? (
            <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
              <div className="w-10 h-10 border-3 border-luxury-gold/30 border-t-luxury-gold rounded-full animate-spin" />
              <p className="text-[10px] uppercase tracking-[0.25em] text-(--foreground)/50">
                Synthesizing Chart Telemetry...
              </p>
            </div>
          ) : chartData.length === 0 ? (
            <div className="w-full h-full flex flex-col items-center justify-center space-y-3 text-center p-6 border border-dashed border-(--foreground)/15 rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-(--foreground)/5 flex items-center justify-center text-(--foreground)/30">
                <CalendarIcon size={24} />
              </div>
              <p className="text-sm font-serif font-bold text-(--foreground)">
                No Historical Manifests in Selected Span
              </p>
              <p className="text-xs text-(--foreground)/50 max-w-sm">
                There are no orders recorded between {dateRange.startDate} and {dateRange.endDate}. Adjust the calendar range above to view activity.
              </p>
              <button
                type="button"
                onClick={() => {
                  setDateRange({
                    startDate: '2024-01-01',
                    endDate: new Date().toISOString().slice(0, 10),
                    label: 'All Historical Data',
                    mode: 'range'
                  });
                }}
                className="mt-2 px-4 py-2 rounded-xl bg-luxury-gold text-black text-[10px] font-bold uppercase tracking-wider hover:brightness-110 transition-all"
              >
                View All History
              </button>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d4af37" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#d4af37" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid 
                  strokeDasharray="3 3" 
                  vertical={false} 
                  stroke="currentColor" 
                  className="opacity-10" 
                />

                <XAxis 
                  dataKey="key" 
                  stroke="currentColor" 
                  className="text-[10px] text-(--foreground)/50"
                  tickLine={false}
                  axisLine={{ stroke: 'currentColor', opacity: 0.15 }}
                />

                {/* Left Y-Axis: Revenue */}
                {(metricView === 'combined' || metricView === 'revenue') && (
                  <YAxis 
                    yAxisId="revenue"
                    stroke="currentColor" 
                    className="text-[10px] text-(--foreground)/50"
                    tickLine={false}
                    axisLine={{ stroke: 'currentColor', opacity: 0.15 }}
                    tickFormatter={(val) => `৳${val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}`}
                  />
                )}

                {/* Right Y-Axis: Volume */}
                {(metricView === 'combined' || metricView === 'volume') && (
                  <YAxis 
                    yAxisId="volume"
                    orientation={metricView === 'volume' ? 'left' : 'right'}
                    stroke="currentColor" 
                    className="text-[10px] text-(--foreground)/50"
                    tickLine={false}
                    axisLine={{ stroke: 'currentColor', opacity: 0.15 }}
                    allowDecimals={false}
                  />
                )}

                {/* Luxury Tooltip */}
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as AggregatedDataPoint;
                      return (
                        <div className="bg-luxury-charcoal/95 backdrop-blur-xl border border-luxury-gold/40 p-4 rounded-2xl shadow-2xl text-white space-y-2 min-w-[200px]">
                          <p className="text-[10px] uppercase font-bold tracking-widest text-luxury-gold border-b border-white/10 pb-1.5 flex items-center justify-between">
                            <span>{data.fullDate}</span>
                            <Sparkles size={11} className="text-luxury-gold" />
                          </p>
                          <div className="space-y-1 pt-1 text-xs">
                            <div className="flex justify-between items-center">
                              <span className="text-white/60">Revenue:</span>
                              <span className="font-serif font-bold text-luxury-gold text-sm">৳{data.revenue.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-white/60">Procurements:</span>
                              <span className="font-mono font-bold text-emerald-400">{data.volume} orders</span>
                            </div>
                            <div className="flex justify-between items-center pt-1 border-t border-white/10">
                              <span className="text-[10px] text-white/50">Average Value:</span>
                              <span className="text-[11px] font-mono text-white/80">৳{data.aov.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                {/* Revenue Rendering (Area or Bar) */}
                {(metricView === 'combined' || metricView === 'revenue') && (
                  chartStyle === 'area' ? (
                    <Area 
                      yAxisId="revenue"
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#d4af37" 
                      strokeWidth={2.5}
                      fillOpacity={1} 
                      fill="url(#revenueGradient)" 
                      name="Revenue (৳)"
                      dot={{ r: 3, fill: '#d4af37' }}
                      activeDot={{ r: 6, fill: '#d4af37', stroke: '#fff', strokeWidth: 2 }}
                    />
                  ) : (
                    <Bar 
                      yAxisId="revenue"
                      dataKey="revenue" 
                      fill="#d4af37" 
                      radius={[6, 6, 0, 0]}
                      name="Revenue (৳)"
                    />
                  )
                )}

                {/* Volume Rendering (Line or Bar) */}
                {(metricView === 'combined' || metricView === 'volume') && (
                  metricView === 'volume' && chartStyle === 'bar' ? (
                    <Bar 
                      yAxisId="volume"
                      dataKey="volume" 
                      fill="#10b981" 
                      radius={[6, 6, 0, 0]}
                      name="Order Volume"
                    />
                  ) : (
                    <Line 
                      yAxisId="volume"
                      type="monotone" 
                      dataKey="volume" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={{ r: 3, fill: '#10b981' }}
                      activeDot={{ r: 5, fill: '#10b981', stroke: '#fff', strokeWidth: 1.5 }}
                      name="Order Volume"
                    />
                  )
                )}
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Detailed Order Metrics Table (Below Chart) */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-serif font-bold text-(--foreground)">
              Underlying Procurement Manifest
            </h3>
            <p className="text-xs text-(--foreground)/60 mt-0.5">
              Specific customer orders comprising revenue for the selected timeframe ({filteredTableOrders.length} records).
            </p>
          </div>

          {/* Search & Status Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--foreground)/40" size={15} />
              <input
                type="text"
                placeholder="Filter name, email, manifest..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="w-full bg-(--card) border border-(--foreground)/15 rounded-xl py-2.5 pl-10 pr-3 text-xs text-(--foreground) focus:border-luxury-gold focus:outline-none transition-all placeholder:text-(--foreground)/40 shadow-xs"
              />
            </div>

            <div className="relative w-full sm:w-44">
              <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--foreground)/40" size={14} />
              <select
                value={tableStatus}
                onChange={(e) => setTableStatus(e.target.value)}
                className="w-full bg-(--card) border border-(--foreground)/15 rounded-xl py-2.5 pl-9 pr-7 text-xs text-(--foreground) focus:border-luxury-gold focus:outline-none transition-all appearance-none cursor-pointer shadow-xs"
              >
                <option value="all">All Statuses</option>
                <option value="Delivered">Delivered</option>
                <option value="Shipped">Shipped</option>
                <option value="Processing">Processing</option>
                <option value="Received">Received</option>
                <option value="Pending">Pending</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-(--card) rounded-2xl border border-(--foreground)/10 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[720px]">
              <thead>
                <tr className="border-b border-(--foreground)/10 bg-(--foreground)/3 text-(--foreground)/60 text-[9px] uppercase tracking-[0.2em] font-bold">
                  <th className="px-6 py-4">Manifest ID</th>
                  <th className="px-6 py-4">Date &amp; Time</th>
                  <th className="px-6 py-4">Consignee</th>
                  <th className="px-6 py-4">Selection</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--foreground)/5 text-xs">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-(--foreground)/40 uppercase tracking-widest text-[10px]">
                      Loading manifests...
                    </td>
                  </tr>
                ) : filteredTableOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-(--foreground)/40 uppercase tracking-widest text-[10px]">
                      No orders found matching the filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTableOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-(--foreground)/2 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-luxury-gold text-xs font-bold">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-(--foreground)/60 text-[11px]">
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                        <span className="block text-[9px] text-(--foreground)/40">
                          {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-(--foreground) text-xs">{order.delivery_name}</p>
                        <p className="text-[10px] text-luxury-gold/80 font-mono truncate max-w-[180px]">
                          {order.delivery_email || order.whatsapp_number || 'Direct Guest'}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-(--foreground)/70 text-xs max-w-[200px] truncate">
                        {(() => {
                          try {
                            if (order.product_name.startsWith('[') && order.product_name.endsWith(']')) {
                              const items = JSON.parse(order.product_name);
                              return items.length > 1 
                                ? `${items[0].name} + ${items.length - 1} more`
                                : items[0].name;
                            }
                            return order.product_name;
                          } catch {
                            return order.product_name;
                          }
                        })()}
                        <span className="block text-[9px] text-luxury-gold/70 font-mono">
                          {order.variant_size} x {order.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-luxury-gold text-sm">
                          ৳{order.total_price?.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg border border-(--foreground)/15 hover:border-luxury-gold text-xs font-semibold text-(--foreground)/70 hover:text-luxury-gold hover:bg-(--foreground)/5 transition-all inline-flex items-center gap-1"
                        >
                          <Eye size={12} />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
}
