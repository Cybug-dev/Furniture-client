
import { Swiper, SwiperSlide } from "swiper/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "swiper/css";
import "./FeatureBanner.scss";
import { useFeatureBanner } from "./useFeatureBanner.js";
import FeatureSkeleton from "./FeatureSkeleton.jsx";
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

export default function FeatureBanner() {
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
  } = useFeatureBanner();

  return (
    <section
      ref={setSectionRef}
      className="feature-banner"
      aria-roledescription="carousel"
      aria-label="Featured furniture"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="feature-banner__frame">
        {!contentReady ? <FeatureSkeleton /> : null}
        {contentReady ? (
          <>
            <Swiper className="feature-banner__swiper" {...swiperProps}>
              {slides.map((slide, index) => {
                const Slide = SLIDE_COMPONENTS[slide.type];
                return (
                  <SwiperSlide key={slide.id} className="feature-banner__slide">
                    <img
                      className="feature-banner__bg"
                      src={slide.backgroundUrl}
                      alt=""
                      aria-hidden="true"
                      decoding="async"
                    />
                    <div className="feature-banner__content">
                      <Slide content={slide.content} isActive={activeIndex === index} />
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>

            <button
              type="button"
              className="feature-banner__nav feature-banner__nav--prev"
              aria-label="Previous slide"
              onClick={goPrev}
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              className="feature-banner__nav feature-banner__nav--next"
              aria-label="Next slide"
              onClick={goNext}
            >
              <ChevronRight size={22} />
            </button>

            <div className="feature-banner__dots" role="tablist" aria-label="Slide indicators">
              {slides.map((slide, i) => (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-label={`Go to slide ${i + 1}`}
                  aria-selected={activeIndex === i}
                  className={`feature-banner__dot${activeIndex === i ? " is-active" : ""}`}
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
