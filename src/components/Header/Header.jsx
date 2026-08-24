import { motion, AnimatePresence } from 'framer-motion';
import { useHeader } from './useHeader';
import DesktopNav from './DesktopNav';
import MobileNav from './MobileNav';
import './Header.scss';
import logoImg from '../../assets/images/armchair-fill.png';

/* Icons used only by the header shell / actions */
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
    cartItemCount,
  } = useHeader();

  return (
    <>
      <motion.header
        className={`header ${isScrolled ? 'header--scrolled' : ''}`}
        variants={headerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="header-container">
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
              className="header-icon-btn header-desktop-only"
              aria-label="Account"
            >
              <UserIcon />
            </button>

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

            {/* Hamburger – mobile only */}
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
          </motion.div>
        </div>
      </motion.header>

      {/* Mobile drawer – completely outside header flow */}
      <MobileNav
        isOpen={isMenuOpen}
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