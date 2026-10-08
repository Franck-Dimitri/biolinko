---
name: biolinko-motion
description: Biolinko's animation conventions with framer-motion (entrances, hover lift, drawers, modals, lists, marquees, skeletons). Use when adding or changing any animation or transition in resources/js.
---

# Biolinko Motion

The project uses **framer-motion** (34+ files). Motion here is quick, soft and subtle: small upward fades, gentle hover lifts, spring drawers. Generic principles are in the global `web-motion` skill; this file pins down the house values found in the codebase.

## House values (use these, don't invent new ones)

| Pattern | Code |
|---|---|
| Card/section entrance | `initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: 'easeOut' }}` (y 8–20 depending on size) |
| Premium hero entrance | `transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}` |
| Modal / popover | `initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}` |
| Backdrop | opacity 0→1, `duration: 0.2`, `bg-slate-950/60 backdrop-blur-xs` |
| Side drawer (cart) | `initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 240 }}` — see `Components/Storefront/CartDrawer.jsx` |
| Hover lift | product/feature cards `whileHover={{ y: -6 }}`, small cards/buttons `whileHover={{ y: -2 }}` |
| Press | Tailwind `active:scale-95` on buttons (already standard) |
| Marquee | `animate={{ x: ['0%', '-50%'] }}` on a duplicated track, linear, infinite |
| Side-in content | `x: ±30` → 0 |

Lists: stagger with `transition={{ delay: index * 0.05 }}` or variants with `staggerChildren: 0.05`; cap the delay (e.g. `Math.min(index, 8) * 0.05`) for long product grids.


## Public pages: shared motion primitives

Landing and storefront pages use `resources/js/Components/Motion.jsx` — reuse it instead of hand-writing variants:

- `Reveal` (fade + rise on scroll, once), `Stagger` + `StaggerItem` (cascades), `Parallax` (scroll-linked translate; give the child extra height/negative margin so no gap shows), `Marquee` (infinite strip, pauses on hover), `CountUp` (number tween in view), `EASE_OUT`.
- Wrap page roots in `<MotionConfig reducedMotion="user">` (done in `Welcome` and `StorefrontLayout`).
- Patterns in use: word-by-word hero headline, highlight bar `scaleX` reveal, live-order ticker with `AnimatePresence mode="wait"`, sliding `layoutId` pill for toggles, FAQ height accordion, cart badge spring on count change, hero slideshow with Ken Burns + progress bars, product grid `layout` animations on filter.
- Any per-second ticker (countdowns) lives in its own small component so the whole page doesn't re-render; never declare components inside another component's body (remount = animations replay).

## Rules

1. Mount/unmount animations always go through `<AnimatePresence>` with `exit` and a stable `key`.
2. Only animate `opacity`, `transform` (x/y/scale). Use `layout` for size/reorder changes.
3. Below-the-fold sections on landing/storefront: `whileInView` + `viewport={{ once: true }}`.
4. Reduced motion: when adding a new layout or a large animated section, honour `useReducedMotion()` (drop y/scale, keep opacity). Prefer adding `<MotionConfig reducedMotion="user">` at layout level if touching layouts.
5. Storefront runs on low-end Android phones: no blur/filter animations, no more than one infinite animation per screen, keep skeletons (`Components/Storefront/StorefrontSkeleton.jsx`) CSS-only (`animate-pulse`).
6. Inertia page navigations already show a progress bar (configured in `resources/js/app.jsx`); don't add page-level entrance animations that delay content by more than ~400 ms.

## Verify

Run `npm run dev`, check the page on a 375 px viewport, test the open/close path twice quickly (no stuck exit states), and with OS "reduce motion" enabled.
