// @ts-nocheck
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

const fade = {
  hidden: { opacity: 0, y: 14 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 + i * 0.08, duration: 0.42, ease: [0.22, 1, 0.36, 1] },
  }),
};

function monthEndMs() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime();
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function useCountdown(endsAt) {
  const target = useMemo(() => endsAt || monthEndMs(), [endsAt]);
  const [left, setLeft] = useState(() => Math.max(0, target - Date.now()));

  useEffect(() => {
    const id = window.setInterval(() => {
      setLeft(Math.max(0, target - Date.now()));
    }, 1000);
    return () => window.clearInterval(id);
  }, [target]);

  const total = Math.floor(left / 1000);
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return { days, hours, minutes, seconds };
}

export default function PromoBanner({ content, isActive }) {
  const { days, hours, minutes, seconds } = useCountdown(content.endsAt);
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setDone(true);
  };

  return (
    <div className="promo-banner">
      <div className="promo-banner__veil" />
      <div className="promo-banner__sparkles" aria-hidden="true" />
      <motion.div
        className="promo-banner__copy"
        initial="hidden"
        animate={isActive ? "show" : "hidden"}
      >
        <motion.span className="promo-banner__offer" variants={fade} custom={0}>
          {content.offer}
        </motion.span>
        <motion.h2 className="promo-banner__heading" variants={fade} custom={1}>
          {content.heading}
        </motion.h2>
        <motion.p className="promo-banner__sub" variants={fade} custom={2}>
          {content.subtext}
        </motion.p>
        <motion.p className="promo-banner__count" variants={fade} custom={3}>
          <span>
            {pad(days)}d {pad(hours)}h {pad(minutes)}m {pad(seconds)}s
          </span>
        </motion.p>
        <motion.form className="promo-banner__form is-clickable" onSubmit={onSubmit} variants={fade} custom={4}>
          {done ? (
            <p className="promo-banner__thanks">You’re on the list. Welcome in.</p>
          ) : (
            <>
              <label className="sr-only" htmlFor="promo-email">
                Email
              </label>
              <input
                id="promo-email"
                type="email"
                name="email"
                required
                placeholder={content.placeholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              <button type="submit">{content.ctaLabel}</button>
            </>
          )}
        </motion.form>
      </motion.div>
      <svg className="promo-banner__arrow" viewBox="0 0 160 90" aria-hidden="true">
        <path
          d="M8 12 C 70 8, 130 28, 148 78"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="5 7"
          strokeLinecap="round"
        />
        <path d="M138 68 L148 78 L132 76" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    </div>
  );
}
