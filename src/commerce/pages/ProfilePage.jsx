import { Link, useNavigate } from 'react-router';
import { Bell, MapPin, Package, ShoppingCart, UserRound } from 'lucide-react';
import { useCurrentUser, useLogout } from '../../auth/auth.hooks.js';
import { commerceApi } from '../commerce.api.js';
import { useAccountQuery, useCart, useNotifications } from '../commerce.hooks.js';
import { cartCount } from '../commerce.utils.js';
import AddressBook from '../components/AddressBook';
import { Card, ErrorMessage, PageHeading } from '../components/CommerceUI';

export default function ProfilePage() {
  const { data: user } = useCurrentUser();
  const logout = useLogout();
  const navigate = useNavigate();
  const cart = useCart();
  const notifications = useNotifications();
  const active = useAccountQuery('orders', (signal) => commerceApi.orders({ view: 'active', limit: 1 }, signal), { key: ['count', 'active'] });
  const previous = useAccountQuery('orders', (signal) => commerceApi.orders({ view: 'previous', limit: 1 }, signal), { key: ['count', 'previous'] });
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Your account';
  return <>
    <PageHeading title="My account" description="Your details, addresses and order activity in one place." />
    <div className="profile-layout"><Card className="profile-sidebar"><nav className="profile-links" aria-label="Account shortcuts"><a href="#account"><UserRound size={18} />Overview</a><Link to="/orders"><Package size={18} />Orders</Link><a href="#addresses"><MapPin size={18} />Addresses</a><Link to="/notifications"><Bell size={18} />Notifications</Link><Link to="/cart"><ShoppingCart size={18} />Cart</Link></nav><button className="commerce-text-button" disabled={logout.isPending} onClick={async () => { try { await logout.mutateAsync(); navigate('/auth'); } catch { /* Existing logout clears local state on settlement. */ } }}>{logout.isPending ? 'Signing out…' : 'Logout'}</button><ErrorMessage error={logout.error} /></Card><div className="commerce-stack"><Card className="profile-account"><div id="account" className="profile-account__identity"><div className="profile-avatar" aria-hidden="true">{name.slice(0, 1)}</div><div><h2>{name}</h2><p>{user.email}</p>{typeof user.emailVerified === 'boolean' && <span className="commerce-status">{user.emailVerified ? 'Email verified' : 'Email not verified'}</span>}</div></div><p className="commerce-note">Name and email are read-only because the current API does not support account editing.</p></Card><Card title="Quick stats"><div className="profile-stats">{[[active, active.data?.total, 'Active orders'], [previous, previous.data?.total, 'Previous orders'], [notifications, notifications.data?.unreadCount, 'Unread updates'], [cart, cart.data ? cartCount(cart.data) : undefined, 'Cart items']].map(([query, value, title]) => <div key={title}><strong>{value ?? '—'}</strong><span>{title}</span>{query.isError && <button className="commerce-text-button" onClick={() => query.refetch()}>Retry</button>}</div>)}</div></Card><div id="addresses"><AddressBook /></div></div></div>
  </>;
}
