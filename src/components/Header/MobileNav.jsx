import { motion, AnimatePresence } from 'framer-motion';
import { NAV_LINKS, ChevronIcon } from './DesktopNav';
import './MobileNav.scss';

/* Local icons (no style leakage from DesktopNav) */
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

const drawerVariants = {
  closed: {
    x: '105%',
    transition: { duration: 0.34, ease: [0.22, 1, 0.36, 1] },
  },
  open: {
    x: 0,
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
  },
};

const overlayVariants = {
  closed: { opacity: 0, transition: { duration: 0.28 } },
  open: { opacity: 1, transition: { duration: 0.32 } },
};

/**
 * Completely independent fixed drawer + overlay.
 * Never participates in header layout → header height is unaffected.
 */
export default function MobileNav({
  isOpen,
  onClose,
  openDropdown,
  onToggleDropdown,
  onCloseDropdown,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Dark overlay – click closes */}
          <motion.div
            className="mobile-nav-overlay"
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.nav
            id="primary-navigation"
            className="mobile-nav"
            aria-label="Main navigation"
            variants={drawerVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            {/* 1. Avatar + Sign In + close */}
            <div className="mobile-nav-top">
              <div className="mobile-nav-avatar">
                <UserIcon />
              </div>
              <span className="mobile-nav-signin">Sign In</span>
              <button
                type="button"
                className="mobile-nav-close"
                aria-label="Close navigation menu"
                onClick={onClose}
              >
                <CloseIcon />
              </button>
            </div>

            {/* 2. Navigation links */}
            <ul className="mobile-nav-list">
              {NAV_LINKS.map((link) => (
                <li key={link.href} className="mobile-nav-item">
                  {link.hasDropdown ? (
                    <>
                      <button
                        type="button"
                        className={`mobile-nav-link has-dropdown ${
                          openDropdown === link.label ? 'is-open' : ''
                        }`}
                        aria-expanded={openDropdown === link.label}
                        aria-haspopup="true"
                        onClick={() => onToggleDropdown(link.label)}
                      >
                        <span>{link.label}</span>
                        <ChevronIcon />
                      </button>

                      <AnimatePresence>
                        {openDropdown === link.label && (
                          <motion.ul
                            className="mobile-nav-submenu"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                            role="menu"
                          >
                            {link.submenu.map((item) => (
                              <li key={item.href} role="none">
                                <a
                                  href={item.href}
                                  className="mobile-nav-sublink"
                                  role="menuitem"
                                  onClick={() => {
                                    onCloseDropdown();
                                    onClose();
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
                      className="mobile-nav-link"
                      onClick={onClose}
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>

            {/* 3. Favourites (bottom) */}
            <div className="mobile-nav-footer">
              <a
                href="/wishlist"
                className="mobile-nav-link mobile-nav-fav"
                onClick={onClose}
              >
                <HeartIcon />
                <span>Favourites</span>
              </a>
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}