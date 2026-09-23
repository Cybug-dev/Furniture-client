import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { useCurrentUser } from '../../auth/auth.hooks.js';
import { useCart } from '../commerce.hooks.js';
import './AccountActions.scss';

export default function CheckoutReminder() {
  const { data: user } = useCurrentUser();
  const cart = useCart();
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);
  const eligible = pathname === '/' || pathname === '/shop' || pathname.startsWith('/products/');
  useEffect(() => {
    if (!user?.id || !cart.data?.items.length) setVisible(false);
  }, [user?.id, cart.data?.items.length]);
  useEffect(() => {
    if (!user?.id || !eligible || !cart.data?.items.length) return;
    const key = `furniture:checkout-reminder:${user.id}`;
    let elapsed = 0;
    try { if (sessionStorage.getItem(key) !== 'pending') return; } catch { return; }
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      elapsed += 10;
      if (elapsed < 120 || document.querySelector('[aria-modal="true"], .first-visit__cookie')) return;
      setVisible(true);
      try { sessionStorage.setItem(key, 'shown'); } catch { /* Local UI only. */ }
      window.clearInterval(timer);
    }, 10_000);
    return () => window.clearInterval(timer);
  }, [user?.id, eligible, cart.data?.items.length]);
  if (!visible || !eligible || !user || !cart.data?.items.length) return null;
  return <aside className="checkout-reminder" aria-label="Checkout reminder"><p>You still have items waiting in your checkout.</p><div><Link to="/checkout" onClick={() => setVisible(false)}>Resume checkout →</Link><button onClick={() => setVisible(false)}>Dismiss</button></div></aside>;
}
