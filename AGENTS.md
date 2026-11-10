<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:vibesec-rules -->
# VibeSec Security & Architecture Guardrails

- **Zero-Leakage Secrets**: Never expose `COMPANY_PASSWORD`, `RESEND_API_KEY`, or `CLOUDINARY_API_SECRET` in client components or browser bundles. Keep public variables strictly prefixed with `NEXT_PUBLIC_`.
- **Database & RLS Integrity**: Maintain Row-Level Security on Supabase. Filter private operations by session `auth.uid() = id`. Never allow client-side role elevation.
- **Dependency Safety**: Only use verified packages. Never install unvetted or AI-hallucinated npm libraries.
- **Route Safety**: Sanitize and validate all incoming data on API routes (`/api/upload`, `/api/send-order-email`, `/api/orders/[id]/status`).
<!-- END:vibesec-rules -->

<!-- BEGIN:ui-skill-rules -->
# Sufyra Fragrance UI/UX Standards

- Follow the Luxury Perfumery Design System (`.agents/skills/ui-design/SKILL.md`): Obsidian black backgrounds, champagne gold accents (`#d4af37`), smooth micro-interactions, responsive mobile-first cart & checkout flows.
<!-- END:ui-skill-rules -->
