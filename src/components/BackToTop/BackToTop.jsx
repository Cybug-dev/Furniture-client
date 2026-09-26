import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import './BackToTop.scss';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => setVisible(window.scrollY > window.innerHeight);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  const scrollUp = () => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'instant' : 'smooth' });
  };

  return <button className={`back-to-top${visible ? ' is-visible' : ''}`} type="button" onClick={scrollUp} aria-label="Back to top" tabIndex={visible ? 0 : -1}><ArrowUp size={20} aria-hidden="true" /></button>;
}
