---
name: biolinko-feature
description: Workflow for building or changing a full-stack feature in Biolinko (Laravel 13 + Inertia 2 + React 19 + Pest). Use when adding routes, controllers, models/migrations, plan-gated features, Inertia pages, or tests.
---

# Building a feature in Biolinko

Stack: Laravel 13 (PHP 8.3), Inertia 2 + React 19 (JSX, no TypeScript), Tailwind 3, Ziggy `route()` helper, Pest 4, Pint. Roles: `seller`, `admin` (middleware `role:admin`). A seller has one `store` (`$request->user()->store`).

## Steps

1. **Read first**: the closest existing controller (`app/Http/Controllers/*`), its route group in `routes/web.php`, the matching page in `resources/js/Pages/`, and its Feature test in `tests/Feature/`.
2. **Backend**
   - Controllers return `Inertia::render('Area/Page', [...])` or `RedirectResponse` (`redirect()->back()` / `->with(...)` / `->withErrors([...])`).
   - Validate inline with `$request->validate([...])` like existing controllers; normalize empty strings to `null` for nullable fields.
   - Scope everything to the current seller's store; never trust an ID from the request without checking ownership.
   - **Plan limits** live on `App\Models\User` (per-plan arrays for starter/pro/growth/business) and `App\Http\Middleware\EnsureUserHasPlan`. Reuse those helpers; don't hard-code quotas in controllers or React.
   - External services go in `app/Services/` (`HrSkillsPayService`, `WhatsappGatewayService`, `OrderInvoiceService`).
   - Avoid N+1: eager-load (`->with('variants')`), aggregate in SQL when lists can grow.
   - Name routes and use them from React with `route('name', params)`.
3. **Frontend**: follow the `biolinko-design` and `biolinko-motion` skills. Use Inertia `useForm` for forms, `InputError` for validation errors, `sonner` toasts for flash feedback, French copy.
4. **Tests (Pest)**: add/extend a test in `tests/Feature/` in the existing style — create `User::factory()` with `role`/`plan`, `Store::create`, `Wallet::create`, then `$this->actingAs($vendor)->post(route(...), [...])` and `expect(...)`. Cover: happy path, other seller's resource is forbidden, plan limit enforced.
5. **Finish**
   ```bash
   php artisan test --filter=<RelevantTest>
   ./vendor/bin/pint --dirty
   npm run build   # catches JSX/import errors
   ```

## Don'ts

- No secrets or `.env` values in code or commits.
- Don't edit `vendor/` or generated files in `public/build`.
- Payment webhooks (`HrSkillsPayWebhookController`, `WhatsappWebhookController`) must stay idempotent and verify signatures — be extra careful there and add tests.
