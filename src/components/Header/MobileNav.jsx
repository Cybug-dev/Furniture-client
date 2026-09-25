import { AnimatePresence, motion } from 'framer-motion';
import { Bell, ChevronDown, Home, Leaf, LogOut, Mail, Package, ShoppingBag, UserRound, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useCurrentUser, useLogout } from '../../auth/auth.hooks.js';
import { NAV_LINKS } from './navLinks.js';
import './MobileNav.scss';

const primaryIcons = { Home, Shop: ShoppingBag, About: Leaf, Contact: Mail };

const drawerVariants = {
  closed: { x: '-100%', transition: { duration: 0.16, ease: [0.4, 0, 1, 1] } },
  open: { x: 0, transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] } },
};

const overlayVariants = {
  closed: { opacity: 0, transition: { duration: 0.12 } },
  open: { opacity: 1, transition: { duration: 0.16 } },
};

function userName(user) {
  if (!user) return 'Sign in or create account';
  return [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
    || user.name
    || user.email?.split('@')[0]
    || 'Your account';
}

export default function MobileNav({ isOpen, showAccountAttention, onClose, openDropdown, onToggleDropdown, onCloseDropdown }) {
  const { data: user } = useCurrentUser();
  const logout = useLogout();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const closeAfterNavigation = () => { onCloseDropdown(); onClose(); };

  return (
    <AnimatePresence>
      {isOpen && <>
        <motion.button type="button" className="mobile-nav-overlay" variants={overlayVariants} initial="closed" animate="open" exit="closed" onClick={onClose} aria-label="Close navigation menu" />
        <motion.nav id="primary-navigation" className="mobile-nav" aria-label="Main navigation" variants={drawerVariants} initial="closed" animate="open" exit="closed">
          <div className="mobile-nav-top">
            <div className={`mobile-nav-avatar${showAccountAttention ? ' mobile-nav-avatar--attention' : ''}`}><UserRound size={24} aria-hidden="true" /></div>
            <Link to={user ? '/profile' : '/auth'} className="mobile-nav-signin" onClick={closeAfterNavigation}>{userName(user)}</Link>
            <button type="button" className="mobile-nav-close" aria-label="Close navigation menu" onClick={onClose}><X size={24} aria-hidden="true" /></button>
          </div>

          <ul className="mobile-nav-list mobile-nav-list--primary">
            {NAV_LINKS.map((link) => {
              const Icon = primaryIcons[link.label];
              const active = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
              return <li key={link.href} className="mobile-nav-item">
                {link.hasDropdown ? <>
                  <button type="button" className={`mobile-nav-link has-dropdown${active ? ' is-active' : ''}${openDropdown === link.label ? ' is-open' : ''}`} aria-expanded={openDropdown === link.label} onClick={() => onToggleDropdown(link.label)}>
                    <span className="mobile-nav-link__label"><Icon size={23} aria-hidden="true" />{link.label}</span><ChevronDown className="mobile-nav-chevron" size={18} aria-hidden="true" />
                  </button>
                  <AnimatePresence initial={false}>{openDropdown === link.label && <motion.ul className="mobile-nav-submenu" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}>
                    {link.submenu.map((item) => <li key={item.href}><Link to={item.href} className="mobile-nav-sublink" onClick={closeAfterNavigation}>{item.label}</Link></li>)}
                  </motion.ul>}</AnimatePresence>
                </> : <Link to={link.href} className={`mobile-nav-link${active ? ' is-active' : ''}`} onClick={closeAfterNavigation}><span className="mobile-nav-link__label"><Icon size={23} aria-hidden="true" />{link.label}</span></Link>}
              </li>;
            })}
          </ul>

          {user && <ul className="mobile-nav-list mobile-nav-list--account">
            <li><Link className="mobile-nav-link" to="/profile" onClick={closeAfterNavigation}><span className="mobile-nav-link__label"><UserRound size={23} />Profile</span></Link></li>
            <li><Link className="mobile-nav-link" to="/orders" onClick={closeAfterNavigation}><span className="mobile-nav-link__label"><Package size={23} />My orders</span></Link></li>
            <li><Link className="mobile-nav-link" to="/notifications" onClick={closeAfterNavigation}><span className="mobile-nav-link__label"><Bell size={23} />Notifications</span></Link></li>
          </ul>}

          {user && <div className="mobile-nav-footer"><button className="mobile-nav-link" type="button" disabled={logout.isPending} onClick={async () => { try { await logout.mutateAsync(); } finally { closeAfterNavigation(); navigate('/auth'); } }}><span className="mobile-nav-link__label"><LogOut size={23} />{logout.isPending ? 'Signing out…' : 'Logout'}</span></button></div>}
        </motion.nav>
      </>}
    </AnimatePresence>
  );
}
