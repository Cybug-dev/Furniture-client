import { useRef, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { ArrowRight, CreditCard, MapPin, Truck } from 'lucide-react';
import { useAccountMutation, useAddresses, useCheckout } from '../commerce.hooks.js';
import { arrival, canReview, DELIVERY_METHODS, deliveryLabel, money, resumePath, submissionKey } from '../commerce.utils.js';
import AddressBook from '../components/AddressBook';
import { AddressText, Card, EmptyState, ErrorMessage, ItemList, Loading, OrderSummary, PageHeading, QueryState, Stepper } from '../components/CommerceUI';

export function CheckoutEntry() {
  const query = useCheckout();
  if (query.isFetching) return <Loading />;
  return <QueryState query={query}>{query.data && <Navigate to={query.data.cart.items.length ? resumePath(query.data) : '/cart'} replace />}</QueryState>;
}
export function DeliveryPage() {
  const query = useCheckout();
  const selectAddress = useAccountMutation('selectAddress', ['checkout'], 'checkout');
  const selectDelivery = useAccountMutation('selectDelivery', ['checkout'], 'checkout');
  const busy = selectAddress.isPending || selectDelivery.isPending;
  const checkout = query.data;
  const choose = async (mutation, value) => { try { await mutation.run(value); } catch { /* Inline error. */ } };
  return <>
    <PageHeading title="Delivery information" description="Choose where and how your demo order would arrive." />
    <Stepper step={1} />
    <QueryState query={query}>{checkout && (checkout.cart.items.length ? <div className="commerce-grid"><div className="commerce-stack">
      <AddressBook selectedId={checkout.selectedAddressId} onSelect={(id) => choose(selectAddress, id)} selecting={busy || query.isFetching} />
      <ErrorMessage error={selectAddress.error} />
      <Card title="Delivery method" icon={Truck}>
        <p>Choose a method to request its price and estimated arrival from the server. Demo delivery is currently available for Lagos, Nigeria only.</p>
        <fieldset className="delivery-methods" disabled={busy || !checkout.selectedAddressId || query.isFetching}><legend className="commerce-sr-only">Choose a delivery method</legend>
          {DELIVERY_METHODS.map((method) => <label className={`delivery-method ${checkout.deliveryMethod === method.id ? 'is-selected' : ''}`} key={method.id}><input type="radio" name="deliveryMethod" checked={checkout.deliveryMethod === method.id} onChange={() => choose(selectDelivery, method.id)} /><div><strong>{method.name}</strong><p>{method.description}</p>{checkout.deliveryMethod === method.id && <small>{arrival(checkout)}</small>}</div><strong>{checkout.deliveryMethod === method.id ? money(checkout.deliveryFee, checkout.cart.currency) : 'Get quote'}</strong></label>)}
        </fieldset>
        {!checkout.selectedAddressId && <p className="commerce-note">Select or save an address first.</p>}
        <p role="status">{selectDelivery.isPending ? 'Requesting your delivery quote…' : ''}</p>
        {checkout.quote?.serviceable === false && <p className="commerce-error" role="alert">{checkout.quote.notice || 'This address is outside the supported delivery area.'}</p>}
        <ErrorMessage error={selectDelivery.error} />
      </Card>
      <Link to="/cart">← Back to cart</Link>
    </div><OrderSummary data={checkout}>{canReview(checkout) && !busy && !query.isFetching ? <Link className="commerce-button" to="/checkout/review">Continue to review <ArrowRight size={18} /></Link> : <button className="commerce-button" disabled>Choose address and delivery</button>}</OrderSummary></div> : <EmptyState title="Your cart is empty" text="Add some furniture before choosing delivery." />)}</QueryState>
  </>;
}
export function ReviewPage() {
  const query = useCheckout();
  const addresses = useAddresses();
  const place = useAccountMutation('placeOrder', ['cart', 'orders', 'notifications', 'checkout']);
  const navigate = useNavigate();
  const [acknowledged, setAcknowledged] = useState(false);
  const [keyError, setKeyError] = useState(null);
  const attempt = useRef(null);
  const checkout = query.data;
  const placeOrder = async () => {
    if (!acknowledged || place.isPending || place.error?.status === 409 || !canReview(checkout)) return;
    try {
      attempt.current ||= { checkoutSessionId: checkout.id, idempotencyKey: submissionKey(checkout.id), paymentMethod: 'DEMO_CHECKOUT', demoAcknowledged: true };
      const order = await place.run(attempt.current);
      if (order) navigate(`/order-confirmation/${order.id}`, { replace: true });
    } catch (error) {
      if (!error.status && error.name !== 'ApiError') setKeyError(error);
    }
  };
  const reload = async () => { attempt.current = null; setAcknowledged(false); place.reset(); await query.refetch(); };
  return <>
    <PageHeading title="Review your order" description="Check your delivery details before placing a demo order." />
    <Stepper step={2} />
    <QueryState query={query}>{checkout && (checkout.cart.items.length ? <div className="commerce-grid"><div className="commerce-stack">
      <Card title="Delivery details" icon={MapPin}><Link className="commerce-edit" to="/checkout/delivery">Edit delivery</Link><QueryState query={addresses}><AddressText address={addresses.data?.find((address) => address.id === checkout.selectedAddressId)} /></QueryState><p><strong>{deliveryLabel(checkout.deliveryMethod)}</strong></p><p>{arrival(checkout)}</p></Card>
      <Card title="Order items"><Link className="commerce-edit" to="/cart">Edit cart</Link><ItemList items={checkout.cart.items} currency={checkout.cart.currency} /></Card>
      <Link to="/checkout/delivery">← Back to delivery</Link>
    </div><OrderSummary data={checkout} showItems={false}>
      <div className="demo-checkout"><h3><CreditCard size={18} aria-hidden="true" />Demo checkout</h3><p>This is a portfolio/demo project. No payment is collected and no physical delivery occurs. Your order timeline and notifications are saved to your account.</p>
        <label className="commerce-checkbox"><input type="checkbox" checked={acknowledged} disabled={place.isPending} onChange={(event) => setAcknowledged(event.target.checked)} />I understand this is a demo order.</label></div>
      {!canReview(checkout) && <p className="commerce-note">Your checkout needs an address and a delivery quote. <Link to="/checkout/delivery">Complete delivery</Link></p>}
      <ErrorMessage error={place.error || keyError} />
      {place.error?.status === 409 && <button className="commerce-button commerce-button--secondary" onClick={reload} disabled={place.isPending || query.isFetching}>Refresh checkout and review</button>}
      <button className="commerce-button" onClick={placeOrder} disabled={!acknowledged || !canReview(checkout) || place.isPending || place.error?.status === 409 || query.isFetching || addresses.isPending || addresses.isError || !addresses.data?.some((address) => address.id === checkout.selectedAddressId)}>{place.isPending ? 'Placing your demo order…' : place.error && place.error.status !== 409 ? 'Retry the same demo order' : 'Place demo order'}<ArrowRight size={18} /></button>
      <p className="commerce-note">Prices and availability are checked again by the server. If a request fails, retrying uses the same submission key.</p>
    </OrderSummary></div> : <EmptyState title="No items to review" text="Your cart may have changed or an order may already have been placed. Check My orders before trying again." orders />)}</QueryState>
  </>;
}
