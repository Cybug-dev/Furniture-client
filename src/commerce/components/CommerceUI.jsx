import { useState } from 'react';
import { Link, Navigate, Outlet, useLocation } from 'react-router';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Bell, Check, Clock3, LockKeyhole, Package, ShoppingBag, Truck } from 'lucide-react';
import { useCurrentUser } from '../../auth/auth.hooks.js';
import Header from '../../components/Header/Header';
import { arrival, cartCount, deliveryLabel, label, money } from '../commerce.utils.js';
import '../commerce.scss';

export function AccountLayout() {
  const auth = useCurrentUser();
  const location = useLocation();
  const reduced = useReducedMotion();
  if (auth.isPending) return <Loading />;
  if (auth.isError) return <div className="commerce"><ErrorMessage error={auth.error} retry={auth.refetch} /></div>;
  if (!auth.data) return <Navigate to="/auth" state={{ from: location.pathname + location.search }} replace />;
  return <div className="account-shell">
    <Header />
    <main className="commerce">
      <div className="commerce__container">
        <motion.div key={location.pathname} initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          <Outlet />
        </motion.div>
      </div>
    </main>
  </div>;
}
export function PageHeading({ title, description, children }) {
  return <header className="commerce__heading"><div><h1>{title}</h1>{description && <p>{description}</p>}</div>{children}</header>;
}
export function Card({ title, icon: Icon, children, className = '' }) {
  return <section className={`commerce-card ${className}`}>{title && <h2>{Icon && <Icon size={23} aria-hidden="true" />}{title}</h2>}{children}</section>;
}
export function CommerceBenefits() {
  return <aside className="commerce-benefits" aria-label="Checkout information">
    <div><span><LockKeyhole size={18} aria-hidden="true" /></span><p><strong>Secure account checkout</strong>Your cart is saved to your signed-in account.</p></div>
    <div><span><Truck size={18} aria-hidden="true" /></span><p><strong>Server-quoted delivery</strong>Fees and dates come directly from checkout.</p></div>
    <div><span><Bell size={18} aria-hidden="true" /></span><p><strong>Order updates</strong>Follow demo progress from notifications.</p></div>
  </aside>;
}
export function NextSteps({ compact = false }) {
  return <Card title="What's next?" className={`commerce-next ${compact ? 'commerce-next--compact' : ''}`}><ol>
    <li><span><Check size={15} aria-hidden="true" /></span><p><strong>Order confirmed</strong>We saved your demo order.</p></li>
    <li><span><Clock3 size={15} aria-hidden="true" /></span><p><strong>Preparing your items</strong>The server will update its status.</p></li>
    <li><span><Truck size={15} aria-hidden="true" /></span><p><strong>Out for delivery</strong>You'll get an in-app update.</p></li>
  </ol></Card>;
}
export function Loading() {
  return <div className="commerce-loading" role="status" aria-live="polite"><span>Loading your account information…</span><div /><div /><div /></div>;
}
export function ErrorMessage({ error, retry }) {
  if (!error) return null;
  return <div className="commerce-error" role="alert"><p>{error.status === 404 ? 'This information is unavailable. The checkout API may not yet be deployed, or this record no longer exists.' : error.message || 'Unable to load this information.'}</p>{retry && <button type="button" className="commerce-button commerce-button--secondary" onClick={retry}>Try again</button>}</div>;
}
export function QueryState({ query, children }) {
  if (query.isPending) return <Loading />;
  if (query.isError && !query.data) return <ErrorMessage error={query.error} retry={() => query.refetch()} />;
  return <>{query.isError && <ErrorMessage error={query.error} retry={() => query.refetch()} />}{children}</>;
}
export function EmptyState({ title, text, icon: Icon = Package, orders = false }) {
  return <Card className="commerce-empty"><span className="commerce-empty__icon"><Icon size={48} strokeWidth={1.5} aria-hidden="true" /></span><h2>{title}</h2><p>{text}</p><div className="commerce-actions"><Link className="commerce-button" to="/shop">Start shopping <ArrowRight size={18} /></Link>{orders && <Link className="commerce-button commerce-button--secondary" to="/orders">View my orders</Link>}</div></Card>;
}
export function Stepper({ step }) {
  return <nav aria-label="Checkout progress"><ol className="checkout-stepper">{['Cart', 'Delivery', 'Review'].map((name, index) => <li key={name} className={index <= step ? 'is-complete' : ''} aria-current={index === step ? 'step' : undefined}><span className="checkout-stepper__number">{index < step ? <Check size={16} aria-hidden="true" /> : index + 1}</span>{index < step ? <Link to={index === 0 ? '/cart' : '/checkout/delivery'}>{name}</Link> : <span>{name}</span>}</li>)}</ol></nav>;
}
export function ProductImage({ src, name }) {
  const [failed, setFailed] = useState(false);
  return src && !failed ? <img className="commerce-product-image" src={src} alt={name} loading="lazy" onError={() => setFailed(true)} /> : <span className="commerce-product-image commerce-product-image--empty" role="img" aria-label={`${name}: image unavailable`}><ShoppingBag aria-hidden="true" /></span>;
}
export function ItemList({ items = [], currency = 'NGN' }) {
  return <ul className="commerce-items">{items.map((item) => <li key={item.id}><ProductImage src={item.imageUrl} name={item.productName} /><div><h3>{item.productName}</h3><p>Qty: {item.quantity} · {money(item.unitPrice, currency)} each</p></div><strong>{money(item.lineTotal, currency)}</strong></li>)}</ul>;
}
export function OrderSummary({ data, children, showItems = true }) {
  const cart = data?.cart || data;
  return <Card title="Order summary" className="order-summary">
    {cart?.items && <p>{cartCount(cart)} items</p>}
    {showItems && cart?.items && <ItemList items={cart.items} currency={cart.currency} />}
    <dl className="commerce-totals"><div><dt>Subtotal</dt><dd>{money(cart?.subtotal, cart?.currency)}</dd></div>
      <div><dt>Delivery fee</dt><dd>{money(data?.deliveryFee, cart?.currency)}</dd></div>
      {data?.discountAmount != null && <div><dt>Discount</dt><dd>{money(data.discountAmount, data.currency)}</dd></div>}
      {data?.total != null && <div className="commerce-totals__total"><dt>Total ({data.currency})</dt><dd>{money(data.total, data.currency)}</dd></div>}
    </dl>
    {data?.total == null && <p className="commerce-note">The API provides subtotal and delivery separately. The final total is confirmed by the server when your demo order is placed. No payment is collected.</p>}
    {data?.deliveryMethod && <div className="commerce-note"><strong>{deliveryLabel(data.deliveryMethod)}</strong><p>Estimated arrival: {arrival(data)}</p></div>}
    {children}
  </Card>;
}
export function AddressText({ address }) {
  if (!address) return <p>No delivery address selected.</p>;
  return <address className="commerce-address"><strong>{address.recipientName}</strong><span>{[address.addressLine1, address.addressLine2].filter(Boolean).join(', ')}</span><span>{[address.area, address.lga, address.city, address.state, address.postcode, address.country].filter(Boolean).join(', ')}</span><span>{address.phone}</span>{address.landmark && <span>Landmark: {address.landmark}</span>}{address.deliveryInstructions && <span>Instructions: {address.deliveryInstructions}</span>}</address>;
}
export function StatusBadge({ status }) {
  const reduced = useReducedMotion();
  return <motion.span key={status} className={`commerce-status ${status === 'CANCELLED' ? 'commerce-status--cancelled' : ''}`} initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} role="status">{label(status)}</motion.span>;
}
export function Pagination({ query, page, setPage }) {
  if (!query.data || query.data.pages < 2) return null;
  return <nav className="commerce-pagination" aria-label="Pagination"><button className="commerce-button commerce-button--secondary" disabled={page <= 1 || query.isFetching} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page} of {query.data.pages}</span><button className="commerce-button commerce-button--secondary" disabled={page >= query.data.pages || query.isFetching} onClick={() => setPage(page + 1)}>Next</button></nav>;
}
