---
name: ui-design
description: >-
  Specialized UI/UX design and frontend development guidelines for Sufyra Fragrance.
  Use when designing, building, or refining pages, components, modals, and interactive
  elements to maintain a high-end luxury aesthetic, flawless responsiveness, and smooth micro-interactions.
---

# Sufyra Fragrance — Luxury UI/UX Design System Skill

This skill guides the AI assistant in designing and coding production-grade, visually stunning user interfaces matching the **Sufyra Fragrance** brand identity.

---

## 1. Aesthetic & Brand Palette

Sufyra Fragrance represents artisanal luxury perfumery. Interfaces must evoke elegance, sophistication, and meticulous craftsmanship:

- **Dominant Dark Tones**:
  - Background: Obsidian Black (`#050505` to `#0a0a0a`)
  - Elevated Cards / Surfaces: `#111827` or `rgba(255, 255, 255, 0.03)` with backdrop blur
  - Subtle Borders: `rgba(212, 175, 55, 0.15)` to `rgba(255, 255, 255, 0.08)`
- **Accent & Gold Tones**:
  - Primary Accent: Champagne / Artisanal Gold (`#d4af37`, `#f59e0b`, `text-amber-400`)
  - Glow Effects: Subtle radial gradients with low opacity gold tints (`rgba(212, 175, 55, 0.08)`)
- **Light Theme Harmony**:
  - Use `next-themes` CSS variables for smooth light/dark switching.
  - Light mode surfaces: Soft ivory/alabaster background, dark slate typography, warm gold highlights.

---

## 2. Component Design Principles

### Product Cards & Grids
- Use consistent aspect ratios for perfume bottles (`aspect-[3/4]` or `aspect-square`).
- Include hover zoom or subtle scale transforms on images (`group-hover:scale-105 transition-transform duration-500`).
- Display variant chips (e.g. `3ml`, `6ml`, `12ml`) with active/selected state indicators.
- Badges (e.g. "Exclusive", "Sale", "Artisanal") must use pill shapes with delicate borders.

### Interactive Modals & Drawers
- Backdrop blur (`backdrop-blur-md bg-black/60`).
- Clean entrance and exit animations (smooth fade and slide).
- Sticky checkout action bars on mobile viewports for effortless single-thumb purchasing.

### Cart & Purchase Flow
- Real-time price calculation including delivery zone adjustments (`Inside Dhaka` vs `Outside Dhaka`).
- Clear visual breakdown of subtotal, delivery fee, and grand total in BDT (`৳`).
- Form validation with clear inline error messaging.

---

## 3. Technical Standards (Tailwind CSS 4 & React 19)

- **Utility Classes**: Use modern Tailwind CSS classes. Avoid arbitrary values when standard design tokens exist.
- **Client Components**: Only mark components with `'use client'` when they utilize browser state, hooks, or event listeners.
- **Performance & Media**: Always use Next.js `<Image />` component with proper `sizes`, `priority` on above-the-fold heroes, and placeholder states.
- **Icons**: Standardize on `lucide-react` with consistent stroke widths (`strokeWidth={1.5}` or `1.75`).
- **Accessibility**: Include accessible `aria-label` attributes on icon-only buttons, maintain high contrast for readable text, and support keyboard focus rings.

