import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router';
import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y, Autoplay, Keyboard } from 'swiper/modules';
import { X } from 'lucide-react';
import 'swiper/css';
import { useCurrentUser } from '../../auth/auth.hooks.js';
import { campaigns } from './campaigns.data.js';
import { useFirstVisit } from './useFirstVisit.js';
import './FirstVisitExperience.scss';

function PromoDialog({ isAuthenticated, onClose }) {
  const navigate = useNavigate();
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const swiperRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusable = dialogRef.current?.querySelectorAll('a[href], button:not([disabled])');
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (!dialogRef.current?.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [onClose]);

  const openCampaign = (event, campaign) => {
    event.preventDefault();
    onClose();
    navigate(campaign.destination);
    window.requestAnimationFrame(() => {
      document.getElementById('products')?.scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth',
        block: 'start',
      });
    });
  };

  return (
    <motion.div
      className="first-visit__backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.22 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.section
        ref={dialogRef}
        className="first-visit__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="first-visit-title"
        aria-describedby="first-visit-description"
        initial={reducedMotion ? false : { opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 8 }}
        transition={{ duration: reducedMotion ? 0 : 0.28, ease: 'easeOut' }}
      >
        <h2 id="first-visit-title" className="first-visit__sr-only">
          Welcome to Furniture
        </h2>
        <p id="first-visit-description" className="first-visit__sr-only">
          Browse furniture selected for a comfortable home.
        </p>
        <button
          ref={closeRef}
          className="first-visit__close"
          type="button"
          aria-label="Close welcome promotion"
          onClick={onClose}
        >
          <X size={20} aria-hidden="true" />
        </button>
        <div
          className="first-visit__carousel"
          role="region"
          aria-roledescription="carousel"
          aria-label="Furniture promotions"
          onFocusCapture={() => swiperRef.current?.autoplay?.pause()}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              swiperRef.current?.autoplay?.resume();
            }
          }}
        >
          <Swiper
            className="first-visit__swiper"
            modules={[Autoplay, A11y, Keyboard]}
            slidesPerView={1}
            loop
            speed={reducedMotion ? 0 : 300}
            allowTouchMove
            threshold={8}
            preventClicks
            preventClicksPropagation
            autoplay={reducedMotion ? false : {
              delay: 2000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            keyboard={{ enabled: true, onlyInViewport: true }}
            a11y={{ enabled: true }}
            onSwiper={(swiper) => { swiperRef.current = swiper; }}
            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          >
            {campaigns.map((campaign, index) => (
              <SwiperSlide key={campaign.id} className="first-visit__slide">
                <a
                  className="first-visit__campaign"
                  href={campaign.destination}
                  onClick={(event) => openCampaign(event, campaign)}
                  aria-label={`Browse products from ${campaign.id.replaceAll('-', ' ')}`}
                  tabIndex={activeIndex === index ? 0 : -1}
                >
                  <img
                    src={campaign.image}
                    alt={campaign.alt}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                  />
                </a>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="first-visit__dots" role="group" aria-label="Choose a promotion">
            {campaigns.map((campaign, index) => (
              <button
                key={campaign.id}
                className={`first-visit__dot${activeIndex === index ? ' is-active' : ''}`}
                type="button"
                aria-label={`Show promotion ${index + 1} of ${campaigns.length}`}
                aria-current={activeIndex === index ? 'true' : undefined}
                onClick={() => swiperRef.current?.slideToLoop(index)}
              />
            ))}
          </div>
        </div>
        {!isAuthenticated && (
          <p className="first-visit__account-prompt">
            New here? <Link to="/auth" onClick={onClose}>Create an account</Link> to get started.
          </p>
        )}
      </motion.section>
    </motion.div>
  );
}

function CookieNotice({ onChoice }) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.aside
      className="first-visit__cookie"
      aria-label="Cookie notice"
      initial={reducedMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: reducedMotion ? 0 : 0.25, ease: 'easeOut' }}
    >
      <p>
        We use essential cookies for account sessions. Accept to hide this
        notice; no optional cookies are enabled.
      </p>
      <div className="first-visit__cookie-actions">
        <button type="button" className="first-visit__cookie-secondary" onClick={() => onChoice('dismissed')}>
          Dismiss
        </button>
        <button type="button" className="first-visit__cookie-primary" onClick={() => onChoice('accepted')}>
          Accept
        </button>
      </div>
    </motion.aside>
  );
}

export default function FirstVisitExperience() {
  const { data: user, isPending } = useCurrentUser();
  const isHomePage = useLocation().pathname === '/';
  const { isPromoOpen, isCookieNoticeOpen, dismissPromo, chooseCookies } = useFirstVisit(isHomePage);

  useEffect(() => {
    if (!isHomePage && isPromoOpen) dismissPromo();
  }, [isHomePage, isPromoOpen, dismissPromo]);

  if (isPending) return null;

  return (
    <div className="first-visit">
      <AnimatePresence>
        {isHomePage && isPromoOpen && (
          <PromoDialog key="promo" isAuthenticated={Boolean(user)} onClose={dismissPromo} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isCookieNoticeOpen && <CookieNotice key="cookie" onChoice={chooseCookies} />}
      </AnimatePresence>
    </div>
  );
}
