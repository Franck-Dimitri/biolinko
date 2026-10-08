---
name: biolinko-design
description: Biolinko's visual design system and UI conventions (Tailwind tokens, typography, cards, buttons, badges, seller theme color, French copy, FCFA amounts, lucide icons, sonner toasts). Use whenever creating or restyling any page or component in resources/js — dashboard, admin, storefront, checkout, landing.
---

# Biolinko Design System

Biolinko is a social-commerce SaaS for African sellers (prices in FCFA, UI in French). The look is **clean, premium, "editorial" SaaS**: white surfaces, slate neutrals, bold tight typography, and the brand yellow used as an accent, never as a wall of color.

Before designing, open one or two existing pages of the same area (e.g. `resources/js/Pages/Products/Index.jsx` for seller dashboard, `resources/js/Pages/Storefront/` for the public shop) and match them.

## Tokens (from tailwind.config.js and real usage)

- **Brand**: `#FFCC00` (`brand-yellow` / `bg-[#FFCC00]`), hover `#E6B800`, light `#FFF8D6`, dark `#18181B`. Yellow surfaces take dark text (`text-slate-950`).
- **Neutrals**: text `slate-950` (titles), `slate-900/800/700` (body), `slate-500/400` (secondary/meta). Surfaces `bg-white`, `bg-slate-50`, `bg-slate-100`; dark blocks `bg-slate-950`.
- **Status**: success `emerald-600` on `emerald-100`; warning/premium `amber-*`; danger `rose-600`.
- **Fonts**: `font-sans` = Nunito (body); `font-display`/`font-heading` = Montserrat (titles). `font-mono` for counts, IDs, amounts in badges.
- **Borders**: `border border-slate-200` or `border-slate-200/80`; separators `border-slate-100`.
- **Radii**: inputs/buttons `rounded-xl`, cards `rounded-2xl`, hero/feature cards `rounded-3xl`, pills/avatars `rounded-full`.
- **Shadows**: subtle by default (`shadow-2xs`, `shadow-xs`); `shadow-md` on hover; `shadow-2xl` only for overlays (drawers, modals).

## Typography scale

- Page title: `text-2xl font-extrabold tracking-tight text-slate-950`
- Section title: `text-base`/`text-lg font-extrabold tracking-tight`
- Body: `text-sm font-medium text-slate-700`
- Meta/labels: `text-xs` or `text-[11px] font-medium text-slate-500`; eyebrow labels `text-[10px] font-bold uppercase tracking-wider text-slate-400`
- Heavy emphasis (KPIs, prices): `font-black` / `font-extrabold`

## Components

- **Card**: `bg-white border border-slate-200/80 rounded-2xl shadow-2xs p-5`.
- **Primary button**: `bg-[#FFCC00] hover:bg-[#E6B800] text-slate-950 font-bold rounded-xl px-4 py-2.5 active:scale-95 transition-all`. Secondary: white with `border-slate-200`. Dark CTA: `bg-slate-950 text-white`.
- **Icon button**: `p-2 rounded-2xl text-slate-400 hover:text-slate-900 hover:bg-slate-200/60 active:scale-95` + `aria-label` in French.
- **Badge/pill**: `px-2 py-0.5 rounded-full text-xs font-bold` + status colors.
- **Icons**: `lucide-react` only, `w-4 h-4`/`w-5 h-5`, often `stroke-[2.5]` inside colored tiles.
- **Toasts**: `sonner` (`toast.success(...)`), already mounted in the layouts.
- Reuse `Components/` (Modal, Dropdown, TextInput, InputError, PrimaryButton…) and `Components/Storefront/*` before writing new primitives.

## Storefront (public shop) rules

- Each store has its own `store.theme_color` (fallback `#FFCC00`). Use it via inline `style={{ backgroundColor: primaryColor, color: primaryTextColor }}` and compute text contrast with the YIQ helper already in `Components/Storefront/CartDrawer.jsx` (`getContrastColor`) — reuse/extract it rather than duplicating.
- Never hard-code the brand yellow on storefront elements that should follow the seller's theme.
- Mobile-first: most buyers arrive from WhatsApp/Instagram on phones. Design at 375 px first, thumb-reachable CTAs, sticky cart/checkout actions.

## Copy & formatting

- All UI text in **French**, friendly and direct ("Mon Panier", "Ajouter au panier").
- Amounts: `Number(x).toLocaleString()} FCFA` (no decimals). Pluralize labels (`article`/`articles`).
- Plans: Starter, Pro, Growth, Business — check current prices in code (`app/Models/User.php`, `app/Http/Middleware/EnsureUserHasPlan.php`, subscription page) rather than assuming.


## Public pages (landing, storefront, product, cart) — refonte 2026-10

These pages follow a lighter direction than the dashboards. Match `resources/js/Pages/Welcome.jsx`, `Pages/Storefront/*`, `Components/Storefront/*`:

- **Colors**: `brand-yellow` (#FFCC00) as the brand, `brand-ink` (#2B2620, warm) for text instead of black, `brand-muted` for secondary text, `brand-cream` / `brand-sand` / `brand-yellowLight` for section backgrounds, `brand-line` for borders. **Avoid black blocks and black buttons**: primary buttons are yellow (or the seller's `theme_color`) with ink text; secondary buttons are white with a light ink border. Footers are `brand-sand`, not dark.
- **Weights**: Nunito. H1 `font-extrabold` (landing hero only) or `font-bold`; section titles `font-bold`; card titles `font-semibold`/`font-medium`; body `font-normal`. No `font-black`, no uppercase tracking labels.
- **Radii**: small and varied — `rounded-md` for buttons/inputs/badges, `rounded-lg` for cards and images, `rounded-xl` only for large hero frames. `rounded-full` only for avatars, story circles and floating WhatsApp button.
- **Storefront theming**: use `contrastColor()` from `Components/Storefront/theme.js`; the seller color goes on CTAs, step numbers, active states.
- **Reuse**: `Components/Storefront/ProductCard.jsx` (+ `ProductImage`, `productImage`) for every product grid; `Components/BrandIcons.jsx` for Instagram/TikTok/Facebook/WhatsApp (lucide v1 has no brand icons).
- **Real store fields**: `city_location`, `instagram_link`, `tiktok_link`, `facebook_link` (not `city` / `*_url`). Products have no category column.
- **Images**: real photos only (`public/images/landing/*.webp`, logos in `public/images/brand/`; `public/branding` is gitignored). No fake ratings, review counts or stock numbers. CC BY-SA photos must stay credited (landing footer « Crédits photos »).

## Motion

Follow the `biolinko-motion` skill for any animation.

## Checklist before finishing

Responsive at 375/768/1280 px · consistent radii/borders with neighbours · French copy · FCFA formatting · storefront follows `theme_color` with readable contrast · icons have labels · no new color outside the palette without a reason.
