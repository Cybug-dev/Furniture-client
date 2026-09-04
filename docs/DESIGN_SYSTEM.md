# Furniture design system

## Direction

The visual language is **Warm Contemporary Editorial**: composed, tactile, and quiet. The familiar green `#2fb854` remains the primary action colour; cream, warm white, stone, walnut, clay, and sage support it without competing for attention. Use visual contrast through composition, imagery, and surface tone—not arbitrary new colours, heavy shadows, or oversized controls.

The executable source of truth is in [`src/styles/_tokens.scss`](../src/styles/_tokens.scss) and [`src/styles/_mixins.scss`](../src/styles/_mixins.scss). This document describes their intended use. `src/styles/variable.scss` remains only as a temporary compatibility facade for existing section styles.

## Fonts and typography

- **Instrument Serif** is reserved for editorial display moments: campaign headlines, a hero statement, and large inspirational content. It is not for navigation, forms, prices, or dense product information.
- **Manrope** is the interface font for all other content: body text, navigation, controls, labels, prices, product information, and forms.
- The font request in `index.html` loads only Instrument Serif (regular/italic) and Manrope (400–700), with preconnects already in place.

Use `@include mx.type(<role>)` from `mixins`, or the matching utility where utility classes are appropriate:

| Role | Utility | Intended use |
| --- | --- | --- |
| Display large / medium | `.type-display-large`, `.type-display-medium` | Major editorial moments only |
| Heading 1–4 | `.type-heading-1` through `.type-heading-4` | Section and component hierarchy |
| Body large / body / body small | `.type-body-large`, `.type-body`, `.type-body-small` | Reading text and supporting copy |
| Label / caption | `.type-label`, `.type-caption` | Eyebrows, metadata, compact UI text |
| Price / price large | `.type-price`, `.type-price-large` | Product and promotional pricing |

The display and heading roles use fluid `clamp()` values. Keep display text to short, readable line lengths and avoid promoting every section heading to display type.

```scss
@use '../styles/mixins' as mx;

.campaign-title {
  @include mx.type(display-medium);
}
```

## Colour system

Primitive palette values are named `$brand-50` through `$brand-900`, `$warm-white`, `$cream`, `$stone-100`, `$stone-300`, `$taupe`, `$text-muted`, `$charcoal-soft`, `$charcoal`, `$ink`, `$walnut`, `$clay`, `$sage`, `$sale`, and `$warning`.

New component styles must use semantic names, never primitive values directly:

| Semantic token | Use |
| --- | --- |
| `$color-page-background` | Default page background |
| `$color-surface`, `$color-surface-subtle`, `$color-surface-brand-soft` | Cards and intentional surface variation |
| `$color-text-primary`, `$color-text-secondary`, `$color-text-tertiary`, `$color-text-inverse`, `$color-text-brand` | Copy hierarchy and green text actions |
| `$color-border-default`, `$color-border-strong` | Subtle and emphasized boundaries |
| `$color-action-primary`, `$color-action-primary-hover`, `$color-action-primary-active` | Primary interaction states |
| `$color-focus-ring` | Keyboard focus only |
| `$color-status-success`, `$color-status-warning`, `$color-status-sale` | Status and availability—not decoration |

The same semantic values are emitted as CSS custom properties in `_base.scss` for plain CSS and data-driven values, for example `var(--color-surface)`.

```scss
.notice {
  border: 1px solid $color-border-default;
  background: $color-surface-brand-soft;
  color: $color-text-primary;
}
```

## Spacing and layout

The approved spacing scale is 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96, and 120px (`$space-1` through `$space-12`). Do not introduce values such as 17px or 37px for visual spacing without a genuine technical reason.

- `$space-page-gutter`: responsive 16–32px page rail.
- `$space-section`: responsive 64–120px vertical section padding.
- `$space-section-compact`: responsive 48–80px section padding.
- `$grid-gap`: responsive 16–32px grid spacing.
- `$content-width`: 1280px maximum content rail.
- `$content-width-reading`: 720px maximum for prose.

Use the shared mixins or global helpers before creating section-local containers:

```scss
.featured {
  @include mx.section;
}

.featured__inner {
  @include mx.container;
}
```

