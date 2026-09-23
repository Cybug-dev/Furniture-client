import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { motion, useReducedMotion } from 'framer-motion';
import { Bell, Check, CheckCircle2, MapPin, Package, Truck } from 'lucide-react';
import { useNotifications, useOrder, useOrders, useTracking } from '../commerce.hooks.js';
import { arrival, date, deliveryLabel, isTerminal, label, money, ORDER_STEPS } from '../commerce.utils.js';
import { AddressText, Card, EmptyState, ItemList, NextSteps, OrderSummary, PageHeading, Pagination, QueryState, StatusBadge } from '../components/CommerceUI';

export default function OrdersPage() {
  const [view, setView] = useState('all');
  const [page, setPage] = useState(1);
  const query = useOrders(page, view === 'all' ? undefined : view);
  const notifications = useNotifications();
  return <>
    <PageHeading title="My orders" description="Track every active and previous demo order from your account." />
    <nav className="commerce-tabs" aria-label="Filter orders">{[['all', 'All orders'], ['active', 'Active'], ['previous', 'Delivered & cancelled']].map(([value, title]) => <button key={value} aria-pressed={view === value} onClick={() => { setView(value); setPage(1); }}>{title}</button>)}</nav>
    <QueryState query={query}>{query.data?.items.length ? <div className="commerce-grid"><div className="commerce-stack">
      {query.data.items.map((order) => <Card key={order.id} className="order-card"><div className="commerce-actions commerce-actions--between"><h2>Order {order.orderNumber}</h2><StatusBadge status={order.status} /></div><p>Placed on {date(order.placedAt)}</p><div className="order-card__body"><span className="commerce-empty__icon commerce-empty__icon--small"><Package size={30} aria-hidden="true" /></span><div><strong>{deliveryLabel(order.deliveryMethod)}</strong><p>Estimated arrival: {arrival(order)}</p></div><div className="order-card__total"><span>Total</span><strong>{money(order.total, order.currency)}</strong></div></div><div className="commerce-actions commerce-actions--between"><small>Demo order · no payment charged</small><Link className="commerce-button commerce-button--secondary" to={`/orders/${order.id}`}>View details →</Link></div></Card>)}
      <Pagination query={query} page={page} setPage={setPage} />
    </div><Card title="Your order activity"><p>{query.data.total} {view === 'all' ? 'orders' : view === 'active' ? 'active orders' : 'delivered or cancelled orders'}</p><Link className="commerce-button commerce-button--secondary" to="/notifications"><Bell size={18} />Notifications{notifications.data ? ` (${notifications.data.unreadCount} unread)` : ''}</Link><div className="commerce-note"><Truck size={22} aria-hidden="true" /><p>Open an order to see its saved items and the latest simulated delivery updates.</p></div></Card></div> : <EmptyState title={view === 'all' ? 'No orders yet' : `No ${view === 'active' ? 'active' : 'delivered or cancelled'} orders`} text="Demo orders you place will appear here with saved items and tracking updates." />}</QueryState>
  </>;
}

function Timeline({ tracking }) {
  const reduced = useReducedMotion();
  const events = tracking.events;
  const steps = tracking.status === 'CANCELLED' ? [...events.map((event) => event.status).filter((status, index, list) => list.indexOf(status) === index)] : ORDER_STEPS;
  return <ol className="order-timeline" aria-label="Order tracking progress">{steps.map((status) => {
    const matching = events.filter((event) => event.status === status);
    const current = tracking.status === status;
    return <li key={status} className={matching.length ? 'is-complete' : ''} aria-current={current ? 'step' : undefined}>
      <motion.span className="order-timeline__line" initial={false} animate={{ scaleY: matching.length && !current ? 1 : 0 }} transition={{ duration: reduced ? 0 : 0.4 }} aria-hidden="true" />
      <span className={`order-timeline__marker ${current ? 'is-current' : ''}`} aria-hidden="true">{matching.length ? <Check size={14} /> : null}</span>
      <div><h3>{label(status)}{current ? ' · Current status' : ''}</h3>{matching.length ? matching.map((event) => <motion.div key={event.id} initial={reduced ? false : { opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}><p>{event.message}</p><time dateTime={event.occurredAt}>{date(event.occurredAt, true)}</time></motion.div>) : <p>Awaiting an update from the server.</p>}</div>
    </li>;
  })}</ol>;
}
export function OrderDetailPage() {
  const { orderId } = useParams();
  const order = useOrder(orderId);
  const tracking = useTracking(orderId);
  const current = tracking.data || order.data;
  return <>
    <Link to="/orders">← My orders</Link>
    <PageHeading title="Order details" description={order.data ? `Order ${order.data.orderNumber} · Placed ${date(order.data.placedAt)}` : 'Your saved order and delivery updates.'}><Link className="commerce-button commerce-button--secondary" to="/notifications"><Bell size={18} />Notifications</Link></PageHeading>
    <QueryState query={order}>{order.data && <>
      <div className="commerce-order-heading"><StatusBadge status={current.status} /><p>Estimated arrival: {arrival(current)}</p></div>
      <div className="commerce-grid"><div className="commerce-stack"><Card title="Tracking timeline" icon={Truck}><QueryState query={tracking}>{tracking.data && <Timeline tracking={tracking.data} />}</QueryState><p className="commerce-note">{isTerminal(current.status) ? 'This order is complete; automatic tracking refresh has stopped.' : 'Checks for server updates every 30 seconds while this page is visible.'} This is simulated tracking, not a physical delivery.</p><button className="commerce-text-button" disabled={tracking.isFetching} onClick={() => tracking.refetch()}>{tracking.isFetching ? 'Checking…' : 'Refresh tracking'}</button></Card><Card title="Items in this order" icon={Package}><ItemList items={order.data.items} currency={order.data.currency} /></Card></div>
      <div className="commerce-stack"><Card title="Delivery address" icon={MapPin}><AddressText address={order.data.address} /></Card><Card title="Demo payment"><StatusBadge status={order.data.paymentStatus} /><p>{order.data.notice}</p></Card><OrderSummary data={{ ...order.data, estimatedDeliveryFrom: current.estimatedDeliveryFrom, estimatedDeliveryTo: current.estimatedDeliveryTo }} showItems={false} /></div></div>
    </>}</QueryState>
  </>;
}
export function OrderConfirmationPage() {
  const { orderId } = useParams();
  const query = useOrder(orderId);
  return <QueryState query={query}>{query.data && <div className="order-confirmation"><span className="commerce-empty__icon"><CheckCircle2 size={54} strokeWidth={1.5} /></span><PageHeading title="Your order is confirmed!" description="Thank you. Your demo order is saved and its progress will be updated." /><Card title="Order details"><dl className="commerce-totals"><div><dt>Order number</dt><dd>{query.data.orderNumber}</dd></div><div><dt>Order date</dt><dd>{date(query.data.placedAt, true)}</dd></div><div><dt>Delivery method</dt><dd>{deliveryLabel(query.data.deliveryMethod)}</dd></div><div><dt>Estimated arrival</dt><dd>{arrival(query.data)}</dd></div><div className="commerce-totals__total"><dt>Total</dt><dd>{money(query.data.total, query.data.currency)}</dd></div></dl></Card><Card title="Items in this order"><ItemList items={query.data.items} currency={query.data.currency} /></Card><div className="commerce-actions"><Link className="commerce-button" to={`/orders/${query.data.id}`}><Truck size={18} />Track your order</Link><Link className="commerce-button commerce-button--secondary" to="/shop">Continue shopping</Link></div><NextSteps compact /></div>}</QueryState>;
}
