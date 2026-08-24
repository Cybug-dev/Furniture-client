// @ts-nocheck
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.12 + i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function DefaultBanner({ content, isActive }) {
  return (
    <div className="default-banner">
      <div className="default-banner__veil" />
      <motion.div
        className="default-banner__copy"
        initial="hidden"
        animate={isActive ? "show" : "hidden"}
      >
        <motion.p className="default-banner__kicker" variants={fadeUp} custom={0}>
          {content.kicker}
        </motion.p>
        <motion.h2 className="default-banner__heading" variants={fadeUp} custom={1}>
          {content.heading}
        </motion.h2>
        <motion.p className="default-banner__sub" variants={fadeUp} custom={2}>
          {content.subtext}
        </motion.p>
        <motion.a
          className="default-banner__cta"
          href={content.ctaHref}
          variants={fadeUp}
          custom={3}
        >
          {content.ctaLabel}
        </motion.a>
      </motion.div>
    </div>
  );
}
