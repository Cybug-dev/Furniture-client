import { useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router';

export default function ScrollManager() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const positions = useRef(new Map());
  const previous = useRef(null);

  useLayoutEffect(() => {
    const original = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    return () => { window.history.scrollRestoration = original; };
  }, []);

  useLayoutEffect(() => {
    const last = previous.current;
    previous.current = { key: location.key, pathname: location.pathname, search: location.search };
    let frame;
    let observer;
    let timeout;
    let restoring = false;
    const stopRestore = () => {
      restoring = false;
      observer?.disconnect();
      window.removeEventListener('wheel', stopRestore);
      window.removeEventListener('touchstart', stopRestore);
      window.removeEventListener('pointerdown', stopRestore);
    };

    if (last?.key !== location.key && last) {
      const saved = positions.current.get(location.key);
      if (navigationType === 'POP' && saved !== undefined) {
        restoring = true;
        const restore = () => {
          const available = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
          window.scrollTo({ top: Math.min(saved, available), behavior: 'instant' });
          if (available >= saved) {
            positions.current.set(location.key, window.scrollY);
            stopRestore();
          }
        };
        frame = window.requestAnimationFrame(restore);
        observer = new ResizeObserver(restore);
        observer.observe(document.documentElement);
        timeout = window.setTimeout(stopRestore, 3000);
        window.addEventListener('wheel', stopRestore, { passive: true });
        window.addEventListener('touchstart', stopRestore, { passive: true });
        window.addEventListener('pointerdown', stopRestore);
      } else if (location.hash) {
        frame = window.requestAnimationFrame(() => {
          document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView({ behavior: 'instant' });
        });
      } else if (location.pathname !== last.pathname || (navigationType === 'PUSH' && location.search === last.search)) {
        window.scrollTo({ top: 0, behavior: 'instant' });
      } else if (location.pathname === '/shop' && location.search !== last.search && navigationType === 'PUSH') {
        document.getElementById('products')?.scrollIntoView({ behavior: 'instant' });
      }
    }

    const save = () => { if (!restoring) positions.current.set(location.key, window.scrollY); };
    save();
    window.addEventListener('scroll', save, { passive: true });
    return () => {
      window.removeEventListener('scroll', save);
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
      stopRestore();
    };
  }, [location.key, location.pathname, location.search, location.hash, navigationType]);

  return null;
}
