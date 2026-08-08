import { useState } from 'react';
import styles from './Header.module.scss';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

function LogoIcon() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M4 10a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3.5a1.5 1.5 0 0 1-1 1.415V17a1 1 0 1 1-2 0v-2h-10v2a1 1 0 1 1-2 0v-2.085A1.5 1.5 0 0 1 4 13.5V10Zm2.5 1a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-11Z"
      />
    </svg>
  );
}

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
      <line x1="20" y1="20" x2="15.5" y2="15.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
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
  const cartItemCount = 0;

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <a href="/" className={styles.logo} aria-label="Furniture, go to homepage">
          <LogoIcon />
          <span className={styles.logoText}>Furniture</span>
        </a>

        <nav
          id="primary-navigation"
          className={styles.nav}
          aria-label="Main navigation"
          data-open={isMenuOpen}
        >
          <div className={styles.drawerTop}>
            <div className={styles.avatar}>
              <UserIcon />
            </div>
            <span>Sign In</span>
            <button
              type="button"
              className={styles.drawerClose}
              aria-label="Close navigation menu"
              onClick={() => setIsMenuOpen(false)}
            >
              <MenuIcon open />
            </button>
          </div>
          <ul className={styles.navList}>
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className={styles.navLink} onClick={() => setIsMenuOpen(false)}>
                  {link.label}
                </a>
              </li>
            ))}
            <li className={styles.favouriteItem}>
              <a href="/wishlist" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>
                <HeartIcon />
                <span>Favourites</span>
              </a>
            </li>
          </ul>
        </nav>

        <div className={styles.actions}>
          <button type="button" className={`${styles.iconButton} ${styles.desktopOnly}`} aria-label="Account">
            <UserIcon />
          </button>
          <button type="button" className={`${styles.iconButton} ${styles.mobileAction}`} aria-label="Search">
            <SearchIcon />
          </button>
          <button type="button" className={`${styles.iconButton} ${styles.desktopOnly}`} aria-label="Wishlist">
            <HeartIcon />
          </button>
          <button type="button" className={`${styles.iconButton} ${styles.mobileAction} ${styles.cartButton}`} aria-label="Cart">
            <CartIcon />
            {cartItemCount > 0 && <span className={styles.cartBadge}>{cartItemCount}</span>}
          </button>
          <button
            type="button"
            className={styles.menuToggle}
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
            aria-controls="primary-navigation"
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            <MenuIcon open={isMenuOpen} />
          </button>
        </div>
      </div>
      <button
        type="button"
        className={styles.overlay}
        aria-label="Close navigation menu"
        aria-hidden={!isMenuOpen}
        data-open={isMenuOpen}
        tabIndex={isMenuOpen ? 0 : -1}
        onClick={() => setIsMenuOpen(false)}
      />
    </header>
  );
}
