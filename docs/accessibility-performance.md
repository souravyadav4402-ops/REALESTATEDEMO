# Accessibility & Performance Strategy

## WCAG 2.1 AA acceptance criteria
### Structure and navigation
- One page-level `h1`; heading levels remain logical beneath it.
- Landmark regions use `header`, `nav`, `main`, `section`, `article`, `aside` and `footer` appropriately.
- Skip link targets `#main-content` and becomes visible on focus.
- Active route uses `aria-current="page"`.
- Mobile navigation is a modal dialog with initial focus, focus containment, Escape close, focus return and body scroll lock.

### Keyboard and focus
- Every action is reachable and operable with keyboard only.
- Focus indicators use a 2px brass outline with 4px offset and are never removed.
- Project filters and currency controls expose `aria-pressed`.
- RERA modal closes by button, Escape or backdrop; its close control receives focus.
- Form step changes do not erase previous values. Production enhancement should move focus to the new legend and announce the step through a polite live region.

### Forms
- Persistent labels; semantic `fieldset`/`legend`; correct autocomplete and input types.
- Client guards improve flow but server validation is authoritative.
- Error messages use `role="alert"`; success uses `role="status"`.
- Consent is explicit and unchecked by default.
- Phone country code is independent and NRI status is user-controlled.
- Do not rely on color alone: selected state includes contrast inversion and `aria-pressed`.

### Images, color and motion
- Meaningful images use concise context-specific alt text; purely decorative layers are CSS or empty-alt.
- Body text targets at least 4.5:1 contrast; large display text at least 3:1. Validate final licensed photography because overlays affect contrast.
- `prefers-reduced-motion` removes smooth scroll and effectively disables animations.
- Fine-pointer interactions do not replace visible controls and are absent on touch devices.

### Content and localization
- HTML locale is `en-IN`; Indian currency uses `en-IN` formatting.
- Currency output includes currency code/symbol and is never conveyed by symbol alone in control labels.
- RERA and indicative-currency disclaimers remain readable and keyboard-accessible.
- Test with NVDA/Firefox, VoiceOver/Safari, keyboard-only and 200% zoom before launch.

## Core Web Vitals targets
| Metric | Target | Implementation |
|---|---|---|
| LCP | ≤ 2.5s p75 mobile | `next/image`, AVIF/WebP, hero priority only, CDN media, responsive sizes |
| INP | ≤ 200ms p75 | Server Components by default, small client islands, passive events, no heavy animation library |
| CLS | ≤ 0.1 p75 | Fixed image aspect ratios, `next/font`, no late banners, stable form step container |
| TTFB | ≤ 800ms p75 | CDN caching, static route output where possible, pooled PostgreSQL, time-bounded integrations |

### 95+ Lighthouse strategy
1. Keep public content pages static/server-rendered; no client bundle for cards or prose.
2. Use `next/font` subsets with `display: swap`; no external CSS font request.
3. Migrate demonstration Unsplash media to licensed Cloudinary/S3 assets with width, height, quality and focal metadata before production.
4. Prioritize only the current route hero and first visible portfolio image. Lazy-load all lower media.
5. Cap hero image at approximately 220KB AVIF mobile / 400KB desktop; cards at 140KB; reserve 3D downloads until explicit interaction.
6. Serve GLB/DRACO assets from a CDN with immutable fingerprinted keys, byte-range requests and poster images. Load the viewer dynamically only after user intent.
7. Keep route client JavaScript under 120KB compressed; measure form/filter islands separately.
8. Cache currency responses for one hour with 24-hour stale-while-revalidate. Never call exchange providers from the browser.
9. Use database connection pooling and indexed bounded queries; select only fields needed by a route.
10. Monitor real-user LCP/INP/CLS by route, device class and market. Lighthouse is a release gate, not the sole production measure.

### Performance budgets
- Initial HTML + critical CSS: ≤ 90KB compressed.
- Initial route JavaScript: ≤ 120KB compressed.
- Total above-fold transfer: ≤ 700KB mobile.
- Third-party scripts: zero by default; consent-gate analytics/marketing tags.
- WebGL: no automatic load, no background rendering when tab is hidden, and dispose GPU resources on route exit.

## Release checklist
- Automated: strict TypeScript, ESLint, production build, broken-link and schema checks.
- Browser widths: 320, 390, 760, 1024, 1440.
- Input modes: touch, mouse, keyboard.
- Preferences: reduced motion, increased text size, dark OS setting (site intentionally remains light/dark art-directed).
- Network: Slow 4G home and Work routes; form submission under retry/failure.
