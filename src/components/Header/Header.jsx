import { motion, AnimatePresence } from 'framer-motion';
import { Truck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useHeader } from './useHeader';
import DesktopNav from './DesktopNav';
import MobileNav from './MobileNav';
import './Header.scss';
import logoImg from '../../assets/images/armchair-fill.png';
import menuIconImg from '../../assets/images/menu_icon.png';
import { useCurrentUser } from '../../auth/auth.hooks.js';
import AccountActions from '../../commerce/components/AccountActions';
import { useCart } from '../../commerce/commerce.hooks.js';
import { cartCount } from '../../commerce/commerce.utils.js';

/* Icons used only by the header shell / actions */

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <circle cx="11" cy="11" r="6" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <line
        x1="20"
        y1="20"
        x2="15.5"
        y2="15.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        d="M5 5l14 14M19 5 5 19"
      />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 4h2l2.4 12.2a2 2 0 0 0 2 1.6h7.2a2 2 0 0 0 2-1.6L20 8H6"
      />
      <circle cx="9.5" cy="20" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="17" cy="20" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}

function MenuIcon({ open }) {
  return open ? (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
      <path fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" d="M5 5l14 14M19 5 5 19" />
    </svg>
  ) : (
    <img className="header-menu-icon" src={menuIconImg} alt="" aria-hidden="true" />
  );
}

const headerVariants = {
  hidden: { opacity: 0, y: -12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

/**
 * Pure composition shell.
 * All state & side-effects live in useHeader.
 */
export default function Header() {
  const { data: currentUser, isPending: isAuthPending } = useCurrentUser();
  const showAccountAttention = !isAuthPending && !currentUser;
  const cart = useCart();
  const cartItemCount = currentUser ? cartCount(cart.data) : 0;
  const utilityMessages = [
    { id: 'shipping', label: 'Free shipping on orders over ₦100,000', icon: true },
    { id: 'tracking', label: 'Track your order', to: '/orders' },
    { id: 'help', label: 'Need help? Contact us', to: '/contact' },
    ...(!currentUser ? [{ id: 'auth', label: 'Login / Sign Up', to: '/auth' }] : []),
  ];
  const [utilityMessageIndex, setUtilityMessageIndex] = useState(0);
  const {
    isMenuOpen,
    toggleMenu,
    closeMenu,
    isSearchOpen,
    toggleSearch,
    searchQuery,
    setSearchQuery,
    searchInputRef,
    searchBarRef,
    searchToggleRef,
    handleSearchSubmit,
    openDropdown,
    toggleDropdown,
    closeDropdown,
    isScrolled,
  } = useHeader();

  useEffect(() => {
    const timer = window.setInterval(() => {
      setUtilityMessageIndex((current) => (current + 1) % utilityMessages.length);
    }, 3500);

    return () => window.clearInterval(timer);
  }, [utilityMessages.length]);

  const activeUtilityMessage = utilityMessages[utilityMessageIndex] ?? utilityMessages[0];

  return (
    <>
      <motion.header
        className={`header ${isScrolled ? 'header--scrolled' : ''}`}
        variants={headerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="header-utility">
          <div className="header-utility__inner">
            <p className="header-utility__shipping">
              <Truck size={14} strokeWidth={1.8} aria-hidden="true" />
              <span>Free shipping on orders over ₦100,000</span>
            </p>
            <nav className="header-utility__links" aria-label="Customer assistance">
              <Link to="/orders">Track Order</Link>
              <Link to="/contact">Help</Link>
              {!currentUser && <Link to="/auth">Login / Sign Up</Link>}
            </nav>
            <div className="header-utility__mobile" aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeUtilityMessage.id}
                  className="header-utility__mobile-message"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  {activeUtilityMessage.icon && (
                    <Truck size={14} strokeWidth={1.8} aria-hidden="true" />
                  )}
                  {activeUtilityMessage.to ? (
                    <Link to={activeUtilityMessage.to}>{activeUtilityMessage.label}</Link>
                  ) : (
                    <span>{activeUtilityMessage.label}</span>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
        <div className="header-container">
          <button
            type="button"
            className="header-menu-toggle"
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
            aria-controls="primary-navigation"
            onClick={toggleMenu}
          >
            <MenuIcon open={isMenuOpen} />
          </button>

          {/* Logo */}
          <motion.a
            href="/"
            className="header-logo"
            aria-label="Furniture, go to homepage"
            variants={itemVariants}
          >
            <img src={logoImg} alt="" className="logo-img" />
            <span className="header-logo-text">Furniture</span>
          </motion.a>

          {/* Desktop navigation – lives inside the bar */}
          <DesktopNav
            openDropdown={openDropdown}
            onToggleDropdown={toggleDropdown}
            onCloseDropdown={closeDropdown}
          />

          {/* Actions */}
          <motion.div className="header-actions" variants={itemVariants}>
            <button
              type="button"
              className="header-icon-btn"
              aria-label="Toggle search"
              aria-expanded={isSearchOpen}
              onClick={toggleSearch}
              ref={searchToggleRef}
            >
              <SearchIcon />
            </button>

            <AccountActions />

            <Link
              to="/cart"
              className="header-icon-btn header-cart-btn"
              aria-label={`Cart, ${cartItemCount} items`}
            >
              <CartIcon />
              {cartItemCount > 0 && (
                <span className="header-cart-badge" aria-hidden="true">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </Link>

            {/* Hamburger – mobile only */}
          </motion.div>
        </div>
      </motion.header>

      {/* Mobile drawer – completely outside header flow */}
      <MobileNav
        isOpen={isMenuOpen}
        showAccountAttention={showAccountAttention}
        onClose={closeMenu}
        openDropdown={openDropdown}
        onToggleDropdown={toggleDropdown}
        onCloseDropdown={closeDropdown}
      />

      {/* Search bar */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            className="header-search-bar"
            role="search"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            ref={searchBarRef}
          >
            <div className="header-search-inner">
              <button
                type="button"
                className="header-search-icon"
                aria-label="Search"
                onClick={handleSearchSubmit}
              >
                <SearchIcon />
              </button>
              <input
                ref={searchInputRef}
                type="search"
                className="header-search-input"
                placeholder="Search furniture..."
                aria-label="Search furniture"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearchSubmit();
                  }
                }}
              />
              {searchQuery.length > 0 && (
                <button
                  type="button"
                  className="header-search-clear"
                  aria-label="Clear search"
                  onClick={() => {
                    setSearchQuery('');
                    searchInputRef.current?.focus();
                  }}
                >
                  <CloseIcon />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
