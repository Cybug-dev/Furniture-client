# Furniture design system

## Structure

The style foundation has three files only:

- [`src/styles/variables.scss`](../src/styles/variables.scss): every shared design value.
- [`src/styles/mixins.scss`](../src/styles/mixins.scss): optional, small reusable style blocks.
- [`src/styles/global.scss`](../src/styles/global.scss): reset and website-wide base styles.

`src/index.scss` imports `global.scss`. Components keep their own SCSS files and should import `variables.scss` directly. Import `mixins.scss` only when a helper makes a style clearer.

## Foundation rules

Manrope (`'Manrope', 'Segoe UI', Arial, sans-serif`) is the only visible font family. It is loaded at weights 400, 500, 600, and 700 in `index.html`; there is no serif fallback.

The compact type scale is `xs` 0.75rem, `sm` 0.875rem, `base` 1rem, `lg` 1.125rem, `xl` 1.25rem, `2xl` clamp(1.5rem, 2vw, 2rem), `3xl` clamp(1.875rem, 3vw, 2.75rem), and `display` clamp(2.25rem, 5vw, 4.5rem). Use 400 for body copy, 500 for labels, 600 for controls/headings, and 700 for strong prices or headings.

Colour variables have a single role:

- `$color-bg-*` only for backgrounds.
- `$color-text-*` only for text.
- `$color-border-*` only for borders and dividers.
- `$color-action-*` only for action states.
- `$color-status-*` only for error, warning, success, and sale messages.

The palette is soft white, near-black grey-green, brand green `#2fb854`, one restrained warm neutral, and functional red/amber. Components must not use a background variable as text or a text variable as a background.

Spacing uses 4, 8, 12, 16, 24, 32, 48, 64, and 80px. Section spacing, gutters, and grid gaps use compact `clamp()` values. Content is capped at 1280px, readable copy at 720px, and standard controls at 36px, 44px, and 48px. Breakpoints are 480px, 768px, 1024px, and 1440px.

Radii are 4px, 8px, 12px, 16px, and 999px. Use only the card, card-hover, and floating shadows; transitions are 150ms, 220ms, or 320ms ease. Common image ratios are product/category 4:5, editorial 3:4, and promotional 16:9.

## Mixins

Available helpers are `page-container`, `section-spacing`, `responsive-grid`, `section-heading`, `button-base`, `card-base`, `focus-visible`, `respond-to`, `reduced-motion`, `visually-hidden`, and `aspect-ratio`. They are helpers, not a UI framework; sections may keep their own layout and composition while using the shared values.

## External inspiration

Keep only a useful layout or content idea. Replace its fonts, colours, spacing, container rules, radii, shadows, transitions, and responsive behavior with this project’s foundation. Add a new variable only when an existing role cannot represent a genuine need.

## Migration status

All component and section styles now use the three-file foundation directly. Retired variables and mixin names, component-level font overrides, and legacy imports have been removed rather than aliased. Decorative image masks retain their required black mask channel; all visible colours use semantic foundation tokens.
