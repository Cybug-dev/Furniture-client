
import { Swiper, SwiperSlide } from "swiper/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "swiper/css";
import "./HeroBanner.scss";
import { useHeroBanner } from "./useHeroBanner.js";
import HeroSkeleton from "./HeroSkeleton.jsx";
import DefaultBanner from "./slides/DefaultBanner.jsx";
import AdBanner from "./slides/AdBanner.jsx";
import ShowcaseBanner from "./slides/ShowcaseBanner.jsx";
import PromoBanner from "./slides/PromoBanner.jsx";

const SLIDE_COMPONENTS = {
  default: DefaultBanner,
  ad: AdBanner,
  showcase: ShowcaseBanner,
  promo: PromoBanner,
};

export default function HeroBanner() {
  const {
    slides,
    setSectionRef,
    setHovered,
    activeIndex,
    contentReady,
    goPrev,
    goNext,
    goTo,
    swiperProps,
  } = useHeroBanner();

  return (
    <section
      ref={setSectionRef}
      className="hero-banner"
      aria-roledescription="carousel"
      aria-label="Featured furniture"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="hero-banner__frame">
        {!contentReady ? <HeroSkeleton /> : null}
        {contentReady ? (
          <>
            <Swiper className="hero-banner__swiper" {...swiperProps}>
              {slides.map((slide, index) => {
                const Slide = SLIDE_COMPONENTS[slide.type];
                return (
                  <SwiperSlide key={slide.id} className="hero-banner__slide">
                    <img
                      className="hero-banner__bg"
                      src={slide.backgroundUrl}
                      alt=""
                      aria-hidden="true"
                      decoding="async"
                    />
                    <div className="hero-banner__content">
                      <Slide content={slide.content} isActive={activeIndex === index} />
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>

            <button
              type="button"
              className="hero-banner__nav hero-banner__nav--prev"
              aria-label="Previous slide"
              onClick={goPrev}
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              className="hero-banner__nav hero-banner__nav--next"
              aria-label="Next slide"
              onClick={goNext}
            >
              <ChevronRight size={22} />
            </button>

            <div className="hero-banner__dots" role="tablist" aria-label="Slide indicators">
              {slides.map((slide, i) => (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-label={`Go to slide ${i + 1}`}
                  aria-selected={activeIndex === i}
                  className={`hero-banner__dot${activeIndex === i ? " is-active" : ""}`}
                  onClick={() => goTo(i)}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
