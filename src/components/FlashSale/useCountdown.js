import { useCallback, useEffect, useState } from 'react';

const SALE_CYCLE_MS = 86_400_000;

function getTimeRemaining(targetEndDate) {
  const targetTime = new Date(targetEndDate).getTime();
  const now = Date.now();
  const remaining = Number.isFinite(targetTime)
    ? targetTime > now
      ? targetTime - now
      : SALE_CYCLE_MS - ((now - targetTime) % SALE_CYCLE_MS)
    : 0;

  return {
    days: Math.floor(remaining / 86_400_000),
    hours: Math.floor((remaining / 3_600_000) % 24),
    minutes: Math.floor((remaining / 60_000) % 60),
    seconds: Math.floor((remaining / 1_000) % 60),
    isComplete: remaining === 0,
  };
}

export default function useCountdown(targetEndDate) {
  const getCurrentTime = useCallback(
    () => getTimeRemaining(targetEndDate),
    [targetEndDate],
  );
  const [timeRemaining, setTimeRemaining] = useState(getCurrentTime);

  useEffect(() => {
    const initialTime = getCurrentTime();
    setTimeRemaining(initialTime);

    if (initialTime.isComplete) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      const nextTime = getCurrentTime();
      setTimeRemaining(nextTime);

      if (nextTime.isComplete) {
        window.clearInterval(intervalId);
      }
    }, 1_000);

    return () => window.clearInterval(intervalId);
  }, [getCurrentTime]);

  return timeRemaining;
}
