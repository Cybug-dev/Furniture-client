// @ts-nocheck
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { Autoplay, A11y, Keyboard, Mousewheel } from "swiper/modules";
import { slides as slideData } from "./slides/slides.data.js";

const AUTOPLAY_MS = 5000;
const SLIDE_SPEED = 650;

function isTypingTarget(el) {
  if (!el || !(el instanceof Element)) return false;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return Boolean(el.closest("[contenteditable='true']"));
}

/**
 * All carousel logic lives here. Components stay presentational.
 */
export function useHeroBanner() {
  const swiperRef = useRef(null);
  const sectionNodeRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [typing, setTyping] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [contentReady, setContentReady] = useState(false);

  const { ref: inViewRef, inView } = useInView({
    threshold: 0.05,
    triggerOnce: true,
    rootMargin: "80px",
    fallbackInView: true,
  });

  const setSectionRef = useCallback(
    (node) => {
      sectionNodeRef.current = node;
      inViewRef(node);
    },
    [inViewRef],
  );

  useEffect(() => {
    if (!inView) return undefined;
    const id = window.setTimeout(() => setContentReady(true), 120);
    return () => window.clearTimeout(id);
  }, [inView]);

  useEffect(() => {
    const onFocusIn = (e) => {
      if (isTypingTarget(e.target)) setTyping(true);
    };
    const onFocusOut = (e) => {
      if (isTypingTarget(e.target)) setTyping(false);
    };
    const onInput = (e) => {
      if (isTypingTarget(e.target)) setTyping(true);
    };
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    document.addEventListener("input", onInput);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
      document.removeEventListener("input", onInput);
    };
  }, []);

  useEffect(() => {
    const onVis = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const paused = typing || hidden;

  useEffect(() => {
    const swiper = swiperRef.current;
    if (!swiper?.autoplay) return;
    if (paused) swiper.autoplay.stop();
    else swiper.autoplay.start();
  }, [paused]);

  useEffect(() => {
    if (!hovered) return undefined;
    const onKey = (e) => {
      if (isTypingTarget(document.activeElement)) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        swiperRef.current?.slidePrev();
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        swiperRef.current?.slideNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hovered]);

  useEffect(() => {
    const swiper = swiperRef.current;
    if (!swiper?.mousewheel) return;
    if (hovered) swiper.mousewheel.enable();
    else swiper.mousewheel.disable();
  }, [hovered]);

  const onSwiper = useCallback((swiper) => {
    swiperRef.current = swiper;
    if (hovered) swiper.mousewheel?.enable();
  }, [hovered]);

  const onSlideChange = useCallback((swiper) => {
    setActiveIndex(swiper.realIndex ?? swiper.activeIndex ?? 0);
  }, []);

  const goPrev = useCallback(() => swiperRef.current?.slidePrev(), []);
  const goNext = useCallback(() => swiperRef.current?.slideNext(), []);
  const goTo = useCallback((i) => swiperRef.current?.slideToLoop(i), []);

  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const swiperProps = useMemo(
    () => ({
      modules: [Autoplay, A11y, Keyboard, Mousewheel],
      speed: prefersReduced ? 0 : SLIDE_SPEED,
      loop: true,
      grabCursor: false,
      simulateTouch: false,
      allowTouchMove: true,
      touchStartPreventDefault: false,
      preventClicks: false,
      preventClicksPropagation: false,
      noSwiping: true,
      noSwipingSelector: "a, button, input, textarea, select, label, form, .is-clickable",
      slidesPerView: 1,
      spaceBetween: 0,
      autoplay: prefersReduced
        ? false
        : {
            delay: AUTOPLAY_MS,
            disableOnInteraction: false,
            pauseOnMouseEnter: false,
          },
      mousewheel: {
        enabled: false,
        forceToAxis: true,
        thresholdDelta: 18,
        thresholdTime: 350,
        releaseOnEdges: true,
      },
      keyboard: { enabled: false },
      a11y: { enabled: true },
      onSwiper,
      onSlideChange,
    }),
    [onSwiper, onSlideChange, prefersReduced],
  );

  return {
    slides: slideData,
    setSectionRef,
    hovered,
    setHovered,
    activeIndex,
    contentReady,
    inView,
    goPrev,
    goNext,
    goTo,
    swiperProps,
    paused,
  };
}

export default useHeroBanner;
