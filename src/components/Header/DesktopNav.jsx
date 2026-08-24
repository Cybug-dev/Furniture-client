import { motion, AnimatePresence } from 'framer-motion';
import './DesktopNav.scss';

/* ───────────────────────────────────────────
   Shared navigation data + icons
   (exported so MobileNav can reuse the same source of truth)
   ─────────────────────────────────────────── */
export const NAV_LINKS = [
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

export function ChevronIcon() {
  return (
    <svg
      className="desktop-nav-chevron"
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

/**
 * Pure horizontal navigation.
 * Hidden on mobile via CSS only. Zero drawer / toggle logic.
 */
export default function DesktopNav({
  openDropdown,
  onToggleDropdown,
  onCloseDropdown,
}) {
  return (
    <nav className="desktop-nav" aria-label="Main navigation">
      <ul className="desktop-nav-list">
        {NAV_LINKS.map((link) => (
          <motion.li
            key={link.href}
            className={`desktop-nav-item ${
              link.hasDropdown ? 'desktop-nav-item--dropdown' : ''
            }`}
            variants={itemVariants}
            onMouseEnter={() => {
              if (link.hasDropdown && window.innerWidth >= 768) {
                onToggleDropdown(link.label);
              }
            }}
            onMouseLeave={() => {
              if (link.hasDropdown && window.innerWidth >= 768) {
                onCloseDropdown();
              }
            }}
          >
            {link.hasDropdown ? (
              <>
                <button
                  type="button"
                  className={`desktop-nav-link has-dropdown ${
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
                      className="desktop-nav-dropdown"
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
                            className="desktop-nav-dropdown-link"
                            role="menuitem"
                            onClick={onCloseDropdown}
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
              <a href={link.href} className="desktop-nav-link">
                {link.label}
              </a>
            )}
          </motion.li>
        ))}
      </ul>
    </nav>
  );
}