import { useState, useEffect, useRef } from 'react';
import './Header.scss';
import logoImg from '../../assets/images/armchair-fill.png';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

/* ── Inline SVG icons — no external icon library needed ─────── */
function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path fill="none" stroke="currentColor" strokeWidth="1.8"
        d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8c0-3.314 3.134-6 7-6s7 2.686 7 6" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <circle cx="11" cy="11" r="6" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <line x1="20" y1="20" x2="15.5" y2="15.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/* Separate close icon — used in search bar and drawer */
function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
        d="M5 5l14 14M19 5 5 19" />
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

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Ref so we can imperatively focus the input when the search bar opens
  const searchInputRef = useRef(null);

  const cartItemCount = 0; // wire to real cart state later

  // Auto-focus search input whenever the search bar slides open
  useEffect(() => {
    if (isSearchOpen) searchInputRef.current?.focus();
  }, [isSearchOpen]);

  // Close both drawer and search bar on Escape key
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <header className="header">

      {/* ── Top bar: logo | nav | action icons ───────────────── */}
      <div className="header-container">

        {/* Brand logo */}
        <a href="/" className="header-logo" aria-label="Furniture, go to homepage">
          <img src={logoImg} alt="" className='logo-img' />
          <span className="header-logo-text">Furniture</span>
        </a>

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
              <li key={link.href}>
                <a
                  href={link.href}
                  className="header-nav-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}

            {/* Favourites — only visible inside the mobile drawer */}
            <li className="header-fav-item">
              <a href="/wishlist" className="header-nav-link" onClick={() => setIsMenuOpen(false)}>
                <HeartIcon />
                <span>Favourites</span>
              </a>
            </li>
          </ul>
        </nav>

        {/* ── Right-side action icons ───────────────────────── */}
        <div className="header-actions">

          {/* User — desktop only */}
          <button type="button" className="header-icon-btn header-desktop-only" aria-label="Account">
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

          {/* Wishlist — desktop only */}
          <button type="button" className="header-icon-btn header-desktop-only" aria-label="Wishlist">
            <HeartIcon />
          </button>

          {/* Cart — always visible, badge shows item count */}
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
        </div>
      </div>

      {/* ── Search bar — slides below header on toggle ────────
          max-height transition drives the slide animation
          data-open="true" expands it, false collapses it     */}
      <div className="header-search-bar" data-open={isSearchOpen} role="search">
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
      aria-label="Clear search"
      onClick={() => setIsSearchOpen(false)}
    >
      <CloseIcon />
    </button>
  </div>
</div>

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
    </header>
  );
}
