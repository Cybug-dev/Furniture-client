import { motion } from 'framer-motion';
import './Hero.scss';

/**
 * Hero section – New Collection banner
 */
const HERO_IMAGE = '/hero-img.png';

// Animation variants – keep them simple and reusable
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.25,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1], // smooth easeOutQuart
    },
  },
};

const imageVariants = {
  hidden: { scale: 1.08, opacity: 0.85 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 1.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-heading">
      {/* Background media */}
      <div className="hero__media">
        <motion.img
          className="hero__image"
          src={HERO_IMAGE}
          width={2048}
          height={1152}
          alt="Minimalist living room with a rattan lounge chair, a potted palm, and a white storage cabinet"
          loading="eager"
          fetchPriority="high"
          variants={imageVariants}
          initial="hidden"
          animate="visible"
        />
      </div>

      {/* Content card – staggered entrance */}
      <motion.div
        className="hero__content"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.p className="hero__eyebrow" variants={itemVariants}>
          New Arrival
        </motion.p>

        <motion.h1
          id="hero-heading"
          className="hero__heading"
          variants={itemVariants}
        >
          Discover Our New Collection
        </motion.h1>

        <motion.p className="hero__description" variants={itemVariants}>
          Elevate your living space with pieces made to last — comfort and
          design, in equal measure.
        </motion.p>

        <motion.a
          href="/shop"
          className="hero__cta"
          variants={itemVariants}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          Buy Now
        </motion.a>
      </motion.div>
    </section>
  );
}