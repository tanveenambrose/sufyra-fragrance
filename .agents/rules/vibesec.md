# VibeSec: Security Guardrails for AI-Assisted Vibe Coding

This rule enforces strict security, architectural integrity, and data safety across the codebase during rapid AI-assisted development.

---

## 1. Secrets & Environment Zero-Leakage
- **Client vs. Server Isolation**: Never import or reference private secrets (e.g. `COMPANY_PASSWORD`, `RESEND_API_KEY`, `CLOUDINARY_API_SECRET`, Supabase service role keys) in `'use client'` files or client bundles.
- **Prefix Guard**: Only values intended for the public browser must use the `NEXT_PUBLIC_` prefix.
- **Error Sanitization**: Never leak raw database error messages, stack traces, or authentication payloads in public API response JSON. Log errors securely server-side and return generic, user-safe messages.
- **Git Protection**: Ensure `.env`, `.env.local`, and sensitive credential dumps are always gitignored. Never hardcode credentials in mock data or fallback variables.

---

## 2. Supabase & Database Security (RLS)
- **RLS Enforced**: Always assume Row Level Security (RLS) is active on every database table.
- **Ownership Scoping**: Queries targeting private resources (such as orders, user profiles, receipts) MUST filter by `auth.uid()` or validated session user ID (`.eq('user_id', user.id)`).
- **Role Tampering Protection**: Never allow client-side requests to set administrative roles (e.g. `role: 'admin'`). Role assignment must only occur through verified server-side triggers or admin RPCs.
- **Transaction Safety**: Handle conflicting database constraints gracefully using `ON CONFLICT` or update operations rather than blind inserts.

---

## 3. Dependency Integrity & Anti-Slopsquatting
- **No Hallucinated Packages**: Before installing or importing any new third-party library, verify that it is an established, official npm package.
- **Minimal Surface**: Prefer existing standard libraries and already installed dependencies (`lucide-react`, `zustand`, `nodemailer`, `@supabase/ssr`, `cloudinary`) before adding new packages.

---

## 4. API Route & Server Actions Security
- **MIME & Payload Validation**: On file upload routes (such as `/api/upload`), strictly validate file MIME types (e.g., `image/jpeg`, `image/png`, `image/webp`), restrict file size limits, and sanitize uploaded filenames.
- **Email Injection Prevention**: In email dispatch routes (`/api/send-order-email`, `/api/orders/[id]/status`), sanitize and encode dynamic user strings before embedding them into HTML templates to prevent HTML/template injection.
- **Authorization Verification**: Restrict privileged administrative endpoints (e.g., changing order status, modifying catalog items) by validating the user's email or role against the authorized admin list on the server.

---

## 5. Next.js 16 App Router Conventions
- **Asynchronous Dynamic APIs**: In Next.js 16, dynamic APIs such as `cookies()`, `headers()`, and route handler `params` are asynchronous promises. Always `await` them before access.
- **Turbopack & Build Health**: Ensure every route compiles cleanly with zero TypeScript errors (`npx tsc --noEmit`).

