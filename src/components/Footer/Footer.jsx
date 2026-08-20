import React, { useState, useRef, useEffect } from 'react';
import './Footer.scss';
import logoImg from '../../assets/images/armchair-fill.png';
import visaImg from '../../assets/images/payments/visa.svg';
import mastercardImg from '../../assets/images/payments/mastercard.svg';
import paypalImg from '../../assets/images/payments/paypal.svg';
import verveImg from '../../assets/images/payments/verve.png';
import americanExpressImg from '../../assets/images/payments/american-express.svg';

const SHOP_CATEGORIES = [
  { label: 'Living Room', href: '/shop/living-room' },
  { label: 'Bedroom', href: '/shop/bedroom' },
  { label: 'Dining Room', href: '/shop/dining-room' },
  { label: 'Home Office', href: '/shop/office' },
  { label: 'Outdoor', href: '/shop/outdoor' },
  { label: 'Storage & Organization', href: '/shop/storage' },
];

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop', hasDropdown: true },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

const HELP_LINKS = [
  { label: 'Payment Options', href: '/help/payment-options' },
  { label: 'Returns', href: '/help/returns' },
  { label: 'Privacy Policies', href: '/help/privacy' },
];

const PAYMENT_METHODS = [
  { name: 'Visa', image: visaImg },
  { name: 'Mastercard', image: mastercardImg },
  { name: 'PayPal', image: paypalImg },
  { name: 'Verve', image: verveImg },
  { name: 'American Express', image: americanExpressImg },
];

const SOCIAL_LINKS = [
  {
    name: 'Facebook',
    href: 'https://facebook.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
      </svg>
    ),
  },
  {
    name: 'Instagram',
    href: 'https://instagram.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    name: 'Twitter',
    href: 'https://twitter.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.286-6.914-6.051 6.914H1.522l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: 'Pinterest',
    href: 'https://pinterest.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
      </svg>
    ),
  },
];

const Footer = () => {
  const [shopOpen, setShopOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  // Close dropdown on outside click / Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target)
      ) {
        setShopOpen(false);
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') setShopOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    // In a real app this would call an API
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 3500);
  };

  return (
    <footer className="footer">
      <div className="footer__container">
        {/* ========== MAIN CONTENT ========== */}
        <div className="footer__main">
          {/* Brand + Address + Social */}
          <div className="footer__brand">
            <a href="/" className="footer__logo" aria-label="Furniture Home">
              <img src={logoImg} alt="" className="footer__logo-image" />
              <span className="footer__logo-text">Furniture</span>
            </a>

            <address className="footer__address">
              400 University Drive Suite 200
              <br />
              Coral Gables,
              <br />
              FL 33134 USA
            </address>

            <div className="footer__social" aria-label="Social media">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="footer__social-link"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="footer__nav" aria-label="Footer navigation">
            <h3 className="footer__heading">Links</h3>
            <ul className="footer__list">
              {NAV_LINKS.map((link) => (
                <li key={link.label} className="footer__list-item">
                  {link.hasDropdown ? (
                    <div className="footer__shop-wrapper">
                      <button
                        ref={triggerRef}
                        type="button"
                        className={`footer__link footer__shop-trigger ${
                          shopOpen ? 'is-open' : ''
                        }`}
                        onClick={() => setShopOpen((prev) => !prev)}
                        aria-expanded={shopOpen}
                        aria-haspopup="true"
                      >
                        {link.label}
                        <svg
                          className="footer__chevron"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>

                      {shopOpen && (
                        <div
                          ref={dropdownRef}
                          className="footer__dropdown"
                          role="menu"
                        >
                          <ul className="footer__dropdown-list">
                            {SHOP_CATEGORIES.map((cat) => (
                              <li key={cat.label} role="none">
                                <a
                                  href={cat.href}
                                  className="footer__dropdown-link"
                                  role="menuitem"
                                  onClick={() => setShopOpen(false)}
                                >
                                  {cat.label}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <a href={link.href} className="footer__link">
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Help Links */}
          <nav className="footer__help" aria-label="Help">
            <h3 className="footer__heading">Help</h3>
            <ul className="footer__list">
              {HELP_LINKS.map((link) => (
                <li key={link.label} className="footer__list-item">
                  <a href={link.href} className="footer__link">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Newsletter */}
          <div className="footer__newsletter">
            <h3 className="footer__heading">Newsletter</h3>
            <p className="footer__newsletter-desc">
              Subscribe for exclusive offers, new arrivals & design inspiration.
            </p>

            <form className="footer__newsletter-form" onSubmit={handleSubscribe}>
              <div className="footer__input-group">
                <label htmlFor="footer-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="footer-email"
                  type="email"
                  className="footer__input"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
                <button type="submit" className="footer__subscribe-btn">
                  Subscribe
                </button>
              </div>

              {subscribed && (
                <p className="footer__success" role="status">
                  Thanks for subscribing!
                </p>
              )}
            </form>
          </div>
        </div>

        {/* ========== DIVIDER ========== */}
        <div className="footer__divider" aria-hidden="true" />

        {/* ========== BOTTOM BAR ========== */}
        <div className="footer__bottom">
          <p className="footer__copyright">
            &copy; {new Date().getFullYear()} Furniture. All rights reserved.
          </p>

          <div className="footer__payments" aria-label="Accepted payment methods">
            {PAYMENT_METHODS.map((method) => (
              <img key={method.name} src={method.image} alt={method.name} title={method.name} />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
