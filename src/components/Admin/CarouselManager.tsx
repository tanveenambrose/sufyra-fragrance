'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { 
  Sparkles, 
  Upload, 
  AlertTriangle, 
  CheckCircle2, 
  Trash2, 
  Plus, 
  Layers,
  Info
} from 'lucide-react';

export interface CarouselSlideItem {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
  aspectRatio: string;
}

// 16:9 Widescreen aspect ratio requirement with a small tolerance margin
const TARGET_ASPECT_RATIO = 16 / 9; // ~1.7778
const ASPECT_RATIO_TOLERANCE = 0.05; // Small margin of error allowed

export default function CarouselManager() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Default carousel slides
  const [slides, setSlides] = useState<CarouselSlideItem[]>([
    {
      id: 'slide-1',
      title: 'COMPLIMENTARY FIRST ORDER PRIVILEGE',
      subtitle: 'Receive 15% off your first artisanal flacon acquisition with code SUFYRA15',
      badge: 'Haute Privilege',
      imageUrl: '/cluster-oud.png',
      ctaText: 'Claim Offer',
      ctaLink: '/products',
      aspectRatio: '16:9'
    },
    {
      id: 'slide-2',
      title: 'HAUTE CONCENTRATION • 12+ HOUR SILLAGE',
      subtitle: 'Alcohol-free organic perfume oils hand-poured in small artisanal batches',
      badge: '100% Pure Oils',
      imageUrl: '/cluster-modern.png',
      ctaText: 'View Attars',
      ctaLink: '/products',
      aspectRatio: '16:9'
    }
  ]);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [detectedDimensions, setDetectedDimensions] = useState<{ width: number; height: number; ratio: number } | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // New slide form fields
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [badge, setBadge] = useState('Featured Campaign');
  const [ctaText, setCtaText] = useState('Explore Now');
  const [ctaLink, setCtaLink] = useState('/products');

  /**
   * Reads the selected file into an Image object, calculates its aspect ratio,
   * and verifies it against the 16:9 constant within the defined margin of error.
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset previous states
    setValidationError(null);
    setUploadSuccess(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    setDetectedDimensions(null);

    // Read the selected file into an HTML Image object
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;

      if (!height || height === 0) {
        setValidationError('Invalid image dimensions detected. Upload blocked.');
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      const actualRatio = width / height;
      const ratioDifference = Math.abs(actualRatio - TARGET_ASPECT_RATIO);

      // Check if ratio matches 16:9 within tolerance
      if (ratioDifference > ASPECT_RATIO_TOLERANCE) {
        // Block upload and display explicit required dimensions error
        const ratioText = actualRatio.toFixed(2);
        setValidationError(
          `Invalid aspect ratio (${ratioText}:1). Carousel banners require a strict 16:9 widescreen ratio (e.g., 1920x1080 or 1280x720). Your image is ${width}x${height}px. Upload has been blocked.`
        );
        setSelectedFile(null);
        setPreviewUrl(null);
        setDetectedDimensions({ width, height, ratio: actualRatio });
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      // Valid 16:9 aspect ratio: allow proceeding to upload
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setDetectedDimensions({ width, height, ratio: actualRatio });
      setValidationError(null);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setValidationError('Failed to parse image file. Please provide a valid JPG, PNG, or WebP image.');
      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    img.src = objectUrl;
  };

  const handleUploadAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setValidationError('Please select a 16:9 banner image before submitting.');
      return;
    }

    setIsUploading(true);
    setValidationError(null);

    try {
      // 1. Upload to Cloudinary storage via /api/upload
      const uploadData = new FormData();
      uploadData.append('file', selectedFile);
      uploadData.append('section', 'banner');
      uploadData.append('category', 'carousel');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData,
      });

      let finalUrl = previewUrl || '';
      if (res.ok) {
        const data = await res.json();
        if (data.url) finalUrl = data.url;
      }

      // 2. Add new carousel item
      const newSlide: CarouselSlideItem = {
        id: `slide-${Date.now()}`,
        title: title || 'New Carousel Announcement',
        subtitle: subtitle || 'Limited luxury curation and bespoke offers',
        badge: badge || 'Exclusive Offer',
        imageUrl: finalUrl,
        ctaText: ctaText || 'Explore Now',
        ctaLink: ctaLink || '/products',
        aspectRatio: '16:9'
      };

      setSlides((prev) => [newSlide, ...prev]);
      setUploadSuccess(true);
      setSelectedFile(null);
      setPreviewUrl(null);
      setDetectedDimensions(null);
      setTitle('');
      setSubtitle('');
      if (fileInputRef.current) fileInputRef.current.value = '';

      setTimeout(() => setUploadSuccess(false), 4000);
    } catch (err) {
      console.error('Error saving carousel banner:', err);
      setValidationError('Failed to upload banner to storage. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteSlide = (id: string) => {
    setSlides((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="bg-(--card) rounded-3xl border border-luxury-gold/25 overflow-hidden shadow-xl p-6 sm:p-8 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-(--foreground)/10 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <Layers size={18} className="text-luxury-gold" />
            <h3 className="text-xl font-serif font-bold text-(--foreground)">
              Carousel &amp; Banner Management
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-luxury-gold/15 border border-luxury-gold/30 text-luxury-gold text-[9px] font-bold uppercase tracking-wider">
              16:9 Standard
            </span>
          </div>
          <p className="text-xs text-(--foreground)/60 mt-1">
            Manage auto-rotating promotional slides with automatic dimension and aspect ratio verification.
          </p>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-(--foreground)/50 font-mono bg-(--foreground)/3 px-3 py-1.5 rounded-xl border border-(--foreground)/5">
          <Info size={13} className="text-luxury-gold shrink-0" />
          <span>Strict Validation: 16:9 Aspect Ratio</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Upload & Validator Form */}
        <form onSubmit={handleUploadAndSave} className="lg:col-span-6 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-(--foreground)/70 flex items-center justify-between">
              <span>Banner Image Asset (16:9 Widescreen)</span>
              <span className="text-luxury-gold font-mono text-[9px]">Target: 1.78:1</span>
            </label>

            {/* Drop / Upload Zone */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative aspect-16/9 w-full rounded-2xl border-2 border-dashed 
                flex flex-col items-center justify-center p-6 text-center cursor-pointer 
                transition-all overflow-hidden group
                ${validationError 
                  ? 'border-rose-500/60 bg-rose-500/5' 
                  : previewUrl 
                  ? 'border-luxury-gold bg-black/40' 
                  : 'border-(--foreground)/15 hover:border-luxury-gold/50 bg-(--foreground)/2 hover:bg-(--foreground)/4'
                }
              `}
            >
              {previewUrl ? (
                <>
                  <Image 
                    src={previewUrl} 
                    alt="Validated Carousel Preview" 
                    fill 
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-2">
                    <Upload size={20} className="text-luxury-gold animate-bounce" />
                    <span className="text-[10px] uppercase font-bold tracking-widest">Change Banner</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3 text-(--foreground)/40 group-hover:text-(--foreground)/70 transition-colors">
                  <div className="w-12 h-12 rounded-2xl bg-(--foreground)/5 border border-(--foreground)/10 flex items-center justify-center group-hover:scale-110 group-hover:border-luxury-gold/40 transition-all text-luxury-gold">
                    <Upload size={20} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-(--foreground) tracking-wide">
                      Click or drag image to validate &amp; upload
                    </p>
                    <p className="text-[10px] text-(--foreground)/50 tracking-wider">
                      Required: 16:9 ratio (e.g. 1920x1080, 1280x720) • Max 5MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            <input 
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/avif"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Validation Error Notification */}
          {validationError && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-rose-700 dark:text-rose-300 flex items-start gap-3 animate-in shake duration-300 shadow-md">
              <AlertTriangle size={18} className="text-rose-500 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <p className="font-bold uppercase tracking-wider text-[10px] text-rose-600 dark:text-rose-400">
                  Aspect Ratio Validation Blocked
                </p>
                <p className="leading-relaxed">{validationError}</p>
              </div>
            </div>
          )}

          {/* Validation Success Notification */}
          {detectedDimensions && !validationError && previewUrl && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 flex items-center justify-between text-xs animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <span className="font-bold tracking-wide">
                  Valid 16:9 Ratio Verified ({detectedDimensions.width} &times; {detectedDimensions.height}px)
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-mono text-[10px] font-bold">
                {detectedDimensions.ratio.toFixed(2)}:1
              </span>
            </div>
          )}

          {/* Slide Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-(--foreground)/60 ml-1">
                Headline
              </label>
              <input 
                type="text"
                placeholder="e.g. EXCLUSIVE ATTAR VAULT"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-(--foreground)/3 border border-(--foreground)/15 rounded-xl px-4 py-2.5 text-xs text-(--foreground) focus:border-luxury-gold focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-(--foreground)/60 ml-1">
                Badge Text
              </label>
              <input 
                type="text"
                placeholder="e.g. Limited Edition"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                className="w-full bg-(--foreground)/3 border border-(--foreground)/15 rounded-xl px-4 py-2.5 text-xs text-(--foreground) focus:border-luxury-gold focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-(--foreground)/60 ml-1">
              Subheadline / Description
            </label>
            <input 
              type="text"
              placeholder="e.g. Hand-crafted organic perfume oils steeped in aged sandalwood"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full bg-(--foreground)/3 border border-(--foreground)/15 rounded-xl px-4 py-2.5 text-xs text-(--foreground) focus:border-luxury-gold focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-(--foreground)/60 ml-1">
                Button Text
              </label>
              <input 
                type="text"
                placeholder="e.g. Shop Collection"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                className="w-full bg-(--foreground)/3 border border-(--foreground)/15 rounded-xl px-4 py-2.5 text-xs text-(--foreground) focus:border-luxury-gold focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-(--foreground)/60 ml-1">
                Button Target Link
              </label>
              <input 
                type="text"
                placeholder="/products"
                value={ctaLink}
                onChange={(e) => setCtaLink(e.target.value)}
                className="w-full bg-(--foreground)/3 border border-(--foreground)/15 rounded-xl px-4 py-2.5 text-xs text-(--foreground) focus:border-luxury-gold focus:outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!selectedFile || isUploading || !!validationError}
            className="w-full py-3.5 rounded-xl luxury-gradient text-luxury-charcoal font-bold text-xs uppercase tracking-widest hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg shadow-luxury-gold/15 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-luxury-charcoal border-t-transparent rounded-full animate-spin" />
                <span>Uploading Validated Banner...</span>
              </>
            ) : uploadSuccess ? (
              <>
                <CheckCircle2 size={16} />
                <span>Banner Added Successfully!</span>
              </>
            ) : (
              <>
                <Plus size={16} />
                <span>Publish 16:9 Carousel Slide</span>
              </>
            )}
          </button>
        </form>

        {/* Right Column: Active Carousel Slides List */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-widest text-(--foreground)/70 flex items-center gap-2">
              <Sparkles size={13} className="text-luxury-gold" />
              Active Carousel Slides ({slides.length})
            </h4>
            <span className="text-[10px] font-mono text-luxury-gold">Live Rotation</span>
          </div>

          <div className="space-y-3.5 max-h-125 overflow-y-auto pr-1">
            {slides.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-(--foreground)/2 border border-(--foreground)/5 text-(--foreground)/40 text-xs">
                No active carousel banners. Upload a 16:9 banner to publish.
              </div>
            ) : (
              slides.map((slide) => (
                <div 
                  key={slide.id}
                  className="p-4 rounded-2xl bg-(--foreground)/2 hover:bg-(--foreground)/4 border border-(--foreground)/10 hover:border-luxury-gold/30 transition-all flex items-center gap-4 group"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-16/9 w-28 rounded-xl overflow-hidden bg-black/40 border border-luxury-gold/20 shrink-0">
                    <Image 
                      src={slide.imageUrl}
                      alt={slide.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                    <div className="absolute top-1 left-1 px-1 py-0.5 rounded bg-black/70 text-[8px] font-mono text-luxury-gold font-bold">
                      16:9
                    </div>
                  </div>

                  {/* Info */}
                  <div className="min-w-0 grow space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-luxury-gold/15 text-luxury-gold text-[8px] font-bold uppercase tracking-wider">
                        {slide.badge}
                      </span>
                    </div>
                    <p className="text-xs font-serif font-bold text-(--foreground) truncate">
                      {slide.title}
                    </p>
                    <p className="text-[10px] text-(--foreground)/50 truncate">
                      {slide.subtitle}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleDeleteSlide(slide.id)}
                      className="p-2 rounded-lg text-(--foreground)/30 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Remove Slide"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
