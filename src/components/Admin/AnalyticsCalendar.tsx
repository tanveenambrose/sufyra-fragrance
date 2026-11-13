'use client';

import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Check, 
  Sparkles,
  CalendarDays,
  CalendarRange
} from 'lucide-react';

export type CalendarSelectionMode = 'single' | 'range' | 'month';

export interface DateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  label?: string;
  mode: CalendarSelectionMode;
}

interface AnalyticsCalendarProps {
  dateRange: DateRange;
  onChange: (range: DateRange) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function AnalyticsCalendar({
  dateRange,
  onChange,
  isOpen,
  onClose
}: AnalyticsCalendarProps) {
  // Calendar viewing state
  const initialDate = useMemo(() => {
    return dateRange.startDate ? new Date(dateRange.startDate) : new Date();
  }, [dateRange.startDate]);

  const [viewYear, setViewYear] = useState<number>(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(initialDate.getMonth()); // 0-11
  const [activeMode, setActiveMode] = useState<CalendarSelectionMode>(dateRange.mode || 'range');
  const [rangeStart, setRangeStart] = useState<string | null>(dateRange.startDate || null);
  const [rangeEnd, setRangeEnd] = useState<string | null>(dateRange.endDate || null);
  const [hoverDate, setHoverDate] = useState<string | null>(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const shortDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Helper: format Date to YYYY-MM-DD
  const toDateString = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Quick Presets
  const handlePreset = (presetKey: string) => {
    const now = new Date();
    const todayStr = toDateString(now);

    let start = todayStr;
    let end = todayStr;
    let label = '';
    let mode: CalendarSelectionMode = 'range';

    switch (presetKey) {
      case 'today': {
        start = todayStr;
        end = todayStr;
        label = 'Today';
        mode = 'single';
        break;
      }
      case 'yesterday': {
        const y = new Date(now);
        y.setDate(y.getDate() - 1);
        start = toDateString(y);
        end = start;
        label = 'Yesterday';
        mode = 'single';
        break;
      }
      case 'last7': {
        const d7 = new Date(now);
        d7.setDate(d7.getDate() - 6);
        start = toDateString(d7);
        end = todayStr;
        label = 'Last 7 Days';
        mode = 'range';
        break;
      }
      case 'last30': {
        const d30 = new Date(now);
        d30.setDate(d30.getDate() - 29);
        start = toDateString(d30);
        end = todayStr;
        label = 'Last 30 Days';
        mode = 'range';
        break;
      }
      case 'thisMonth': {
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        start = toDateString(firstDay);
        end = toDateString(lastDay);
        label = `${months[now.getMonth()]} ${now.getFullYear()}`;
        mode = 'month';
        break;
      }
      case 'lastMonth': {
        const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
        start = toDateString(firstDay);
        end = toDateString(lastDay);
        label = `${months[firstDay.getMonth()]} ${firstDay.getFullYear()}`;
        mode = 'month';
        break;
      }
      case 'thisYear': {
        const firstDay = new Date(now.getFullYear(), 0, 1);
        const lastDay = new Date(now.getFullYear(), 11, 31);
        start = toDateString(firstDay);
        end = toDateString(lastDay);
        label = `Year ${now.getFullYear()}`;
        mode = 'range';
        break;
      }
      case 'allTime': {
        start = '2024-01-01';
        end = todayStr;
        label = 'All Historical Data';
        mode = 'range';
        break;
      }
      default:
        return;
    }

    setRangeStart(start);
    setRangeEnd(end);
    setActiveMode(mode);
    const sDate = new Date(start);
    setViewYear(sDate.getFullYear());
    setViewMonth(sDate.getMonth());

    onChange({
      startDate: start,
      endDate: end,
      label,
      mode
    });
  };

  // Calendar Day Click Handler
  const handleDayClick = (dayStr: string) => {
    if (activeMode === 'single') {
      setRangeStart(dayStr);
      setRangeEnd(dayStr);
      onChange({
        startDate: dayStr,
        endDate: dayStr,
        label: new Date(dayStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        mode: 'single'
      });
      return;
    }

    // Range mode
    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(dayStr);
      setRangeEnd(null);
    } else {
      // rangeStart is set, rangeEnd is null
      if (dayStr < rangeStart) {
        // Clicked date is earlier than start
        setRangeStart(dayStr);
        setRangeEnd(null);
      } else {
        setRangeEnd(dayStr);
        onChange({
          startDate: rangeStart,
          endDate: dayStr,
          label: `${new Date(rangeStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(dayStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
          mode: 'range'
        });
      }
    }
  };

  // Select Entire Month
  const handleSelectMonth = (monthIdx: number, year: number) => {
    const firstDay = new Date(year, monthIdx, 1);
    const lastDay = new Date(year, monthIdx + 1, 0);
    const startStr = toDateString(firstDay);
    const endStr = toDateString(lastDay);

    setRangeStart(startStr);
    setRangeEnd(endStr);
    setViewMonth(monthIdx);
    setViewYear(year);

    onChange({
      startDate: startStr,
      endDate: endStr,
      label: `${months[monthIdx]} ${year}`,
      mode: 'month'
    });
  };

  // Month navigation
  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // Build grid days
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const days: Array<{
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
    }> = [];

    const todayStr = toDateString(new Date());

    // Previous month padding days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const d = new Date(viewMonth === 0 ? viewYear - 1 : viewYear, viewMonth === 0 ? 11 : viewMonth - 1, dayNum);
      days.push({
        dateStr: toDateString(d),
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: toDateString(d) === todayStr
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(viewYear, viewMonth, i);
      const str = toDateString(d);
      days.push({
        dateStr: str,
        dayNumber: i,
        isCurrentMonth: true,
        isToday: str === todayStr
      });
    }

    // Next month padding days to complete 35 or 42 grid cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(viewMonth === 11 ? viewYear + 1 : viewYear, viewMonth === 11 ? 0 : viewMonth + 1, i);
      days.push({
        dateStr: toDateString(d),
        dayNumber: i,
        isCurrentMonth: false,
        isToday: toDateString(d) === todayStr
      });
    }

    return days;
  }, [viewYear, viewMonth]);

  if (!isOpen) return null;

  return (
    <div className="relative z-50 animate-in fade-in zoom-in-95 duration-200">
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-xs lg:hidden"
        onClick={onClose}
      />
      <div className="absolute right-0 top-2 mt-2 w-full sm:w-[480px] md:w-[620px] bg-(--card) border border-luxury-gold/30 rounded-3xl p-5 sm:p-6 shadow-2xl text-(--foreground) overflow-hidden">
        {/* Luxury Top Ambient Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-luxury-gold/5 rounded-full blur-3xl pointer-events-none" />

        {/* Header & Modes */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-(--foreground)/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-luxury-gold/15 text-luxury-gold">
                <CalendarIcon size={14} />
              </span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-luxury-gold">
                Analytics Timeframe Selector
              </h3>
            </div>
            <p className="text-[10px] text-(--foreground)/60 mt-0.5">
              Select an exact date, full calendar month, or custom temporal range.
            </p>
          </div>

          {/* Mode Selector Tabs */}
          <div className="flex bg-(--foreground)/5 p-1 rounded-xl border border-(--foreground)/10 text-[10px] font-bold uppercase tracking-wider">
            <button
              type="button"
              onClick={() => setActiveMode('range')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeMode === 'range' 
                  ? 'bg-luxury-gold text-black shadow-md' 
                  : 'text-(--foreground)/60 hover:text-(--foreground)'
              }`}
            >
              <CalendarRange size={11} />
              Range
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('single')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeMode === 'single' 
                  ? 'bg-luxury-gold text-black shadow-md' 
                  : 'text-(--foreground)/60 hover:text-(--foreground)'
              }`}
            >
              <CalendarDays size={11} />
              Single Day
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('month')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeMode === 'month' 
                  ? 'bg-luxury-gold text-black shadow-md' 
                  : 'text-(--foreground)/60 hover:text-(--foreground)'
              }`}
            >
              <Sparkles size={11} />
              Month
            </button>
          </div>
        </div>

        {/* Quick Presets Bar */}
        <div className="py-3 border-b border-(--foreground)/10">
          <p className="text-[9px] uppercase tracking-widest text-(--foreground)/40 font-bold mb-2">
            Intelligence Presets
          </p>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'today', label: 'Today' },
              { id: 'yesterday', label: 'Yesterday' },
              { id: 'last7', label: 'Last 7 Days' },
              { id: 'last30', label: 'Last 30 Days' },
              { id: 'thisMonth', label: 'This Month' },
              { id: 'lastMonth', label: 'Last Month' },
              { id: 'thisYear', label: 'This Year' },
              { id: 'allTime', label: 'All History' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePreset(p.id)}
                className="px-2.5 py-1 rounded-lg text-[10px] font-semibold tracking-wider uppercase bg-(--foreground)/3 hover:bg-luxury-gold/15 hover:text-luxury-gold border border-(--foreground)/10 hover:border-luxury-gold/40 transition-all"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Calendar Body */}
        {activeMode === 'month' ? (
          /* Month Picker Grid */
          <div className="py-4 space-y-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-bold uppercase tracking-wider text-luxury-gold">
                Select Full Month ({viewYear})
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewYear(viewYear - 1)}
                  className="p-1.5 rounded-lg border border-(--foreground)/15 hover:border-luxury-gold hover:text-luxury-gold transition-colors text-xs"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="text-xs font-serif font-bold text-luxury-gold px-2">
                  {viewYear}
                </span>
                <button
                  type="button"
                  onClick={() => setViewYear(viewYear + 1)}
                  className="p-1.5 rounded-lg border border-(--foreground)/15 hover:border-luxury-gold hover:text-luxury-gold transition-colors text-xs"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
              {months.map((m, idx) => {
                const isSelected = dateRange.mode === 'month' && 
                  new Date(dateRange.startDate).getMonth() === idx && 
                  new Date(dateRange.startDate).getFullYear() === viewYear;

                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleSelectMonth(idx, viewYear)}
                    className={`p-3 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all border ${
                      isSelected
                        ? 'bg-luxury-gold text-black border-luxury-gold font-bold shadow-lg shadow-luxury-gold/20'
                        : 'bg-(--foreground)/3 border-(--foreground)/10 text-(--foreground)/80 hover:border-luxury-gold/40 hover:text-luxury-gold hover:bg-(--foreground)/5'
                    }`}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Day Calendar Grid */
          <div className="py-4 space-y-3">
            {/* Month & Year Navigation Header */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="font-serif text-base font-bold text-(--foreground)">
                  {months[viewMonth]} <span className="text-luxury-gold">{viewYear}</span>
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={prevMonth}
                  className="p-2 rounded-xl border border-(--foreground)/15 hover:border-luxury-gold hover:text-luxury-gold transition-all"
                  title="Previous Month"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const now = new Date();
                    setViewMonth(now.getMonth());
                    setViewYear(now.getFullYear());
                  }}
                  className="px-2.5 py-1 rounded-lg border border-(--foreground)/15 hover:border-luxury-gold text-[9px] uppercase font-bold tracking-wider hover:text-luxury-gold transition-all"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={nextMonth}
                  className="p-2 rounded-xl border border-(--foreground)/15 hover:border-luxury-gold hover:text-luxury-gold transition-all"
                  title="Next Month"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Weekday Labels */}
            <div className="grid grid-cols-7 text-center">
              {shortDays.map((d) => (
                <div key={d} className="text-[10px] uppercase font-bold tracking-wider text-(--foreground)/40 py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {calendarDays.map((day) => {
                const isSelectedStart = rangeStart === day.dateStr;
                const isSelectedEnd = rangeEnd === day.dateStr;
                const isInSelectedRange = Boolean(
                  rangeStart && rangeEnd && day.dateStr > rangeStart && day.dateStr < rangeEnd
                );
                const isInHoverRange = Boolean(
                  rangeStart && !rangeEnd && hoverDate && hoverDate > rangeStart && day.dateStr > rangeStart && day.dateStr <= hoverDate
                );

                const isHighlight = isSelectedStart || isSelectedEnd;

                return (
                  <button
                    key={day.dateStr}
                    type="button"
                    onClick={() => handleDayClick(day.dateStr)}
                    onMouseEnter={() => {
                      if (activeMode === 'range' && rangeStart && !rangeEnd) {
                        setHoverDate(day.dateStr);
                      }
                    }}
                    className={`
                      relative h-9 rounded-lg flex items-center justify-center font-medium transition-all text-xs
                      ${!day.isCurrentMonth ? 'text-(--foreground)/20 opacity-50' : 'text-(--foreground)'}
                      ${isHighlight 
                        ? 'bg-luxury-gold text-black font-bold shadow-md shadow-luxury-gold/30 z-10' 
                        : isInSelectedRange
                        ? 'bg-luxury-gold/20 text-(--foreground) font-semibold'
                        : isInHoverRange
                        ? 'bg-luxury-gold/15 text-(--foreground)'
                        : 'hover:bg-luxury-gold/10 hover:text-luxury-gold'
                      }
                    `}
                  >
                    <span>{day.dayNumber}</span>
                    {day.isToday && !isHighlight && (
                      <span className="absolute bottom-1 w-1 h-1 rounded-full bg-luxury-gold" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer with Manual Inputs & Apply */}
        <div className="pt-4 border-t border-(--foreground)/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <span className="text-[8px] uppercase tracking-wider text-(--foreground)/40 font-bold">Start Date</span>
              <input 
                type="date"
                value={rangeStart || dateRange.startDate}
                onChange={(e) => {
                  const val = e.target.value;
                  setRangeStart(val);
                  if (val && rangeEnd && val <= rangeEnd) {
                    onChange({
                      startDate: val,
                      endDate: rangeEnd,
                      mode: 'range'
                    });
                  }
                }}
                className="bg-(--foreground)/5 border border-(--foreground)/15 rounded-lg px-2 py-1 text-[11px] text-(--foreground) focus:border-luxury-gold outline-none"
              />
            </div>
            <span className="text-(--foreground)/30 self-end pb-1.5">&rarr;</span>
            <div className="flex flex-col">
              <span className="text-[8px] uppercase tracking-wider text-(--foreground)/40 font-bold">End Date</span>
              <input 
                type="date"
                value={rangeEnd || dateRange.endDate}
                onChange={(e) => {
                  const val = e.target.value;
                  setRangeEnd(val);
                  if (val && rangeStart && val >= rangeStart) {
                    onChange({
                      startDate: rangeStart,
                      endDate: val,
                      mode: 'range'
                    });
                  }
                }}
                className="bg-(--foreground)/5 border border-(--foreground)/15 rounded-lg px-2 py-1 text-[11px] text-(--foreground) focus:border-luxury-gold outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={() => handlePreset('allTime')}
              className="px-3 py-2 rounded-xl border border-(--foreground)/15 hover:border-luxury-gold text-(--foreground)/70 hover:text-luxury-gold text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
            >
              <RotateCcw size={11} />
              Reset
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-luxury-gold text-black text-[10px] font-bold uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-1.5 shadow-md shadow-luxury-gold/20"
            >
              <Check size={12} />
              Apply Range
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
