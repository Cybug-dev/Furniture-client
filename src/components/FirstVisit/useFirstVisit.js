import { useCallback, useEffect, useRef, useState } from 'react';

// Page-lifetime state only: a refresh intentionally starts this sequence again.
export function useFirstVisit(isHomePage) {
  const [stage, setStage] = useState('waiting');
  const cookieTimer = useRef(null);

  useEffect(() => {
    if (stage !== 'waiting') return undefined;

    const promoTimer = window.setTimeout(
      () => setStage(isHomePage ? 'promo' : 'cookie'),
      isHomePage ? 1800 : 900,
    );

    return () => window.clearTimeout(promoTimer);
  }, [isHomePage, stage]);

  useEffect(() => () => window.clearTimeout(cookieTimer.current), []);

  const dismissPromo = useCallback(() => {
    setStage('between');
    window.clearTimeout(cookieTimer.current);
    cookieTimer.current = window.setTimeout(() => setStage('cookie'), 360);
  }, []);

  const chooseCookies = useCallback(() => {
    setStage('done');
  }, []);

  return {
    isPromoOpen: stage === 'promo',
    isCookieNoticeOpen: stage === 'cookie',
    dismissPromo,
    chooseCookies,
  };
}
