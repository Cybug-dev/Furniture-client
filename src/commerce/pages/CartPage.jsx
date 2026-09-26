import { useCallback, useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, ArrowRight, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { useProducts } from '../../hooks/apiHooks.js';
import { useAccountMutation, useCart } from '../commerce.hooks.js';
import { cartCount, money } from '../commerce.utils.js';
import { Card, CommerceBenefits, EmptyState, ErrorMessage, OrderSummary, PageHeading, ProductImage, QueryState } from '../components/CommerceUI';
import ProductCard from '../../components/Products/ProductCard.jsx';
import ProductNotice from '../../components/Products/ProductNotice.jsx';

function listProducts(payload) {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}
function EmptyCart() {
  const products = useProducts({ page: 1, limit: 4 });
  const suggestions = listProducts(products.data).slice(0, 4);
  const [notice, setNotice] = useState(null);
  const showNotice = useCallback((next) => setNotice({ ...next, id: Date.now() }), []);
  const closeNotice = useCallback(() => setNotice(null), []);
  return <><div className="empty-cart-layout">
    <EmptyState title="Your cart is empty" text="Discover our furniture collection and find something you'll love." icon={ShoppingCart} orders />
    {suggestions.length > 0 && <section className="cart-suggestions" aria-labelledby="cart-suggestions-title"><h2 id="cart-suggestions-title">You might like</h2><div className="products__grid products__grid--recommendations">{suggestions.map((product) => <ProductCard product={product} onNotice={showNotice} key={product.id} />)}</div><Link to="/shop" className="products__show-more">Show More</Link></section>}
  </div><ProductNotice notice={notice} onClose={closeNotice} /></>;
}

export default function CartPage() {
  const query = useCart();
  const update = useAccountMutation('updateItem', ['cart', 'checkout'], 'cart');
  const remove = useAccountMutation('removeItem', ['cart', 'checkout'], 'cart');
  const clear = useAccountMutation('clearCart', ['cart', 'checkout'], 'cart');
  const [confirmClear, setConfirmClear] = useState(false);
  const [notice, setNotice] = useState(null);
  const closeNotice = useCallback(() => setNotice(null), []);
  const busy = update.isPending || remove.isPending || clear.isPending;
  const items = query.data?.items || [];
  const change = async (mutation, input, successMessage) => {
    try {
      await mutation.run(input);
      if (successMessage) setNotice({ type: 'success', message: successMessage, id: Date.now() });
    } catch { /* Inline error. */ }
  };
  return <>
    <PageHeading title="Your Cart" description={query.data ? `${cartCount(query.data)} items in your cart.` : 'Your favourite pieces, saved to your account.'} />
    <QueryState query={query}>
      {items.length === 0 ? <EmptyCart /> : <div className="commerce-grid commerce-grid--cart">
        <Card title={`Your cart (${cartCount(query.data)} items)`} icon={ShoppingCart}>
          <ul className="cart-list">{items.map((item) => <li key={item.id} className="cart-line">
            <Link to={`/products/${encodeURIComponent(item.productId)}`} aria-label={`View ${item.productName}`}><ProductImage src={item.imageUrl} name={item.productName} /></Link>
            <div className="cart-line__content"><Link to={`/products/${encodeURIComponent(item.productId)}`}><h3>{item.productName}</h3></Link><p>{money(item.unitPrice, query.data.currency)} each</p><span className={item.available ? 'commerce-stock' : 'commerce-error-text'}>{item.available ? 'Available' : 'Unavailable — remove or adjust this item'}</span>
              <div className="cart-line__actions"><div className="commerce-quantity" aria-label={`Quantity for ${item.productName}`}><button aria-label={`Decrease quantity of ${item.productName}`} disabled={busy || item.quantity <= 1} onClick={() => change(update, { id: item.id, quantity: item.quantity - 1 })}><Minus size={16} /></button><output aria-live="polite">{item.quantity}</output><button aria-label={`Increase quantity of ${item.productName}`} disabled={busy || !item.available || item.quantity >= Math.min(99, item.stockQuantity)} onClick={() => change(update, { id: item.id, quantity: item.quantity + 1 })}><Plus size={16} /></button></div><button className="commerce-text-button" disabled={busy} aria-label={`Remove ${item.productName}`} onClick={() => change(remove, item.id, `${item.productName} was removed from your cart.`)}><Trash2 size={16} /> Remove</button></div>
            </div><strong className="cart-line__total">{money(item.lineTotal, query.data.currency)}</strong>
          </li>)}</ul>
          <ErrorMessage error={update.error || remove.error || clear.error} />
          <div className="commerce-actions commerce-actions--between"><Link to="/shop"><ArrowLeft size={16} /> Continue shopping</Link><button className="commerce-text-button" disabled={busy} onClick={() => setConfirmClear(true)}>Clear cart</button></div>
          {confirmClear && <div className="commerce-note"><p>Remove all items from your cart?</p><div className="commerce-actions"><button className="commerce-button commerce-button--secondary" disabled={busy} onClick={async () => { await change(clear, undefined, 'Your cart was cleared.'); setConfirmClear(false); }}>Yes, clear cart</button><button className="commerce-text-button" onClick={() => setConfirmClear(false)}>Keep items</button></div></div>}
        </Card>
        <div className="commerce-stack"><OrderSummary data={query.data} showItems={false}>{items.every((item) => item.available && item.quantity <= item.stockQuantity && item.quantity <= 99) && !busy ? <Link className="commerce-button" to="/checkout">Proceed to checkout <ArrowRight size={18} /></Link> : <p className="commerce-note">Resolve unavailable items or wait for your changes to finish before continuing.</p>}</OrderSummary><CommerceBenefits /></div>
      </div>}
    </QueryState>
    <ProductNotice notice={notice} onClose={closeNotice} />
  </>;
}
