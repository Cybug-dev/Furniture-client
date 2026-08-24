// @ts-nocheck
import { motion } from "framer-motion";

const fade = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 + i * 0.08, duration: 0.42, ease: [0.22, 1, 0.36, 1] },
  }),
};

function formatPrice(n) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function AdBanner({ content, isActive }) {
  return (
    <div className="ad-banner">
      <div className="ad-banner__veil" />
      <motion.div
        className="ad-banner__panel"
        initial="hidden"
        animate={isActive ? "show" : "hidden"}
      >
        <motion.a
          className="ad-banner__media is-clickable"
          href={content.ctaHref}
          variants={fade}
          custom={0}
        >
          <img
            src={content.productImage}
            alt={content.productName}
            loading="lazy"
            decoding="async"
          />
          <span className="ad-banner__discount">-{content.discount}%</span>
        </motion.a>
        <div className="ad-banner__meta">
          {content.badge ? (
            <motion.span className="ad-banner__badge" variants={fade} custom={1}>
              {content.badge}
            </motion.span>
          ) : null}
          <motion.h2 className="ad-banner__name" variants={fade} custom={2}>
            {content.productName}
          </motion.h2>
          <motion.p className="ad-banner__price" variants={fade} custom={3}>
            <span className="ad-banner__now">{formatPrice(content.price)}</span>
            {content.compareAt ? (
              <span className="ad-banner__was">{formatPrice(content.compareAt)}</span>
            ) : null}
          </motion.p>
          <motion.a className="ad-banner__cta" href={content.ctaHref} variants={fade} custom={4}>
            {content.ctaLabel}
          </motion.a>
        </div>
      </motion.div>
    </div>
  );
}
