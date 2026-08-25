// @ts-nocheck
import { motion } from "framer-motion";

const fade = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.08 + i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  }),
};

function formatPrice(n) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function ShowcaseBanner({ content, isActive }) {
  return (
    <div className="showcase-banner">
      <div className="showcase-banner__veil" />
      <motion.div
        className="showcase-banner__inner"
        initial="hidden"
        animate={isActive ? "show" : "hidden"}
      >
        <motion.h2 className="showcase-banner__heading" variants={fade} custom={0}>
          {content.heading}
        </motion.h2>
        <motion.p className="showcase-banner__sub" variants={fade} custom={1}>
          {content.subtext}
        </motion.p>
        <ul className="showcase-banner__grid">
          {content.products.map((product, i) => (
            <motion.li key={product.name} variants={fade} custom={i + 2}>
              <a className="showcase-banner__card is-clickable" href="#collection">
                <img src={product.image} alt={product.name} loading="lazy" decoding="async" />
                <div>
                  <p className="showcase-banner__name">{product.name}</p>
                  <p className="showcase-banner__price">{formatPrice(product.price)}</p>
                </div>
              </a>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}
