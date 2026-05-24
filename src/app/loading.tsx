export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[var(--background)]">
      {/* Decorative concentric rings */}
      <div className="relative w-32 h-32 mb-12">
        <div className="absolute inset-0 rounded-full border border-luxury-gold/10 animate-[ring-spin_4s_linear_infinite]" />
        <div className="absolute inset-3 rounded-full border border-luxury-gold/20 animate-[ring-spin-reverse_3s_linear_infinite]" />
        <div className="absolute inset-6 rounded-full border border-luxury-gold/30 animate-[ring-spin_2s_linear_infinite]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-luxury-gold shadow-[0_0_20px_rgba(197,160,89,0.5)] animate-pulse" />
        </div>
      </div>

      {/* Brand name with shimmer */}
      <h1 className="text-4xl md:text-5xl font-serif bg-gradient-to-r from-luxury-gold/80 via-[var(--foreground)] to-luxury-gold/80 bg-[length:200%_auto] animate-[shimmer_3s_ease-in-out_infinite] bg-clip-text text-transparent">
        Sufyra
      </h1>

      {/* Tagline */}
      <p className="mt-4 text-[10px] md:text-xs uppercase tracking-[0.5em] text-[var(--foreground)]/30 font-medium animate-[fade-in-up_1s_ease-out_0.5s_both]">
        Experience the Essence of Luxury
      </p>

      {/* Loading bar */}
      <div className="mt-12 w-32 h-[1px] bg-[var(--foreground)]/5 overflow-hidden rounded-full">
        <div className="w-full h-full bg-gradient-to-r from-transparent via-luxury-gold to-transparent animate-[loading-bar_2s_ease-in-out_infinite]" />
      </div>
    </div>
  );
}
