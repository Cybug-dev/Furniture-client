import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Header.scss';
import logoImg from '../../assets/images/armchair-fill.png';

/* ───────────────────────────────────────────
   Navigation data
   ─────────────────────────────────────────── */
const NAV_LINKS = [
  { label: 'Home', href: '/' },
  {
    label: 'Shop',
    href: '/shop',
    hasDropdown: true,
    submenu: [
      { label: 'Living Room', href: '/shop/living-room' },
      { label: 'Bedroom', href: '/shop/bedroom' },
      { label: 'Dining', href: '/shop/dining' },
      { label: 'Office', href: '/shop/office' },
      { label: 'Outdoor', href: '/shop/outdoor' },
    ],
  },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

/* ── Inline SVG icons — no external icon library needed ─────── */
function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8c0-3.314 3.134-6 7-6s7 2.686 7 6"
      />
    </svg>
  );
}

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

/* Separate close icon — used in search bar and drawer */
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

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        d="M12 20s-7-4.35-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 5c-2.5 4.65-9.5 9-9.5 9Z"
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

/* Hamburger/close toggle — swaps lines ↔ X based on open prop */
function MenuIcon({ open }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
      {open ? (
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          d="M5 5l14 14M19 5 5 19"
        />
      ) : (
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          d="M4 7h16M4 12h16M4 17h16"
        />
      )}
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg
      className="header-nav-chevron"
      viewBox="0 0 24 24"
      width="14"
      height="14"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 9l6 6 6-6"
      />
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────────
   Animation variants
   ────────────────────────────────────────────────────────────── */
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

const dropdownVariants = {
  hidden: { opacity: 0, y: 8, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: 6,
    scale: 0.98,
    transition: { duration: 0.2 },
  },
};

/* ──────────────────────────────────────────────────────────────
   Header Component
   ────────────────────────────────────────────────────────────── */
export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null); // tracks which dropdown is open
   // Ref so we can imperatively focus the input when the search bar opens
  const searchInputRef = useRef(null);

  const cartItemCount = 0; // replace with real cart state later

  // Auto-focus search input
  useEffect(() => {
    if (isSearchOpen) searchInputRef.current?.focus();
  }, [isSearchOpen]);

  // Close both drawer and search bar on Escape key
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsMenuOpen(false);
        setOpenDropdown(null);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // Close dropdown when clicking outside (desktop)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.header-nav-item--dropdown')) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const toggleDropdown = (label) => {
    setOpenDropdown((prev) => (prev === label ? null : label));
  };

  return (
    <motion.header
      className="header"
      variants={headerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="header-container">
        {/* 
      <div className="header-container">

        {/* Brand Logo */}
        <motion.a
          href="/"
          className="header-logo"
          aria-label="Furniture, go to homepage"
          variants={itemVariants}
        >
          <img src={logoImg} alt="" className="logo-img" />
          <span className="header-logo-text">Furniture</span>
        </motion.a>

        {/* Nav — horizontal on desktop, side drawer on mobile
            data-open drives the CSS transform via attribute selector */}
        <nav
          id="primary-navigation"
          className="header-nav"
          aria-label="Main navigation"
          data-open={isMenuOpen}
        >
          {/* Drawer header — avatar + sign in + close button (mobile only) */}
          <div className="header-drawer-top">
            <div className="header-avatar">
              <UserIcon />
            </div>
            <span>Sign In</span>
            <button
              type="button"
              className="header-drawer-close"
              aria-label="Close navigation menu"
              onClick={() => setIsMenuOpen(false)}
            >
              <CloseIcon />
            </button>
          </div>

          {/* Nav links */}
          <ul className="header-nav-list">
            {NAV_LINKS.map((link) => (
              <motion.li
                key={link.href}
                className={`header-nav-item ${link.hasDropdown ? 'header-nav-item--dropdown' : ''}`}
                variants={itemVariants}
                onMouseEnter={() => {
                  // Desktop hover open
                  if (link.hasDropdown && window.innerWidth >= 768) {
                    setOpenDropdown(link.label);
                  }
                }}
                onMouseLeave={() => {
                  if (link.hasDropdown && window.innerWidth >= 768) {
                    setOpenDropdown(null);
                  }
                }}
              >
                {link.hasDropdown ? (
                  <>
                    {/* Shop trigger */}
                    <button
                      type="button"
                      className={`header-nav-link has-dropdown ${openDropdown === link.label ? 'is-open' : ''}`}
                      aria-expanded={openDropdown === link.label}
                      aria-haspopup="true"
                      onClick={() => toggleDropdown(link.label)}
                    >
                      <span>{link.label}</span>
                      <ChevronIcon />
                    </button>

                    {/* Dropdown panel */}
                    <AnimatePresence>
                      {openDropdown === link.label && (
                        <motion.ul
                          className="header-dropdown"
                          variants={dropdownVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          role="menu"
                        >
                          {link.submenu.map((item) => (
                            <li key={item.href} role="none">
                              <a
                                href={item.href}
                                className="header-dropdown-link"
                                role="menuitem"
                                onClick={() => {
                                  setOpenDropdown(null);
                                  setIsMenuOpen(false);
                                }}
                              >
                                {item.label}
                              </a>
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <a
                    href={link.href}
                    className="header-nav-link"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                )}
              </motion.li>
            ))}

            {/* Favourites – mobile only */}
            <li className="header-fav-item">
              <a
                href="/wishlist"
                className="header-nav-link"
                onClick={() => setIsMenuOpen(false)}
              >
                <HeartIcon />
                <span>Favourites</span>
              </a>
            </li>
          </ul>
        </nav>

        {/* Action icons */}
        <motion.div className="header-actions" variants={itemVariants}>
          {/* User — desktop only */}
          <button
            type="button"
            className="header-icon-btn header-desktop-only"
            aria-label="Account"
          >
            <UserIcon />
          </button>

          {/* Search toggle — all screen sizes
              Icon swaps between magnifier and X depending on state */}
          <button
            type="button"
            className="header-icon-btn"
            aria-label={'Open search'}
            aria-expanded={isSearchOpen}
            onClick={() => setIsSearchOpen((prev) => !prev)}
          >
            <SearchIcon />
          </button>

          <button
            type="button"
            className="header-icon-btn header-desktop-only"
            aria-label="Wishlist"
          >
            <HeartIcon />
          </button>

          <button
            type="button"
            className="header-icon-btn header-cart-btn"
            aria-label={`Cart, ${cartItemCount} items`}
          >
            <CartIcon />
            {cartItemCount > 0 && (
              <span className="header-cart-badge" aria-hidden="true">
                {cartItemCount}
              </span>
            )}
          </button>

          {/* Hamburger — mobile only */}
          <button
            type="button"
            className="header-menu-toggle"
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
            aria-controls="primary-navigation"
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            <MenuIcon open={isMenuOpen} />
          </button>
        </motion.div>
      </div>

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
          >
            <div className="header-search-inner">
              <span className="header-search-icon" aria-hidden="true">
                <SearchIcon />
              </span>
              <input
                ref={searchInputRef}
                type="search"
                className="header-search-input"
                placeholder="Search furniture..."
                aria-label="Search furniture"
              />
              <button
                type="button"
                className="header-search-clear"
                aria-label="Clear input"
                onClick={() => {
                  
                  searchInputRef.current.value = '';
                }}
              >
                <CloseIcon />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Overlay — dims page behind open drawer
          Tapping it closes the drawer                         */}
      <button
        type="button"
        className="header-overlay"
        aria-label="Close navigation menu"
        aria-hidden={!isMenuOpen}
        data-open={isMenuOpen}
        tabIndex={isMenuOpen ? 0 : -1}
        onClick={() => setIsMenuOpen(false)}
      />
    </motion.header>
  );
}