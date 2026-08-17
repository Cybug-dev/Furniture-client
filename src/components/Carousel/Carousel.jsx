import { motion, useReducedMotion } from 'framer-motion';

import inspirationOne from '../../assets/images/Inspiration1.png';
import inspirationTwo from '../../assets/images/Inspiration2.png';
import inspirationThree from '../../assets/images/Inspiration3.png';
import inspirationFour from '../../assets/images/Inspiration4.png';
import useCarousel from './Usecarousel';
import './Carousel.scss';

// Placeholder data shape: this local array will later be swapped for real API/category data.
const inspirationSlides = [
  {
    image: inspirationOne,
    number: '01',
    category: 'Bed Room',
    name: 'Inner Peace',
  },
  {
    image: inspirationTwo,
    number: '02',
    category: 'Living Room',
    name: 'Urban Comfort',
  },
  {
    image: inspirationThree,
    number: '03',
    category: 'Dining Room',
    name: 'Gathered Warmth',
  },
  {
    image: inspirationFour,
    number: '04',
    category: 'Lounge',
    name: 'Quiet Luxury',
  },
];

const entranceEase = [0.22, 1, 0.36, 1];

function Carousel() {
  const prefersReducedMotion = useReducedMotion();
  const {
    activeIndex,
    captionVisible,
    getSlideOffset,
    getSlideState,
    goToNext,
    goToPrev,
    goToSlide,
    hasNavigatedForward,
    isTransitioning,
    onKeyDown,
    onMainTransitionEnd,
    onTouchEnd,
    onTouchStart,
  } = useCarousel(inspirationSlides.length);

  const activeSlide = inspirationSlides[activeIndex];
  const sectionInitial = prefersReducedMotion ? { opacity: 0 } : { opacity: 0 };
  const sectionInView = { opacity: 1 };
  const textItemInitial = prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -32 };
  const textItemInView = { opacity: 1, x: 0 };
  const carouselInitial = prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 32 };
  const carouselInView = { opacity: 1, x: 0 };

  return (
    <motion.section
      className="inspiration"
      initial={sectionInitial}
      whileInView={sectionInView}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.01 }}
      aria-labelledby="inspiration-title"
    >
      <div className="inspiration__inner">
        {/* ---- Section: text column ---- */}
        <motion.div
          className="inspiration__content"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: prefersReducedMotion ? 0 : 0.1,
              },
            },
          }}
        >
          <motion.h2
            id="inspiration-title"
            className="inspiration__title"
            variants={{ hidden: textItemInitial, show: textItemInView }}
            transition={{ duration: 0.62, ease: entranceEase }}
          >
            50+ Beautiful rooms inspiration
          </motion.h2>
          <motion.p
            className="inspiration__copy"
            variants={{ hidden: textItemInitial, show: textItemInView }}
            transition={{ duration: 0.62, ease: entranceEase }}
          >
            Our designer already made a lot of beautiful prototypes of rooms that inspire you.
          </motion.p>
          <motion.a
            className="inspiration__button"
            href="#inspiration-carousel"
            variants={{ hidden: textItemInitial, show: textItemInView }}
            transition={{ duration: 0.62, ease: entranceEase }}
          >
            Explore More
          </motion.a>
        </motion.div>

        {/* ---- Section: carousel ---- */}
        <motion.div
          id="inspiration-carousel"
          className="inspiration-carousel"
          role="region"
          aria-roledescription="carousel"
          aria-label="Room inspiration carousel"
          tabIndex="0"
          onKeyDown={onKeyDown}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          initial={carouselInitial}
          whileInView={carouselInView}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.68, ease: entranceEase }}
        >
          <p className="inspiration-carousel__announcement" aria-live="polite">
            {`${activeSlide.number} ${activeSlide.category}: ${activeSlide.name}`}
          </p>

          <div className="inspiration-carousel__stage" aria-busy={isTransitioning}>
            {inspirationSlides.map((slide, index) => {
              const state = getSlideState(index);
              const isActive = index === activeIndex;
              const offset = getSlideOffset(index);

              return (
                <article
                  className={`inspiration-carousel__slide inspiration-carousel__slide--${state}`}
                  data-offset={offset}
                  key={slide.number}
                  aria-hidden={!isActive}
                  onTransitionEnd={isActive ? onMainTransitionEnd : undefined}
                >
                  {isActive ? (
                    <a
                      className="inspiration-carousel__link"
                      href="#"
                      aria-label={`Open ${slide.category} inspiration: ${slide.name}`}
                      onClick={(event) => event.preventDefault()}
                    >
                      <img
                        src={slide.image}
                        alt={`${slide.name} ${slide.category} inspiration`}
                        width="404"
                        height="582"
                        loading={index === 0 ? 'eager' : 'lazy'}
                        onError={(event) => {
                          event.currentTarget.classList.add('inspiration-carousel__image--missing');
                        }}
                      />
                      <span
                        className={`inspiration-carousel__caption${
                          captionVisible ? ' inspiration-carousel__caption--visible' : ''
                        }`}
                      >
                        <span className="inspiration-carousel__meta">
                          {slide.number}
                          <span aria-hidden="true" />
                          {slide.category}
                        </span>
                        <strong>{slide.name}</strong>
                      </span>
                    </a>
                  ) : (
                    <button
                      className="inspiration-carousel__link inspiration-carousel__link--side"
                      type="button"
                      aria-label={`Show ${slide.category} inspiration: ${slide.name}`}
                      disabled={isTransitioning}
                      onClick={() => goToSlide(index)}
                    >
                      <img
                        src={slide.image}
                        alt=""
                        width="404"
                        height="582"
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.classList.add('inspiration-carousel__image--missing');
                        }}
                      />
                    </button>
                  )}
                </article>
              );
            })}
          </div>

          <div className="inspiration-carousel__controls" aria-label="Carousel controls">
            {hasNavigatedForward && (
              <button
                className="inspiration-carousel__nav inspiration-carousel__nav--prev"
                type="button"
                aria-label="Show previous room inspiration"
                disabled={isTransitioning}
                onClick={goToPrev}
              >
                <span aria-hidden="true">‹</span>
              </button>
            )}
            <button
              className="inspiration-carousel__nav inspiration-carousel__nav--next"
              type="button"
              aria-label="Show next room inspiration"
              disabled={isTransitioning}
              onClick={goToNext}
            >
              <span aria-hidden="true">›</span>
            </button>
          </div>

          <div className="inspiration-carousel__dots" aria-label="Choose room inspiration">
            {inspirationSlides.map((slide, index) => (
              <button
                className={`inspiration-carousel__dot${
                  index === activeIndex ? ' inspiration-carousel__dot--active' : ''
                }`}
                type="button"
                key={slide.number}
                aria-label={`Show slide ${index + 1}: ${slide.name}`}
                aria-current={index === activeIndex}
                disabled={isTransitioning}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}

export default Carousel;
