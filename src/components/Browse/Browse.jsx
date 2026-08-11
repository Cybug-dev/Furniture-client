import './Browse.scss';
import { motion, useReducedMotion } from 'framer-motion';
import diningImg from '../../assets/images/dining.png';
import livingImg from '../../assets/images/living.png';
import bedroomImg from '../../assets/images/bedroom.png';

// Keep the existing markup and class names intact because Browse.scss still targets
// .browse, .browse-heading, .browse-grid, .browse-item and .browse-label directly.
// The motion wrappers only add the reveal animation without changing the layout.
const categories = [
  { name: 'Dining', img: diningImg, alt: 'Dining' },
  { name: 'Living', img: livingImg, alt: 'Living' },
  { name: 'Bedroom', img: bedroomImg, alt: 'Bedroom' },
];

// Renders the browse categories section for the furniture storefront.
const Browse = () => {
  const shouldReduceMotion = useReducedMotion();

  const revealInitial = {
    opacity: 0,
    y: shouldReduceMotion ? 0 : 24,
  };

  const revealAnimate = {
    opacity: 1,
    y: 0,
  };

  return (
    <section className="browse">
      <motion.div
        className="browse-heading"
        initial={revealInitial}
        whileInView={revealAnimate}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <h2>Browse</h2>
        <p>Make sure to Browse through our collection and find your perfect piece.</p>
      </motion.div>

      <div className="browse-grid">
        {categories.map((item, index) => (
          <motion.div
            key={item.name}
            className="browse-item"
            initial={revealInitial}
            whileInView={revealAnimate}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              duration: 0.5,
              delay: index * 0.15,
              ease: 'easeOut',
            }}
          >
            <img src={item.img} alt={item.alt} />
            <span className="browse-label">{item.name}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Browse;
