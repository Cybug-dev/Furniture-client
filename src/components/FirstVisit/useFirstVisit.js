import { useCallback, useEffect, useRef, useState } from 'react';

const PROMO_SEEN = 'furniture:promo-seen';
const COOKIE_SEEN = 'furniture:cookie-notice-seen';

function wasSeen(key) {
  try { return localStorage.getItem(key) === 'true'; } catch { return false; }
}

function remember(key) {
  try { localStorage.setItem(key, 'true'); } catch { /* Continue for this visit. */ }
}

export function useFirstVisit(isHomePage) {
  const [stage, setStage] = useState(() =>
    wasSeen(COOKIE_SEEN) && (!isHomePage || wasSeen(PROMO_SEEN)) ? 'done' : 'waiting',
  );
  const cookieTimer = useRef(null);

  useEffect(() => {
    if (stage !== 'waiting') return undefined;

    const promoTimer = window.setTimeout(
      () => {
        if (isHomePage && !wasSeen(PROMO_SEEN)) {
          remember(PROMO_SEEN);
          setStage('promo');
        } else if (!wasSeen(COOKIE_SEEN)) {
          setStage('cookie');
        } else {
          setStage('done');
        }
      },
      isHomePage ? 1800 : 900,
    );

    return () => window.clearTimeout(promoTimer);
  }, [isHomePage, stage]);

  useEffect(() => () => window.clearTimeout(cookieTimer.current), []);

  useEffect(() => {
    if (isHomePage && stage === 'done' && !wasSeen(PROMO_SEEN)) setStage('waiting');
  }, [isHomePage, stage]);

  useEffect(() => {
    if (stage === 'cookie') remember(COOKIE_SEEN);
  }, [stage]);

  const dismissPromo = useCallback(() => {
    remember(PROMO_SEEN);
    if (wasSeen(COOKIE_SEEN)) {
      setStage('done');
      return;
    }
    setStage('between');
    window.clearTimeout(cookieTimer.current);
    cookieTimer.current = window.setTimeout(() => setStage('cookie'), 360);
  }, []);

  const chooseCookies = useCallback(() => {
    remember(COOKIE_SEEN);
    setStage('done');
  }, []);

  return {
    isPromoOpen: stage === 'promo',
    isCookieNoticeOpen: stage === 'cookie',
    dismissPromo,
    chooseCookies,
  };
}
