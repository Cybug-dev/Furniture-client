import { useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Headset, ShieldCheck, Truck } from 'lucide-react';
import { Link } from 'react-router';
import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y, Autoplay, Keyboard } from 'swiper/modules';
import 'swiper/css';
import { heroSlides } from './hero.data.js';
import './Hero.scss';

const contentVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
  },
};

const heroServices = [
  { id: 'shipping', title: 'Free Shipping', description: 'Over ₦100,000', icon: Truck },
  { id: 'payments', title: 'Secure Payments', description: '100% Safe', icon: ShieldCheck },
  { id: 'support', title: 'Dedicated Support', description: "We're here to help", icon: Headset },
];

function HeroServices({ className = '' }) {
  return (
    <div className={`hero__services ${className}`} aria-label="Store services">
      {heroServices.map(({ id, title, description, icon: Icon }) => (
        <div className="hero__service" key={id}>
          <span className="hero__service-icon"><Icon size={20} aria-hidden="true" /></span>
          <span><strong>{title}</strong><small>{description}</small></span>
        </div>
      ))}
    </div>
  );
}

function HeroSlide({ slide, index, isActive, reducedMotion }) {
  const Heading = index === 0 ? 'h1' : 'h2';

  return (
    <article className="hero__slide">
      <div className="hero__media">
        <img
          className="hero__image"
          src={slide.image}
          width={2048}
          height={1152}
          alt={slide.alt}
          loading={index === 0 ? 'eager' : 'lazy'}
          fetchPriority={index === 0 ? 'high' : 'auto'}
          decoding="async"
          style={{ objectPosition: slide.position }}
        />
      </div>

      <motion.div
        className="hero__content"
        variants={contentVariants}
        initial={false}
        animate={isActive || reducedMotion ? 'visible' : 'hidden'}
      >
        <p className="hero__eyebrow">
          <ShieldCheck size={15} aria-hidden="true" />
          <span>{slide.eyebrow}</span>
        </p>

        <Heading id={`hero-heading-${slide.id}`} className="hero__heading">
          {slide.heading}
        </Heading>

        <p className="hero__description">{slide.description}</p>

        <div className="hero__actions">
          <Link to={slide.ctaHref} className="hero__cta hero__cta--primary" tabIndex={isActive ? 0 : -1}>
            {slide.ctaLabel}<ArrowRight size={19} aria-hidden="true" />
          </Link>
          <Link to="/shop" className="hero__cta hero__cta--secondary" tabIndex={isActive ? 0 : -1}>
            Explore Collections
          </Link>
        </div>

        <HeroServices className="hero__services--desktop" />
      </motion.div>
    </article>
  );
}

export default function Hero() {
  const swiperRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const reducedMotion = useReducedMotion();

  const goToSlide = (index) => {
    swiperRef.current?.slideToLoop(index);
  };

  const keepAutoplayRunning = () => {
    const autoplay = swiperRef.current?.autoplay;
    if (!autoplay || reducedMotion) return;

    if (!autoplay.running) {
      autoplay.start();
    } else if (autoplay.paused) {
      autoplay.resume();
    }
  };

  return (
      <section
        className="hero"
        aria-label="Featured furniture collections"
        onMouseEnter={keepAutoplayRunning}
      >
        <Swiper
          className="hero__swiper"
          modules={[A11y, Autoplay, Keyboard]}
          slidesPerView={1}
          loop
          speed={reducedMotion ? 0 : 480}
          threshold={8}
          allowTouchMove
          preventClicks
          preventClicksPropagation
          autoplay={reducedMotion ? false : {
            delay: 3000,
            disableOnInteraction: false,
            pauseOnMouseEnter: false,
          }}
          keyboard={{ enabled: true, onlyInViewport: true }}
          a11y={{ enabled: true }}
          onSwiper={(swiper) => { swiperRef.current = swiper; }}
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        >
          {heroSlides.map((slide, index) => (
            <SwiperSlide key={slide.id} className="hero__swiper-slide">
              {({ isActive }) => (
                <HeroSlide
                  slide={slide}
                  index={index}
                  isActive={isActive}
                  reducedMotion={reducedMotion}
                />
              )}
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="hero__controls">
          <button className="hero__nav" type="button" aria-label="Show previous collection" onClick={() => swiperRef.current?.slidePrev()}>
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <div className="hero__dots" role="group" aria-label="Choose a featured collection">
            {heroSlides.map((slide, index) => (
              <button
                key={slide.id}
                className={`hero__dot${activeIndex === index ? ' is-active' : ''}`}
                type="button"
                aria-label={`Show slide ${index + 1} of ${heroSlides.length}`}
                aria-current={activeIndex === index ? 'true' : undefined}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
          <button className="hero__nav" type="button" aria-label="Show next collection" onClick={() => swiperRef.current?.slideNext()}>
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        </div>

        <HeroServices className="hero__services--mobile" />

        <span className="hero__status" aria-live="polite">
          Slide {activeIndex + 1} of {heroSlides.length}
        </span>
      </section>
  );
}
