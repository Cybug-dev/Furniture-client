import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { motion, useReducedMotion } from 'framer-motion';
import './Browse.scss';

const categories = [
  {
    name: 'Living Room',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=720&h=900&q=80',
    alt: 'Bright living room with a cream sofa',
  },
  {
    name: 'Bedroom',
    image: 'https://images.unsplash.com/photo-1758072328635-586f3c121af2?auto=format&fit=crop&w=720&h=900&q=80',
    alt: 'Neutral bedroom with a large bed and wooden wardrobe',
  },
  {
    name: 'Dining',
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=720&h=900&q=80',
    alt: 'Contemporary dining room with wooden furniture',
  },
  {
    name: 'Office',
    image: 'https://images.unsplash.com/photo-1781106743595-1a2c6397e812?auto=format&fit=crop&w=720&h=900&q=80',
    alt: 'Modern home office with a wooden desk and stylish chair',
  },
  {
    name: 'Storage',
    image: 'https://images.unsplash.com/photo-1772442364436-6ee6e42302a2?auto=format&fit=crop&w=720&h=900&q=80',
    alt: 'Wooden cabinet and shelving in a sunlit interior',
  },
  {
    name: 'Outdoor',
    image: 'https://images.unsplash.com/photo-1767034243079-6d6c0a80e9d0?auto=format&fit=crop&w=720&h=900&q=80',
    alt: 'Cushioned wooden chair in a sunlit garden',
  },
  {
    name: 'Sofas',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=720&h=900&q=80',
    alt: 'Contemporary sofa in a bright living room',
  },
  {
    name: 'Chairs',
    image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=720&h=900&q=80',
    alt: 'Modern accent chair for a living space',
  },
  {
    name: 'Tables',
    image: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=720&h=900&q=80',
    alt: 'Wooden side table with a simple modern design',
  },
  {
    name: 'Lighting',
    image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=720&h=900&q=80',
    alt: 'Floor lamp bringing warm light to a room',
  },
];

export default function Browse() {
  const carouselRef = useRef(null);
  const [canScroll, setCanScroll] = useState({ previous: false, next: false });
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return undefined;

    const updateScrollControls = () => {
      const maxScroll = carousel.scrollWidth - carousel.clientWidth;
      const previous = carousel.scrollLeft > 2;
      const next = maxScroll - carousel.scrollLeft > 2;

      setCanScroll((current) =>
        current.previous === previous && current.next === next ? current : { previous, next },
      );
    };

    updateScrollControls();
    carousel.addEventListener('scroll', updateScrollControls, { passive: true });
    const resizeObserver = new ResizeObserver(updateScrollControls);
    resizeObserver.observe(carousel);

    return () => {
      carousel.removeEventListener('scroll', updateScrollControls);
      resizeObserver.disconnect();
    };
  }, []);

  const scrollCards = (direction) => {
    const carousel = carouselRef.current;
    const cards = carousel?.querySelectorAll('.browse__card');
    if (!carousel || !cards?.length) return;

    const step = cards[1]?.offsetLeft - cards[0].offsetLeft || cards[0].offsetWidth;
    carousel.scrollBy({ left: direction * step, behavior: reducedMotion ? 'auto' : 'smooth' });
  };

  return (
    <section className="browse" aria-labelledby="browse-title">
      <motion.div
        className="browse__heading"
        initial={reducedMotion ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <h2 id="browse-title">Browse</h2>
        <p>Make sure to browse through our collection and find your perfect piece.</p>
      </motion.div>

      <div className="browse__carousel-wrap">
        {canScroll.previous ? (
          <button
            className="browse__arrow browse__arrow--previous"
            type="button"
            aria-label="Scroll categories left"
            aria-controls="browse-categories"
            onClick={() => scrollCards(-1)}
          >
            <ArrowLeft aria-hidden="true" size={20} />
          </button>
        ) : null}

        <div
          ref={carouselRef}
          id="browse-categories"
          className="browse__carousel"
          role="region"
          aria-roledescription="carousel"
          aria-label="Furniture categories"
          tabIndex={0}
        >
          {categories.map((category) => (
            <Link className="browse__card" to="/shop" key={category.name}>
              <span className="browse__image">
                <img src={category.image} alt={category.alt} loading="lazy" decoding="async" />
              </span>
              <span className="browse__label">{category.name}</span>
            </Link>
          ))}
        </div>

        {canScroll.next ? (
          <button
            className="browse__arrow browse__arrow--next"
            type="button"
            aria-label="Scroll categories right"
            aria-controls="browse-categories"
            onClick={() => scrollCards(1)}
          >
            <ArrowRight aria-hidden="true" size={20} />
          </button>
        ) : null}
      </div>

      <Link className="browse__more" to="/shop">
        See More <ArrowRight aria-hidden="true" size={18} />
      </Link>
    </section>
  );
}
