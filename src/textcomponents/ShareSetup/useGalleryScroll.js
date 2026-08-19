import { useEffect, useRef, useState } from 'react';

const DESKTOP_QUERY = '(min-width: 768px)';

/** Observes a single card once it enters the page or horizontal gallery view. */
export function useGalleryImageInView(rootRef) {
  const imageRef = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const image = imageRef.current;
    if (!image || isInView) return undefined;

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
  }, [isInView, rootRef]);

  return { imageRef, isInView };
}

/**
 * Provides a user-driven, native horizontal gallery. Three identical cycles
 * allow scrollLeft to be reset invisibly at either end, creating an endless
 * loop without a carousel library or scripted auto-scroll.
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

    const getCycleWidth = () => {
      const firstColumn = gallery.querySelector('.share-setup__desktop-column');
      const firstRepeatedColumn = gallery.querySelectorAll('.share-setup__desktop-column')[4];
      return firstColumn && firstRepeatedColumn
        ? firstRepeatedColumn.offsetLeft - firstColumn.offsetLeft
        : 0;
    };

    const keepLooping = () => {
      const cycleWidth = getCycleWidth();
      if (!cycleWidth) return;

      if (gallery.scrollLeft >= cycleWidth * 2) gallery.scrollLeft -= cycleWidth;
      if (gallery.scrollLeft <= 0) gallery.scrollLeft += cycleWidth;
    };

    const positionInitialCycle = () => {
      const cycleWidth = getCycleWidth();
      if (cycleWidth) gallery.scrollLeft = cycleWidth;
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
      gallery.scrollLeft += horizontalDelta;
      keepLooping();
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
      gallery.scrollLeft = drag.startScrollLeft + distanceX;
      keepLooping();
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

    const initialPositionFrame = window.requestAnimationFrame(positionInitialCycle);

    return () => {
      window.cancelAnimationFrame(initialPositionFrame);
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
