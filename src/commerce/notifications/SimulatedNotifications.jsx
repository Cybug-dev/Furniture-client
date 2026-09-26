import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router';
import { Star, X } from 'lucide-react';
import { useCurrentUser } from '../../auth/auth.hooks.js';
import { useProducts } from '../../hooks/apiHooks.js';
import { NotificationsContext } from './notificationsContext.js';
import './SimulatedNotifications.scss';

const STORAGE_PREFIX = 'furniture:simulated-notifications:';
const MAX_NOTIFICATIONS = 6;

function savedFor(userId) {
  try {
    const saved = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}${userId}`));
    return Array.isArray(saved) ? saved.slice(0, MAX_NOTIFICATIONS) : [];
  } catch { return []; }
}

function productImage(product) {
  const image = product.primaryImage || product.image || product.images?.[0];
  return typeof image === 'string' ? image : image?.url || image?.src || image?.secureUrl || image?.secure_url || '';
}

function createNotification(product, type) {
  if (type === 'order-demo') return {
    id: crypto.randomUUID(), type, createdAt: new Date().toISOString(),
    title: 'Your order has been shipped',
    message: 'Order #FD78421 is on the way. Estimated delivery: Sep 28.',
    label: '', action: 'Track order', image: productImage(product), href: '/orders', readAt: null,
  };
  const actualType = type;
  const name = product.name || 'This furniture piece';
  const category = String(product.category?.slug || product.category?.name || product.categorySlug || product.category || '').toLowerCase();
  const content = {
    new: ['New Arrival', category.includes('sofa') ? 'New sofas just arrived!' : 'New furniture just arrived!', 'Explore our latest collection designed for modern living.', 'Shop now'],
    stock: ['Back in Stock', 'Your favourite item is back!', `${name} is back in stock. Get it before it’s gone.`, 'View product'],
    deal: ['Limited Time', 'Up to 20% off selected items', 'Don’t miss our special offer on living room furniture.', 'See deals'],
    trending: ['Trending', 'Popular right now', `This ${category.includes('bed') ? 'bed frame' : 'furniture piece'} is trending. See why customers love it.`, 'View product'],
  }[actualType];
  return {
    id: crypto.randomUUID(), type: actualType, createdAt: new Date().toISOString(),
    title: content[1], message: content[2], label: content[0], action: content[3],
    toastTitle: actualType === 'new' ? 'New arrivals are here' : content[1],
    toastMessage: actualType === 'new' ? 'Fresh sofas, chairs, and tables are now available. Tap to explore.' : content[2],
    toastAction: actualType === 'new' ? 'See products' : content[3],
    image: productImage(product), href: `/products/${encodeURIComponent(product.id)}`, readAt: null,
  };
}

export function SimulatedNotificationsProvider({ children }) {
  const { data: user } = useCurrentUser();
  const productQuery = useProducts({ page: 1, limit: 48 }, { enabled: Boolean(user?.id) });
  const productsRef = useRef([]);
  const sequence = useRef(0);
  const initializedUser = useRef(null);
  const [store, setStore] = useState({ owner: null, items: [] });
  const [toast, setToast] = useState(null);
  const reducedMotion = useReducedMotion();
  const items = store.owner === user?.id ? store.items : [];

  useEffect(() => {
    const data = productQuery.data?.data;
    productsRef.current = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
  }, [productQuery.data]);

  useEffect(() => {
    if (initializedUser.current === (user?.id ?? null)) return;
    initializedUser.current = user?.id ?? null;
    if (!user?.id) {
      setStore({ owner: null, items: [] });
      setToast(null);
      return;
    }
    let saved = savedFor(user.id);
    const welcomeKey = `furniture:welcome-notification:${user.id}`;
    let alreadyShown = saved.some((item) => item.type === 'welcome');
    try { alreadyShown ||= localStorage.getItem(welcomeKey) === 'true'; } catch { /* Storage is optional. */ }
    setToast(null);
    if (!saved.some((item) => item.type === 'welcome')) {
      const welcome = {
        id: crypto.randomUUID(), type: 'welcome', createdAt: new Date().toISOString(),
        title: 'Welcome to Furniture!', message: 'Thanks for joining us. Explore our collections and get inspired.',
        label: '', action: 'Start shopping', image: '', href: '/shop', readAt: null,
      };
      saved = alreadyShown ? [...saved.slice(0, MAX_NOTIFICATIONS - 1), welcome] : [welcome, ...saved].slice(0, MAX_NOTIFICATIONS);
      try {
        localStorage.setItem(`${STORAGE_PREFIX}${user.id}`, JSON.stringify(saved));
        localStorage.setItem(welcomeKey, 'true');
      } catch { /* The welcome still appears for this visit. */ }
      if (!alreadyShown) setToast(welcome);
    }
    setStore({ owner: user.id, items: saved });
    sequence.current = 0;
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id || store.owner !== user.id) return;
    try { localStorage.setItem(`${STORAGE_PREFIX}${user.id}`, JSON.stringify(store.items)); }
    catch { /* The current visit still works without storage. */ }
  }, [store, user?.id]);

  useEffect(() => {
    if (!user?.id) return undefined;
    let seconds = 0;
    let nextAt = 15;
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      seconds += 1;
      if (seconds < nextAt) return;
      const available = productsRef.current.filter((product) => product.id && Number(product.stockQuantity) !== 0);
      if (!available.length) return;
      const types = ['trending', 'order-demo', 'deal', 'stock', 'new'];
      const type = types[sequence.current % types.length];
      const categoryKeyword = { new: 'sofa', stock: 'chair', 'order-demo': 'sofa', trending: 'bed' }[type];
      const categoryMatches = categoryKeyword ? available.filter((product) => String(product.category?.slug || product.category?.name || product.categorySlug || product.category || '').toLowerCase().includes(categoryKeyword)) : [];
      const pool = type === 'deal'
        ? available.filter((product) => {
          const original = Number(product.compareAtPrice);
          const discount = (original - Number(product.price)) / original;
          return discount > 0 && discount <= 0.2;
        })
        : categoryMatches;
      const product = (pool.length ? pool : available)[Math.floor(Math.random() * (pool.length || available.length))];
      const notification = createNotification(product, type);
      sequence.current += 1;
      nextAt = seconds + 15;
      setStore((current) => {
        const existing = current.owner === user.id ? current.items : [];
        const welcome = existing.find((item) => item.type === 'welcome');
        const recent = [notification, ...existing.filter((item) => item.type !== 'welcome')].slice(0, MAX_NOTIFICATIONS - (welcome ? 1 : 0));
        return { owner: user.id, items: welcome ? [...recent, welcome] : recent };
      });
      setToast(notification);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [user?.id]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 10_000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const markRead = (id) => setStore((current) => ({ ...current, items: current.items.map((item) => item.id === id ? { ...item, readAt: item.readAt || new Date().toISOString() } : item) }));
  const markAllRead = () => setStore((current) => ({ ...current, items: current.items.map((item) => ({ ...item, readAt: item.readAt || new Date().toISOString() })) }));
  const openToast = () => { markRead(toast.id); setToast(null); };

  return <NotificationsContext.Provider value={{ items, unreadCount: items.filter((item) => !item.readAt).length, markRead, markAllRead }}>
    {children}
    <AnimatePresence>
      {toast && user?.id && <motion.aside key={toast.id} className="simulated-toast" role="status" initial={reducedMotion ? false : { opacity: 0, x: 72 }} animate={{ opacity: 1, x: 0 }} exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 72 }} transition={{ duration: reducedMotion ? 0 : 0.28 }}>
        <Link to={toast.href} className="simulated-toast__link" onClick={openToast}>
          {toast.image ? <img src={toast.image} alt="" /> : <span className="simulated-toast__icon"><Star size={28} aria-hidden="true" /></span>}
          <span className="simulated-toast__copy"><strong>{toast.toastTitle || toast.title}</strong><small>{toast.toastMessage || toast.message}</small><b>{toast.toastAction || toast.action} →</b></span>
        </Link>
        <button type="button" className="simulated-toast__close" aria-label="Dismiss notification" onClick={() => setToast(null)}><X size={16} /></button>
      </motion.aside>}
    </AnimatePresence>
  </NotificationsContext.Provider>;
}
