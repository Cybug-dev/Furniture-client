# Checkout and account UI

Frontend branch: `feature/cart-checkout-orders-ui`. No backend files changed.

## Routes

- `/cart`: persistent cart, quantities, remove/clear, existing `/products/:id` links.
- `/checkout`: restore the backend checkout and choose the appropriate step.
- `/checkout/delivery`: saved addresses, address editing, server delivery quotes.
- `/checkout/review`: explicit demo acknowledgement and idempotent placement.
- `/order-confirmation/:orderId`: the saved order, not the emptied cart.
- `/orders`: paginated all/active/previous orders.
- `/orders/:orderId`: saved product/address snapshots and backend tracking events.
- `/notifications`: paginated notifications, unread filter and read actions.
- `/profile`: read-only account fields, address management and activity counts.

All routes use the existing `['auth', 'me']` session and redirect guests to sign-in
with their return path. Private query keys include the authenticated account ID;
logout cancels and removes private queries. No token, cart, address or payment data
is stored in browser storage. Only submission UUIDs and reminder UI flags are saved.

## Contract and deployment prerequisite

The contract was inspected read-only from the backend's
`feature/checkout-order-lifecycle` branch:
`src/config/checkout.swagger.js`, `docs/checkout.md`, and the checkout services.
The backend's checked-out `develop` branch did not contain those endpoints.

On 2026-09-23, unauthenticated read checks against the frontend's configured
development API returned **404 / Cannot GET** for `/api/cart`, `/api/checkout`,
and `/api/orders`. A deployed protected route should instead return the backend's
authentication error when called without a valid session. Live checkout testing
is blocked until this backend feature is available in the matching environment.

Backend owner action (not performed by this frontend change): review/merge the
checkout feature into the intended backend environment, apply its documented
migration to that environment, regenerate Prisma, and deploy its Worker including
the scheduled tracking handler. Use the backend's `docs/checkout.md` deployment
instructions and environment-specific credentials. Keep develop and production
separate; no fallback URL has been added here. Ensure the exact frontend origin
(including `http://localhost:5173` for local development) remains allowed by CORS.

## Intentional differences from mockups

- `CheckoutData` has `cart.subtotal` and `deliveryFee`, but **no checkout total**.
  These values are displayed separately; the authoritative total is shown on the
  saved order. Add a backend total to CheckoutData to display it before placement.
- Delivery methods are quoted by PATCH `/checkout/delivery`, not a read-only
  all-methods quote endpoint. Unselected methods show “Get quote”; the selected
  method shows its server price/window. No frontend fee/ETA calculations.
- `/orders` returns OrderSummary without item snapshots/counts. List cards show
  order metadata, not fabricated thumbnails; the details/confirmation screens
  display OrderItem snapshots. Adding item previews/counts to OrderSummary would
  allow the mockup's list thumbnails without a detail request for every card.
- Order filters support `active` and `previous` (delivered + cancelled), not
  separate delivered/cancelled filters. The UI follows those server categories.
- Account name/email updates are not supported. Only addresses are editable.
- Existing catalogue prices are NGN according to the checkout contract. Product
  price labels now use NGN too; values are not converted.
- Product options are not accepted by AddCartItemRequest. Existing size/colour
  controls are labelled as previews, not silently sent as unsupported fields.
- No invented taxes, promotions, warranties, return policy, payment forms,
  notification records, tracking events or delivery claims are included.

## Behaviour and checks

- Cart mutations use returned server data; pending controls prevent duplicate
  actions. No optimistic money calculations.
- Order placement is non-retrying by default. A manual retry keeps the same
  checkout ID and idempotency UUID. A stale-checkout 409 requires refreshing and
  reviewing before another submission.
- Tracking checks every 30 seconds while visible, pauses in background, and stops
  at DELIVERED/CANCELLED (or inaccessible 401/404). Notifications check every 60
  seconds while visible. No frontend status simulation.
- A once-per-session reminder may appear after two visible minutes following
  login, only with a non-empty server cart and outside checkout/dialog/cookie UI.
- Shared SCSS tokens/mixins, narrow-screen single-column forms, wrapping order
  identifiers, 44px controls and reduced-motion support are included.

Run `npm run test:commerce`, `npm run build`, and `npm run lint`.
The added tests use isolated contract fixtures and server-side rendering, not the
live backend. They cover API requests, response unwrapping, session isolation,
checkout restoration, idempotency, duplicate locking, error handling, tracking
termination and screen content. They do not substitute for browser or live
integration testing.

Browser visual checks at 360, 390, 412, 768, 1024 and 1440px remain required: no
connected browser was available during implementation. After backend deployment,
verify login → product → cart → quantity → saved Lagos address → delivery quote →
leave/resume → acknowledgement → single order placement → confirmation → tracking
progression → notification read → logout/login persistence. Also verify expired
auth, stale checkout, failed saves/quotes/placement, all empty states, cancelled
orders and terminal polling. Existing `npm run lint` calls an uninstalled `eslint`
binary; targeted Oxlint succeeds without weakening the lint configuration.

## Prepared commit (not committed)

```text
feat(checkout): wire cart, orders and tracking experience

- integrate persistent cart and backend-quoted delivery checkout
- add acknowledged, idempotent demo order placement
- add order history, saved snapshots and server-driven tracking
- connect notifications, header badges and profile/address management
- add responsive account screens and contract/rendering tests
```
