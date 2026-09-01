// @ts-nocheck
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

const fade = {
  hidden: { opacity: 0, y: 18 },
  show: (index = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 + index * 0.09, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

const timerUnits = [
  { key: 'days', label: 'Days' },
  { key: 'hours', label: 'Hours' },
  { key: 'minutes', label: 'Min' },
  { key: 'seconds', label: 'Sec' },
];

function monthEndMs() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime();
}

function pad(value) {
  return String(value).padStart(2, '0');
}

function useCountdown(endsAt) {
  const target = useMemo(() => endsAt || monthEndMs(), [endsAt]);
  const [left, setLeft] = useState(() => Math.max(0, target - Date.now()));

  useEffect(() => {
    const updateCountdown = () => {
      const remaining = Math.max(0, target - Date.now());
      setLeft(remaining);
      return remaining;
    };

    if (updateCountdown() === 0) return undefined;

    const intervalId = window.setInterval(() => {
      if (updateCountdown() === 0) window.clearInterval(intervalId);
    }, 1_000);

    return () => window.clearInterval(intervalId);
  }, [target]);

  const total = Math.floor(left / 1_000);
  return {
    days: Math.floor(total / 86_400),
    hours: Math.floor((total % 86_400) / 3_600),
    minutes: Math.floor((total % 3_600) / 60),
    seconds: total % 60,
  };
}

export default function PromoBanner({ content, isActive }) {
  const time = useCountdown(content.endsAt);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [done, setDone] = useState(false);

  const onSubmit = (event) => {
    event.preventDefault();
    if (!email.trim() || !name.trim()) return;
    setDone(true);
  };

  return (
    <section className="promo-banner" aria-labelledby="promo-banner-heading">
      <div className="promo-banner__veil" />
      <div className="promo-banner__texture" aria-hidden="true" />

      <motion.div
        className="promo-banner__layout"
        initial="hidden"
        animate={isActive ? 'show' : 'hidden'}
      >
        <motion.header className="promo-banner__masthead" variants={fade} custom={0}>
          <span>Members&apos; private sale</span>
          <span>Edition 01</span>
        </motion.header>

        <div className="promo-banner__main">
          <motion.p className="promo-banner__offer" variants={fade} custom={1}>
            {content.offer}
          </motion.p>
          <motion.h2 id="promo-banner-heading" className="promo-banner__heading" variants={fade} custom={2}>
            {content.heading}
          </motion.h2>
          <motion.p className="promo-banner__sub" variants={fade} custom={3}>
            {content.subtext}
          </motion.p>
          <motion.p className="promo-banner__note" variants={fade} custom={4}>
            <span aria-hidden="true" /> Reserved for your next room refresh
          </motion.p>
          <motion.div className="promo-banner__countdown" variants={fade} custom={5} aria-live="polite" aria-label="Time remaining in this private sale">
            {timerUnits.map((unit) => (
              <div className="promo-banner__time-unit" key={unit.key}>
                <strong>{pad(time[unit.key])}</strong>
                <span>{unit.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.form className="promo-banner__form" onSubmit={onSubmit} variants={fade} custom={6}>
          {done ? (
            <p className="promo-banner__thanks">You&apos;re on the list. Welcome in.</p>
          ) : (
            <>
              <div className="promo-banner__fields">
                <label>
                  <span>Email</span>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder={content.placeholder}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                  />
                </label>
                <label>
                  <span>Name</span>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    autoComplete="name"
                  />
                </label>
              </div>
              <button type="submit">{content.ctaLabel}</button>
            </>
          )}
        </motion.form>

      </motion.div>
    </section>
  );
}
