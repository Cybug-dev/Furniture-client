import { useEffect, useRef, useState } from 'react';

const DESKTOP_QUERY = '(min-width: 768px)';

/** Reveals a card once its section and the card itself are both in view. */
export function useGalleryImageInView(rootRef, isSectionVisible) {
  const imageRef = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const image = imageRef.current;
    if (!image || isInView || !isSectionVisible) return undefined;

    if (!('IntersectionObserver' in window)) {
      setIsInView(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { root: rootRef?.current ?? null, threshold: 0.14 },
    );

    observer.observe(image);
    return () => observer.disconnect();
  }, [isInView, isSectionVisible, rootRef]);

  return { imageRef, isInView };
}

/**
 * Provides an endlessly looping horizontal gallery. Repeated identical cycles
 * allow scrollLeft to be reset invisibly at either end. The rail advances
 * continuously from left to right.
 */
export function useGalleryScroll() {
  const sectionRef = useRef(null);
  const galleryRef = useRef(null);
  const dragRef = useRef(null);
  const suppressClickRef = useRef(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const desktopMedia = window.matchMedia(DESKTOP_QUERY);
    const updateMode = () => setIsDesktop(desktopMedia.matches);

    updateMode();
    desktopMedia.addEventListener('change', updateMode);
    return () => desktopMedia.removeEventListener('change', updateMode);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.18 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isDesktop) return undefined;

    const gallery = galleryRef.current;
    if (!gallery) return undefined;

    const reducedMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
    let animationFrame;
    let lastFrameTime;

    const getCycleWidth = () => {
      const firstColumn = gallery.querySelector('.share-setup__desktop-column');
      const firstRepeatedColumn = gallery.querySelectorAll('.share-setup__desktop-column')[4];
      return firstColumn && firstRepeatedColumn
        ? firstRepeatedColumn.offsetLeft - firstColumn.offsetLeft
        : 0;
    };

    const getWrappedScrollLeft = (scrollLeft) => {
      const cycleWidth = getCycleWidth();
      if (!cycleWidth) return scrollLeft;

      const offset = ((scrollLeft - cycleWidth) % cycleWidth + cycleWidth) % cycleWidth;
      return cycleWidth + offset;
    };

    const setLoopingScrollLeft = (scrollLeft) => {
      gallery.scrollLeft = getWrappedScrollLeft(scrollLeft);
    };

    const keepLooping = () => {
      const wrappedScrollLeft = getWrappedScrollLeft(gallery.scrollLeft);
      if (gallery.scrollLeft !== wrappedScrollLeft) gallery.scrollLeft = wrappedScrollLeft;
    };

    const positionInitialCycle = () => {
      const cycleWidth = getCycleWidth();
      if (cycleWidth) gallery.scrollLeft = cycleWidth * 1.5;
    };

    const autoScroll = (frameTime) => {
      if (!reducedMotionMedia.matches && !document.hidden) {
        if (lastFrameTime) {
          // A gentle 32px/second motion keeps the gallery readable while
          // making its endless nature apparent.
          setLoopingScrollLeft(gallery.scrollLeft - (frameTime - lastFrameTime) * 0.032);
        }
        lastFrameTime = frameTime;
      } else {
        lastFrameTime = undefined;
      }

      animationFrame = window.requestAnimationFrame(autoScroll);
    };

    const onWheel = (event) => {
      const horizontalDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY)
        ? event.deltaX
        : event.shiftKey
          ? event.deltaY
          : 0;

      // Vertical wheel input is left entirely to normal page scrolling.
      if (!horizontalDelta) return;

      event.preventDefault();
      setLoopingScrollLeft(gallery.scrollLeft + horizontalDelta);
    };

    const onPointerDown = (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;

      dragRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startScrollLeft: gallery.scrollLeft,
        direction: null,
      };
    };

    const onPointerMove = (event) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;

      const distanceX = drag.startX - event.clientX;
      const distanceY = drag.startY - event.clientY;
      if (!drag.direction && Math.max(Math.abs(distanceX), Math.abs(distanceY)) > 6) {
        drag.direction = Math.abs(distanceX) > Math.abs(distanceY) ? 'horizontal' : 'vertical';
        if (drag.direction === 'horizontal') gallery.setPointerCapture?.(event.pointerId);
      }

      if (drag.direction !== 'horizontal') return;
      setLoopingScrollLeft(drag.startScrollLeft + distanceX);
    };

    const endPointerDrag = (event) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;

      suppressClickRef.current = drag.direction === 'horizontal';
      dragRef.current = null;
      if (suppressClickRef.current) {
        window.setTimeout(() => {
          suppressClickRef.current = false;
        }, 150);
      }
    };

    const onClickCapture = (event) => {
      if (!suppressClickRef.current) return;
      event.preventDefault();
      event.stopPropagation();
    };

    gallery.addEventListener('wheel', onWheel, { passive: false });
    gallery.addEventListener('pointerdown', onPointerDown);
    gallery.addEventListener('pointermove', onPointerMove);
    gallery.addEventListener('pointerup', endPointerDrag);
    gallery.addEventListener('pointercancel', endPointerDrag);
    gallery.addEventListener('click', onClickCapture, true);
    gallery.addEventListener('scroll', keepLooping, { passive: true });

    const initialPositionFrame = window.requestAnimationFrame(() => {
      positionInitialCycle();
      animationFrame = window.requestAnimationFrame(autoScroll);
    });

    return () => {
      window.cancelAnimationFrame(initialPositionFrame);
      window.cancelAnimationFrame(animationFrame);
      gallery.removeEventListener('wheel', onWheel);
      gallery.removeEventListener('pointerdown', onPointerDown);
      gallery.removeEventListener('pointermove', onPointerMove);
      gallery.removeEventListener('pointerup', endPointerDrag);
      gallery.removeEventListener('pointercancel', endPointerDrag);
      gallery.removeEventListener('click', onClickCapture, true);
      gallery.removeEventListener('scroll', keepLooping);
    };
  }, [isDesktop]);

  return { sectionRef, galleryRef, isVisible, isDesktop };
}

export default useGalleryScroll;
