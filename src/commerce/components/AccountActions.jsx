import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Bell, UserRound } from 'lucide-react';
import { useCurrentUser, useLogout } from '../../auth/auth.hooks.js';
import { useNotifications } from '../commerce.hooks.js';
import './AccountActions.scss';

export default function AccountActions() {
  const { data: user } = useCurrentUser();
  const notifications = useNotifications();
  const logout = useLogout();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const container = useRef(null);
  const trigger = useRef(null);
  useEffect(() => {
    if (!open) return;
    const close = (event) => {
      if (event.type === 'keydown' && event.key === 'Escape') { setOpen(false); trigger.current?.focus(); }
      if (event.type === 'pointerdown' && !container.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('keydown', close);
    document.addEventListener('pointerdown', close);
    return () => { document.removeEventListener('keydown', close); document.removeEventListener('pointerdown', close); };
  }, [open]);
  if (!user) return <Link to="/auth" className="header-icon-btn header-desktop-only header-account header-account--attention" aria-label="Sign in or create an account"><UserRound size={20} /></Link>;
  const count = notifications.data?.unreadCount || 0;
  return <>
    <div className="account-actions header-desktop-only" ref={container} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
      <button ref={trigger} type="button" className="header-icon-btn" aria-label="Your account" aria-expanded={open} aria-controls="account-links" onClick={() => setOpen(!open)}><UserRound size={20} /></button>
      {open && <nav id="account-links" aria-label="Account" className="account-actions__popover">
        {[['/profile', 'Profile'], ['/orders', 'My orders'], ['/notifications', 'Notifications']].map(([to, title]) => <Link key={to} to={to} onClick={() => setOpen(false)}>{title}</Link>)}
        <button disabled={logout.isPending} onClick={async () => { try { await logout.mutateAsync(); setOpen(false); navigate('/auth'); } catch { setOpen(false); } }}>Logout</button>
      </nav>}
    </div>
    <Link to="/notifications" className="header-icon-btn header-cart-btn" aria-label={`Notifications${count ? `, ${count} unread` : ''}`}><Bell size={20} />{count > 0 && <span className="header-cart-badge" aria-hidden="true">{count > 99 ? '99+' : count}</span>}</Link>
  </>;
}
