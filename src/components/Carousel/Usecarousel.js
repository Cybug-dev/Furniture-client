import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Keep these values in sync with the SCSS timing variables in Carousel.scss.
export const carouselTiming = {
  transitionMs: 620,
  captionDelayMs: 90,
  resizeDebounceMs: 180,
  swipeVelocityThreshold: 0.42,
  swipeDistanceThreshold: 48,
};

const getShortestDirection = (currentIndex, targetIndex, totalSlides) => {
  if (targetIndex === currentIndex) {
    return null;
  }

  const forwardDistance = (targetIndex - currentIndex + totalSlides) % totalSlides;
  const backwardDistance = (currentIndex - targetIndex + totalSlides) % totalSlides;

  return forwardDistance <= backwardDistance ? 'next' : 'prev';
};

const getWrappedIndex = (index, totalSlides) => (
  (index + totalSlides) % totalSlides
);

export default function useCarousel(slideCount) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState(null);
  const [direction, setDirection] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hasNavigatedForward, setHasNavigatedForward] = useState(false);
  const [captionVisible, setCaptionVisible] = useState(true);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [viewportTick, setViewportTick] = useState(0);

  const transitionFallbackRef = useRef(null);
  const captionFallbackRef = useRef(null);
  const touchStartRef = useRef(null);
  const resizeTimerRef = useRef(null);

  const clearTimers = useCallback(() => {
    window.clearTimeout(transitionFallbackRef.current);
    window.clearTimeout(captionFallbackRef.current);
  }, []);

  const settleTransition = useCallback(() => {
    clearTimers();
    setIsTransitioning(false);
    setDirection(null);
    setPreviousIndex(null);

    captionFallbackRef.current = window.setTimeout(() => {
      setCaptionVisible(true);
    }, carouselTiming.captionDelayMs);
  }, [clearTimers]);

  const moveToIndex = useCallback((targetIndex, requestedDirection) => {
    if (isTransitioning || slideCount < 2) {
      return;
    }

    const nextIndex = getWrappedIndex(targetIndex, slideCount);
    if (nextIndex === activeIndex) {
      return;
    }

    const resolvedDirection = requestedDirection
      || getShortestDirection(activeIndex, nextIndex, slideCount);

    clearTimers();
    setPreviousIndex(activeIndex);
    setDirection(resolvedDirection);
    setIsTransitioning(true);
    setCaptionVisible(false);
    setActiveIndex(nextIndex);

    if (resolvedDirection === 'next') {
      setHasNavigatedForward(true);
    }

    transitionFallbackRef.current = window.setTimeout(
      settleTransition,
      isReducedMotion ? carouselTiming.captionDelayMs : carouselTiming.transitionMs + carouselTiming.captionDelayMs,
    );
  }, [activeIndex, clearTimers, isReducedMotion, isTransitioning, settleTransition, slideCount]);

  const goToNext = useCallback(() => {
    moveToIndex(activeIndex + 1, 'next');
  }, [activeIndex, moveToIndex]);

  const goToPrev = useCallback(() => {
    moveToIndex(activeIndex - 1, 'prev');
  }, [activeIndex, moveToIndex]);

  const goToSlide = useCallback((index) => {
    moveToIndex(index);
  }, [moveToIndex]);

  const getSlideOffset = useCallback((index) => {
    if (!slideCount) {
      return 0;
    }

    const rawOffset = index - activeIndex;
    const half = slideCount / 2;

    if (rawOffset > half) {
      return rawOffset - slideCount;
    }

    if (rawOffset < -half) {
      return rawOffset + slideCount;
    }

    return rawOffset;
  }, [activeIndex, slideCount]);

  const getSlideState = useCallback((index) => {
    const offset = getSlideOffset(index);
    const absOffset = Math.abs(offset);
    const wasActive = previousIndex === index;

    if (index === activeIndex) {
      return 'active';
    }

    if (wasActive && isTransitioning) {
      return direction === 'next' ? 'exiting-left' : 'exiting-right';
    }

    if (offset === -1) {
      return 'prev';
    }

    if (offset === 1) {
      return 'next';
    }

    if (offset < -1 || (absOffset === 2 && direction === 'prev')) {
      return 'far-prev';
    }

    return 'far-next';
  }, [activeIndex, direction, getSlideOffset, isTransitioning, previousIndex]);

  const onMainTransitionEnd = useCallback((event) => {
    if (event.target !== event.currentTarget || event.propertyName !== 'transform') {
      return;
    }

    if (isTransitioning) {
      settleTransition();
    }
  }, [isTransitioning, settleTransition]);

  const onKeyDown = useCallback((event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      goToNext();
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goToPrev();
    }
  }, [goToNext, goToPrev]);

  const onTouchStart = useCallback((event) => {
    const touch = event.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  }, []);

  const onTouchEnd = useCallback((event) => {
    if (!touchStartRef.current || isTransitioning) {
      return;
    }

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const elapsed = Math.max(Date.now() - touchStartRef.current.time, 1);
    const velocity = Math.abs(deltaX) / elapsed;

    touchStartRef.current = null;

    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      return;
    }

    const passedDistance = Math.abs(deltaX) >= carouselTiming.swipeDistanceThreshold;
    const passedVelocity = velocity >= carouselTiming.swipeVelocityThreshold;

    if (!passedDistance && !passedVelocity) {
      return;
    }

    if (deltaX < 0) {
      goToNext();
    } else {
      goToPrev();
    }
  }, [goToNext, goToPrev, isTransitioning]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncPreference = () => setIsReducedMotion(mediaQuery.matches);

    syncPreference();
    mediaQuery.addEventListener('change', syncPreference);

    return () => {
      mediaQuery.removeEventListener('change', syncPreference);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      window.clearTimeout(resizeTimerRef.current);
      resizeTimerRef.current = window.setTimeout(() => {
        setViewportTick((tick) => tick + 1);
      }, carouselTiming.resizeDebounceMs);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      window.clearTimeout(resizeTimerRef.current);
    };
  }, []);

  useEffect(() => () => {
    clearTimers();
  }, [clearTimers]);

  return useMemo(() => ({
    activeIndex,
    captionVisible,
    direction,
    getSlideOffset,
    getSlideState,
    goToNext,
    goToPrev,
    goToSlide,
    hasNavigatedForward,
    isReducedMotion,
    isTransitioning,
    onKeyDown,
    onMainTransitionEnd,
    onTouchEnd,
    onTouchStart,
    previousIndex,
    viewportTick,
  }), [
    activeIndex,
    captionVisible,
    direction,
    getSlideOffset,
    getSlideState,
    goToNext,
    goToPrev,
    goToSlide,
    hasNavigatedForward,
    isReducedMotion,
    isTransitioning,
    onKeyDown,
    onMainTransitionEnd,
    onTouchEnd,
    onTouchStart,
    previousIndex,
    viewportTick,
  ]);
}
