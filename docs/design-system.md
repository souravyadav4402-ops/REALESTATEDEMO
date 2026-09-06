# Front-End Design Specification

## Design philosophy
Quiet luxury, spatial richness, architectural precision and editorial warmth. Indian context appears through material logic—sandstone, teak, brass, filtered light—and not ornamental cliché. Motion should feel like a heavy, well-made door: controlled, damped and purposeful.

## Token library
The production source is `app/globals.css`.

```css
:root {
  --color-limestone: #f9f8f6;
  --color-sandstone: #efece6;
  --color-charcoal: #1a1a18;
  --color-brass: #c5a059;
  --color-grey: #6e6d6a;
  --color-teak: #7a4f36;
  --color-forest: #17241f;
  --color-line: #e2decf;
  --font-display: var(--font-serif), Georgia, serif;
  --font-body: var(--font-sans), Arial, sans-serif;
  --font-label: var(--font-mono), monospace;
  --container: 1440px;
  --gutter: clamp(1.25rem, 4vw, 4.5rem);
  --section-space: clamp(6.5rem, 12vw, 12rem);
  --ease-luxury: cubic-bezier(0.16, 1, 0.3, 1);
}
```

### Typography
- Display: Playfair Display, weight 500, tight tracking `-0.035em` to `-0.06em`, line height `.84–1.05`.
- Body: Inter, regular/medium, line height `1.6–1.75`, maximum prose width `43rem`.
- Labels: JetBrains Mono, uppercase, `0.48–0.66rem`, tracking `0.08–0.15em`.
- Never set body copy below `0.75rem`; legal labels may use `0.48rem` only with high contrast and nonessential status content.

### Spacing and layout
- Maximum content width: `1440px`.
- Fluid outer gutter: `1.25rem–4.5rem`.
- Standard section spacing: `6.5rem–12rem`.
- Desktop editorial grids favor `0.7fr / 1.4fr` and `1fr / 1.2fr` rather than equal columns.
- Borders are 1px `--color-line`; radius is deliberately restrained at 2px.

### Breakpoints
| Width | Behavior |
|---|---|
| `> 1100px` | Full central navigation, multi-column editorial layouts |
| `≤ 1100px` | Modal navigation (fixes prior tablet nav gap) |
| `≤ 1000px` | Split editorial sections stack; sticky asides release |
| `≤ 760px` | Portfolio and journal become one column; forms stack |
| `≤ 640px` | Compact gutters/footer; reduced brand lockup |
| `≤ 480px` | Narrow-phone floor-plan and form refinements |

### Motion
- Entrance duration: 800ms using `--ease-luxury`.
- Image hover: scale `1.035`, max 1100ms.
- Magnetic/arrow cue: rotate 45 degrees; never move controls away from pointer focus.
- Always implement `prefers-reduced-motion: reduce` with near-zero animation duration and no smooth scrolling.

### Core hover pattern
```css
.project-card__media img {
  transition: transform 1.1s var(--ease-luxury);
}
.project-card:hover .project-card__media img {
  transform: scale(1.035);
}
.button:hover span,
.line-link:hover span {
  transform: rotate(45deg);
}
```

### Form pattern
Inputs are borderless except for a bottom rule. Focus uses brass and the global visible outline. Labels remain visible; placeholders never replace labels. Selected option cards invert to charcoal/limestone. Error, loading, disabled and success states must be visually and programmatically distinct.

## Tailwind CSS mapping (if adopted later)
This implementation uses authored CSS to preserve editorial control. An equivalent Tailwind theme extension is:

```ts
const config = {
  theme: {
    extend: {
      colors: {
        limestone: "#F9F8F6",
        sandstone: "#EFECE6",
        charcoal: "#1A1A18",
        brass: "#C5A059",
        warmGrey: "#6E6D6A",
        teak: "#7A4F36",
        forest: "#17241F"
      },
      fontFamily: {
        display: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Arial", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"]
      },
      maxWidth: { shell: "1440px" },
      transitionTimingFunction: { luxury: "cubic-bezier(0.16, 1, 0.3, 1)" },
      screens: { xs: "480px", sm: "640px", md: "760px", lg: "1000px", nav: "1100px", xl: "1440px" }
    }
  }
};
```

## Implementation sequence
1. Load fonts through `next/font`; do not add render-blocking font stylesheets.
2. Apply semantic page sections and `.shell` before component styling.
3. Establish display/body/label hierarchy using shared classes.
4. Add image containers with declared aspect ratios and `next/image` sizing.
5. Add interactions as isolated client components; preserve server rendering.
6. Add focus/keyboard/reduced-motion behavior before hover polish.
7. Test 320, 390, 760, 1024 and 1440 widths and at 200% text zoom.
8. Run production build and browser checks before visual approval.