`layout-container`, `layout-section`, `layout-section--compact`, and `layout-text` are global helpers for simple layout composition. Full-width sections own their background; their inner content uses the shared container.

## Responsive rules

Breakpoints are centralised in `_tokens.scss`: mobile 480px, tablet 768px, desktop 1024px, and wide 1440px. Use `mx.respond-up(tablet)` and `mx.respond-down(tablet)` rather than scattering literal breakpoint values. At smaller widths, reduce section padding and gaps, stack intentional layouts, preserve 44px interactive targets, and do not solve fit by hiding meaningful content.

## Radius, shadows, and imagery

- Radius: 4px (`xs`), 8px (`sm`), 12px (`md`), 16px (`lg`), and 999px (`full`). Pill shapes are limited to compact chips, badges, and icon controls.
- Elevation: `$shadow-card` for cards, `$shadow-floating` for menus/popovers, and `$shadow-overlay` for modal/promotional layers. Avoid arbitrary black shadows.
- Image ratios: `$aspect-product` / `$aspect-category` (4:5), `$aspect-editorial` (3:4), `$aspect-promo` (16:9), and gallery ratios (4:3 / 3:4). Use `mx.aspect-ratio()` so imagery crops predictably.
- Icons use 16, 20, 24, 28, 32, or 40px tokens and a default 1.75px visual stroke. Keep icon and text colour tied to the owning control state.

## Interactions and accessibility

- Use `mx.focus-ring` for keyboard focus. Every keyboard-focusable custom control must have a visible focus state.
- Motion uses 150ms, 220ms, or 360ms tokens with the standard easing token. Transitions should target colour, border, shadow, opacity, or image transform—not layout dimensions.
- `_base.scss` respects `prefers-reduced-motion` globally. Existing Framer Motion components should also use their local `useReducedMotion` pattern.
- Buttons perform actions; links navigate. Disabled controls stay readable and use a `not-allowed` cursor.
- `mx.truncate()` is the approved truncation utility. Do not hide content simply because a layout narrows.
- Inputs use `mx.form-control`; labels are explicit, and invalid fields use the sale/status token.

Z-index is a named scale: base 0, raised 1, dropdown 100, sticky 200, header 300, overlay 400, modal 500, toast 600, and tooltip 700. Never introduce unexplained high z-index values.

## Shared component conventions

Phase 1 intentionally introduces no new React component or prop API; it preserves the existing section markup and interaction logic. All current buttons, cards, and inputs are section-local and will be standardised in Phase 2.

Phase 2's shared component API is reserved as follows, so parallel one-off implementations are not added:

```jsx
<Button variant="primary" size="md" isLoading={false} disabled={false} iconStart={null} iconEnd={null} />
<ProductCard product={product} variant="standard" imageRatio="product" />
<Badge tone="sale" size="sm" />
```

- `Button.variant`: `primary`, `secondary`, `outline`, `ghost`, `text`, or `destructive`.
- `Button.size`: `sm`, `md`, or `lg`; `isLoading` preserves the control width and exposes a busy state.
- Card variants remain purpose-specific (product, category, editorial, promotional, review), but share the border, elevation, focus, and image-ratio rules.

The relevant Sass building blocks already exist: `mx.button-base`, `mx.button-variant`, `mx.card-base`, `mx.form-control`, `mx.aspect-ratio`, and `mx.truncate`.

## Adapting external inspiration

An inspired section may retain a layout idea or content composition only. Before merging it, replace its typography with Instrument Serif/Manrope roles, translate every colour to a semantic token, use the project button/card variants, move spacing onto the approved scale, use project radii/shadows/containers, and check it at 1440, 1024, 768, 390, and 320px. Add no more than one or two new semantic tokens; if more are required, the design is not native enough yet.

## Foundation migration status

`variable.scss` exports old token aliases solely to keep Phase 1 non-disruptive. New code imports `tokens` and `mixins` directly. Phase 2 will replace duplicated section button, card, badge, icon, and form-control styles; Phase 3 will apply the shared layout and typography rules section by section. Remove aliases only after repository-wide usage has been eliminated.
