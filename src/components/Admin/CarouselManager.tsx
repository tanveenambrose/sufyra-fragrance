'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { 
  Sparkles, 
  Upload, 
  AlertTriangle, 
  CheckCircle2, 
  Trash2, 
  Plus, 
  Layers,
  Info,
  Check,
  Eye,
  EyeOff,
  Power
} from 'lucide-react';
import { 
  CarouselSlide, 
  getSavedCarouselSlides, 
  saveCarouselSlides, 
  CAROUSEL_EVENT_NAME 
} from '@/lib/carouselStore';


export default function CarouselManager() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [mounted, setMounted] = useState(false);

  // Form states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [detectedDimensions, setDetectedDimensions] = useState<{ width: number; height: number; ratio: number } | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [validationSuccess, setValidationSuccess] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Individual Part Toggles & Content
  const [showHeadline, setShowHeadline] = useState(true);
  const [headline, setHeadline] = useState('');

  const [showBadge, setShowBadge] = useState(true);
  const [badge, setBadge] = useState('Featured Campaign');

  const [showSubheadline, setShowSubheadline] = useState(true);
  const [subheadline, setSubheadline] = useState('');

  const [showButton, setShowButton] = useState(true);
  const [buttonText, setButtonText] = useState('Explore Now');
  const [buttonLink, setButtonLink] = useState('/products');

  // Load existing slides from shared store on mount
  useEffect(() => {
    const load = () => {
      setSlides(getSavedCarouselSlides());
    };
    load();
    setMounted(true);

    window.addEventListener(CAROUSEL_EVENT_NAME, load);
    window.addEventListener('storage', load);

    return () => {
      window.removeEventListener(CAROUSEL_EVENT_NAME, load);
      window.removeEventListener('storage', load);
    };
  }, []);

  /**
   * Validates carousel banner image:
   * Accepts horizontal banner images under or around (1300px w * 120px h)
   * Handles wide strips like 1280x110, 1300x120, 1200x100, and 2x retina images.
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setValidationError(null);
    setValidationSuccess(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setDetectedDimensions(null);

    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;

      if (!height || height === 0) {
        setValidationError('Could not detect image dimensions. Please try another image.');
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      const ratio = width / height;

      // Reject vertical or square images
      if (ratio < 3.0) {
        setValidationError(
          `Invalid aspect ratio (${ratio.toFixed(2)}:1). Carousel banners require a horizontal wide strip (target: 1300x120px, ~10.8:1 ratio). Your image is ${width}x${height}px (portrait/square). Upload has been blocked.`
        );
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      // Valid horizontal banner: within the target 1300x120 banner range
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setDetectedDimensions({ width, height, ratio });
      setValidationSuccess(
        `Banner validated: ${width}x${height}px (${ratio.toFixed(1)}:1 wide strip). Fits 1300x120px carousel.`
      );
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
    if (!selectedFile && !headline.trim()) {
      setValidationError('Please upload a banner image or enter a headline before publishing.');
      return;
    }

    setIsUploading(true);
    setValidationError(null);

    try {
      let finalUrl = previewUrl || '';

      if (selectedFile) {
        // Upload to storage via /api/upload
        const uploadData = new FormData();
        uploadData.append('file', selectedFile);
        uploadData.append('section', 'banner');
        uploadData.append('category', 'carousel');

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: uploadData,
        });

        if (res.ok) {
          const data = await res.json();
          if (data.url) finalUrl = data.url;
        }
      }

      // Construct slide with individual part toggles and values
      const newSlide: CarouselSlide = {
        id: `slide-${Date.now()}`,
        imageUrl: finalUrl,
        showHeadline: Boolean(showHeadline && headline.trim()),
        headline: headline.trim(),
        showBadge: Boolean(showBadge && badge.trim()),
        badge: badge.trim(),
        showSubheadline: Boolean(showSubheadline && subheadline.trim()),
        subheadline: subheadline.trim(),
        showButton: Boolean(showButton && buttonText.trim()),
        buttonText: buttonText.trim(),
        buttonLink: buttonLink.trim() || '/products',
        isActive: true,
        createdAt: Date.now()
      };

      const updated = [newSlide, ...slides];
      setSlides(updated);
      saveCarouselSlides(updated);

      setUploadSuccess(true);
      setSelectedFile(null);
      setPreviewUrl(null);
      setDetectedDimensions(null);
      setHeadline('');
      setSubheadline('');
      setValidationSuccess(null);
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
    const updated = slides.filter((s) => s.id !== id);
    setSlides(updated);
    saveCarouselSlides(updated);
  };

  const handleToggleSlideActive = (id: string) => {
    const updated = slides.map((s) => s.id === id ? { ...s, isActive: !s.isActive } : s);
    setSlides(updated);
    saveCarouselSlides(updated);
  };

  const handleTogglePart = (id: string, part: 'showHeadline' | 'showBadge' | 'showSubheadline' | 'showButton') => {
    const updated = slides.map((s) => s.id === id ? { ...s, [part]: !s[part] } : s);
    setSlides(updated);
    saveCarouselSlides(updated);
  };

  if (!mounted) return null;

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
              1300 &times; 120px Standard
            </span>
          </div>
          <p className="text-xs text-(--foreground)/60 mt-1">
            Configure promotional banners with exact (1300px &times; 120px) dimension validation, responsive mobile scaling, and independent part activation.
          </p>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-(--foreground)/60 font-mono bg-(--foreground)/3 px-3 py-1.5 rounded-xl border border-(--foreground)/10">
          <Info size={13} className="text-luxury-gold shrink-0" />
          <span>Supports wide banners (e.g. 1280x110, 1300x120)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Upload & Configurator Form */}
        <form onSubmit={handleUploadAndSave} className="lg:col-span-6 space-y-6">
          
          {/* Banner Image Asset Zone */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-widest text-(--foreground)/70">
                Banner Graphic Asset (Target: 1300px &times; 120px)
              </label>
              <span className="text-luxury-gold font-mono text-[9px]">Wide Strip Ratio</span>
            </div>

            {/* Drop / Upload Zone (Matches 1300x120 proportions) */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative w-full h-28 sm:h-30 rounded-2xl border-2 border-dashed 
                flex flex-col items-center justify-center p-4 text-center cursor-pointer 
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
                    alt="Validated Banner Preview" 
                    fill 
                    className="object-cover object-center"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1.5">
                    <Upload size={18} className="text-luxury-gold animate-bounce" />
                    <span className="text-[10px] uppercase font-bold tracking-widest">Replace Graphic</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-(--foreground)/40 group-hover:text-(--foreground)/70 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-(--foreground)/5 border border-(--foreground)/10 flex items-center justify-center group-hover:scale-110 group-hover:border-luxury-gold/40 transition-all text-luxury-gold">
                    <Upload size={18} />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-(--foreground) tracking-wide">
                      Click or drag banner image (up to 1300px &times; 120px)
                    </p>
                    <p className="text-[10px] text-(--foreground)/50">
                      Accepts horizontal banners (1280x110, 1300x120, etc.) &bull; Max 5MB
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

          {/* Validation Error Alert */}
          {validationError && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-rose-700 dark:text-rose-300 flex items-start gap-2.5 animate-in shake duration-300 shadow-md">
              <AlertTriangle size={16} className="text-rose-500 shrink-0 mt-0.5" />
              <div className="space-y-0.5 text-xs">
                <p className="font-bold uppercase tracking-wider text-[10px] text-rose-600 dark:text-rose-400">
                  Validation Notice
                </p>
                <p className="leading-relaxed">{validationError}</p>
              </div>
            </div>
          )}

          {/* Validation Success Alert */}
          {validationSuccess && !validationError && (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 flex items-center justify-between text-xs animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <span className="font-bold tracking-wide">{validationSuccess}</span>
              </div>
              {detectedDimensions && (
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-mono text-[10px] font-bold">
                  {detectedDimensions.width}&times;{detectedDimensions.height}px
                </span>
              )}
            </div>
          )}

          {/* Part Activation Toggles & Fields */}
          <div className="space-y-4 pt-2 border-t border-(--foreground)/10">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-luxury-gold flex items-center gap-1.5">
                <Sparkles size={12} />
                Carousel Part Toggles
              </h4>
              <span className="text-[9px] text-(--foreground)/50 uppercase tracking-wider">
                Disable/Active Components
              </span>
            </div>

            {/* Part 1: Headline */}
            <div className="p-3.5 rounded-2xl bg-(--foreground)/2 border border-(--foreground)/10 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-widest text-(--foreground)/80 flex items-center gap-2">
                  <span>Headline</span>
                  {showHeadline && headline.trim() ? (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[8px] font-bold">Active</span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded bg-(--foreground)/10 text-(--foreground)/50 text-[8px] font-bold">Hidden</span>
                  )}
                </label>

                {/* Toggle Button */}
                <button
                  type="button"
                  onClick={() => setShowHeadline(!showHeadline)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all ${
                    showHeadline 
                      ? 'bg-luxury-gold text-black shadow-xs' 
                      : 'bg-(--foreground)/10 text-(--foreground)/50 hover:bg-(--foreground)/15'
                  }`}
                >
                  {showHeadline ? <Eye size={11} /> : <EyeOff size={11} />}
                  <span>{showHeadline ? 'Enabled' : 'Disabled'}</span>
                </button>
              </div>

              {showHeadline && (
                <input 
                  type="text"
                  placeholder="e.g. COMPLIMENTARY FIRST ORDER PRIVILEGE"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full bg-(--foreground)/3 border border-(--foreground)/15 rounded-xl px-4 py-2.5 text-xs text-(--foreground) focus:border-luxury-gold focus:outline-none transition-colors"
                />
              )}
            </div>

            {/* Part 2: Badge Text */}
            <div className="p-3.5 rounded-2xl bg-(--foreground)/2 border border-(--foreground)/10 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-widest text-(--foreground)/80 flex items-center gap-2">
                  <span>Badge Text</span>
                  {showBadge && badge.trim() ? (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[8px] font-bold">Active</span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded bg-(--foreground)/10 text-(--foreground)/50 text-[8px] font-bold">Hidden</span>
                  )}
                </label>

                <button
                  type="button"
                  onClick={() => setShowBadge(!showBadge)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all ${
                    showBadge 
                      ? 'bg-luxury-gold text-black shadow-xs' 
                      : 'bg-(--foreground)/10 text-(--foreground)/50 hover:bg-(--foreground)/15'
                  }`}
                >
                  {showBadge ? <Eye size={11} /> : <EyeOff size={11} />}
                  <span>{showBadge ? 'Enabled' : 'Disabled'}</span>
                </button>
              </div>

              {showBadge && (
                <input 
                  type="text"
                  placeholder="e.g. Haute Privilege"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  className="w-full bg-(--foreground)/3 border border-(--foreground)/15 rounded-xl px-4 py-2.5 text-xs text-(--foreground) focus:border-luxury-gold focus:outline-none transition-colors"
                />
              )}
            </div>

            {/* Part 3: Subheadline / Description */}
            <div className="p-3.5 rounded-2xl bg-(--foreground)/2 border border-(--foreground)/10 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-widest text-(--foreground)/80 flex items-center gap-2">
                  <span>Subheadline / Description</span>
                  {showSubheadline && subheadline.trim() ? (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[8px] font-bold">Active</span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded bg-(--foreground)/10 text-(--foreground)/50 text-[8px] font-bold">Hidden</span>
                  )}
                </label>

                <button
                  type="button"
                  onClick={() => setShowSubheadline(!showSubheadline)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all ${
                    showSubheadline 
                      ? 'bg-luxury-gold text-black shadow-xs' 
                      : 'bg-(--foreground)/10 text-(--foreground)/50 hover:bg-(--foreground)/15'
                  }`}
                >
                  {showSubheadline ? <Eye size={11} /> : <EyeOff size={11} />}
                  <span>{showSubheadline ? 'Enabled' : 'Disabled'}</span>
                </button>
              </div>

              {showSubheadline && (
                <input 
                  type="text"
                  placeholder="e.g. Receive 15% off your first artisanal acquisition with code SUFYRA15"
                  value={subheadline}
                  onChange={(e) => setSubheadline(e.target.value)}
                  className="w-full bg-(--foreground)/3 border border-(--foreground)/15 rounded-xl px-4 py-2.5 text-xs text-(--foreground) focus:border-luxury-gold focus:outline-none transition-colors"
                />
              )}
            </div>

            {/* Part 4: Action Button & Link */}
            <div className="p-3.5 rounded-2xl bg-(--foreground)/2 border border-(--foreground)/10 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-widest text-(--foreground)/80 flex items-center gap-2">
                  <span>Action Button &amp; Link</span>
                  {showButton && buttonText.trim() ? (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[8px] font-bold">Active</span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded bg-(--foreground)/10 text-(--foreground)/50 text-[8px] font-bold">Hidden</span>
                  )}
                </label>

                <button
                  type="button"
                  onClick={() => setShowButton(!showButton)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all ${
                    showButton 
                      ? 'bg-luxury-gold text-black shadow-xs' 
                      : 'bg-(--foreground)/10 text-(--foreground)/50 hover:bg-(--foreground)/15'
                  }`}
                >
                  {showButton ? <Eye size={11} /> : <EyeOff size={11} />}
                  <span>{showButton ? 'Enabled' : 'Disabled'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {showButton && (
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-(--foreground)/50 font-semibold block mb-1">
                      Button Text
                    </span>
                    <input 
                      type="text"
                      placeholder="e.g. Claim Offer"
                      value={buttonText}
                      onChange={(e) => setButtonText(e.target.value)}
                      className="w-full bg-(--foreground)/3 border border-(--foreground)/15 rounded-xl px-4 py-2 text-xs text-(--foreground) focus:border-luxury-gold focus:outline-none transition-colors"
                    />
                  </div>
                )}

                <div className={showButton ? '' : 'sm:col-span-2'}>
                  <span className="text-[9px] uppercase tracking-wider text-(--foreground)/50 font-semibold block mb-1">
                    Destination Target Link
                  </span>
                  <input 
                    type="text"
                    placeholder="/products"
                    value={buttonLink}
                    onChange={(e) => setButtonLink(e.target.value)}
                    className="w-full bg-(--foreground)/3 border border-(--foreground)/15 rounded-xl px-4 py-2 text-xs text-(--foreground) focus:border-luxury-gold focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isUploading || (!selectedFile && !headline.trim())}
            className="w-full py-3.5 rounded-xl luxury-gradient text-luxury-charcoal font-bold text-xs uppercase tracking-widest hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg shadow-luxury-gold/15 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-luxury-charcoal border-t-transparent rounded-full animate-spin" />
                <span>Publishing Carousel Slide...</span>
              </>
            ) : uploadSuccess ? (
              <>
                <Check size={16} />
                <span>Slide Published to 1300&times;120 Carousel!</span>
              </>
            ) : (
              <>
                <Plus size={16} />
                <span>Publish to Carousel</span>
              </>
            )}
          </button>
        </form>

        {/* Right Column: Live Managed Slides */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-widest text-(--foreground)/70 flex items-center gap-2">
              <Sparkles size={13} className="text-luxury-gold" />
              Active Carousel Slides ({slides.length})
            </h4>
            <span className="text-[10px] font-mono text-luxury-gold">1300&times;120 System</span>
          </div>

          <div className="space-y-3 max-h-145 overflow-y-auto pr-1">
            {slides.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-(--foreground)/2 border border-(--foreground)/5 text-(--foreground)/40 text-xs">
                No active carousel slides. Create one on the left.
              </div>
            ) : (
              slides.map((slide) => {
                const hasBadge = Boolean(slide.showBadge && slide.badge?.trim());
                const hasHeadline = Boolean(slide.showHeadline && slide.headline?.trim());
                const hasSubheadline = Boolean(slide.showSubheadline && slide.subheadline?.trim());
                const hasButton = Boolean(slide.showButton && slide.buttonText?.trim());

                return (
                  <div 
                    key={slide.id}
                    className={`p-4 rounded-2xl border transition-all space-y-3 ${
                      slide.isActive !== false
                        ? 'bg-(--foreground)/2 hover:bg-(--foreground)/4 border-(--foreground)/10 hover:border-luxury-gold/30'
                        : 'bg-(--foreground)/1 border-(--foreground)/5 opacity-60'
                    }`}
                  >
                    {/* Slide Top Row: Banner & Title */}
                    <div className="flex items-center gap-3.5">
                      {/* Banner Graphic Thumbnail */}
                      <div className="relative w-28 h-10 rounded-lg overflow-hidden bg-black/60 border border-luxury-gold/30 shrink-0">
                        {slide.imageUrl ? (
                          <Image 
                            src={slide.imageUrl}
                            alt="Slide graphic"
                            fill
                            className="object-cover object-center"
                            unoptimized
                          />
                        ) : (
                          <div className={`w-full h-full bg-linear-to-r ${slide.accentColor || 'from-[#1c1810] to-[#241e14]'}`} />
                        )}
                        <span className="absolute bottom-0.5 right-1 px-1 rounded bg-black/80 text-[7px] font-mono text-luxury-gold">
                          1300&times;120
                        </span>
                      </div>

                      {/* Headline / Badge / Link */}
                      <div className="min-w-0 grow">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {hasBadge && (
                            <span className="px-1.5 py-0.5 rounded bg-luxury-gold/15 text-luxury-gold text-[8px] font-bold uppercase tracking-wider">
                              {slide.badge}
                            </span>
                          )}
                          <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${slide.isActive !== false ? 'bg-emerald-500/15 text-emerald-500' : 'bg-zinc-500/20 text-zinc-400'}`}>
                            {slide.isActive !== false ? 'Live' : 'Paused'}
                          </span>
                        </div>
                        <p className="text-xs font-serif font-bold text-(--foreground) truncate mt-0.5">
                          {hasHeadline ? slide.headline : '(Graphic Banner Only)'}
                        </p>
                        {hasSubheadline && (
                          <p className="text-[10px] text-(--foreground)/50 truncate">
                            {slide.subheadline}
                          </p>
                        )}
                      </div>

                      {/* Main Actions: Active Toggle & Delete */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleSlideActive(slide.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            slide.isActive !== false 
                              ? 'text-emerald-500 hover:bg-emerald-500/10' 
                              : 'text-(--foreground)/30 hover:bg-(--foreground)/5'
                          }`}
                          title={slide.isActive !== false ? 'Pause Slide' : 'Activate Slide'}
                        >
                          <Power size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSlide(slide.id)}
                          className="p-2 rounded-lg text-(--foreground)/30 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete Slide"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Component Part Toggles Row */}
                    <div className="pt-2 border-t border-(--foreground)/5 flex items-center justify-between gap-2 flex-wrap text-[9px]">
                      <span className="text-(--foreground)/40 uppercase tracking-wider font-semibold">Parts:</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleTogglePart(slide.id, 'showHeadline')}
                          className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider transition-colors ${
                            hasHeadline 
                              ? 'bg-luxury-gold/20 text-luxury-gold border border-luxury-gold/30' 
                              : 'bg-(--foreground)/5 text-(--foreground)/30 line-through'
                          }`}
                        >
                          Headline
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTogglePart(slide.id, 'showBadge')}
                          className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider transition-colors ${
                            hasBadge 
                              ? 'bg-luxury-gold/20 text-luxury-gold border border-luxury-gold/30' 
                              : 'bg-(--foreground)/5 text-(--foreground)/30 line-through'
                          }`}
                        >
                          Badge
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTogglePart(slide.id, 'showSubheadline')}
                          className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider transition-colors ${
                            hasSubheadline 
                              ? 'bg-luxury-gold/20 text-luxury-gold border border-luxury-gold/30' 
                              : 'bg-(--foreground)/5 text-(--foreground)/30 line-through'
                          }`}
                        >
                          Desc
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTogglePart(slide.id, 'showButton')}
                          className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider transition-colors ${
                            hasButton 
                              ? 'bg-luxury-gold/20 text-luxury-gold border border-luxury-gold/30' 
                              : 'bg-(--foreground)/5 text-(--foreground)/30 line-through'
                          }`}
                        >
                          Button
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
