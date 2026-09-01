import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import flashSaleData from './flashSale.data';
import useCountdown from './useCountdown';
import './FlashSale.scss';

const timerUnits = [
  { key: 'days', label: 'Days' },
  { key: 'hours', label: 'Hours' },
  { key: 'minutes', label: 'Minutes' },
  { key: 'seconds', label: 'Seconds' },
];

function TimerDigit({ value, reduceMotion }) {
  const formattedValue = String(value).padStart(2, '0');

  return (
    <span className="flash-sale__digit-wrap">
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={formattedValue}
          className="flash-sale__digit"
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
          transition={{ duration: reduceMotion ? 0 : 0.2, ease: 'easeOut' }}
        >
          {formattedValue}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function PhoneCard({ image, index, reduceMotion }) {
  return (
    <motion.a
      className={`flash-sale__phone flash-sale__phone--${index + 1}`}
      href={image.href}
      aria-label={`Shop ${image.productName} in ${image.category}`}
      style={{ rotate: index === 0 ? -5 : 5, y: index === 0 ? 18 : -20 }}
      whileHover={reduceMotion ? undefined : { y: index === 0 ? 11 : -27 }}
      transition={{ duration: reduceMotion ? 0 : 0.25, ease: 'easeOut' }}
    >
      <span className="flash-sale__phone-speaker" aria-hidden="true" />
      <img src={image.src} alt={image.alt} loading="lazy" decoding="async" />
      <span className="flash-sale__phone-overlay" aria-hidden="true">
        <span>{image.category}</span>
        <strong>{image.productName}</strong>
      </span>
    </motion.a>
  );
}

export default function FlashSale() {
  // TODO: replace with useQuery(...) when flash sale content is served by the API.
  const sale = flashSaleData;
  const { days, hours, minutes, seconds, isComplete } = useCountdown(sale.endDate);
  const shouldReduceMotion = useReducedMotion();
  const timerValues = { days, hours, minutes, seconds };
  const entranceTransition = {
    duration: shouldReduceMotion ? 0 : 0.65,
    ease: 'easeOut',
  };

  return (
    <section className="flash-sale" aria-labelledby="flash-sale-title">
      <div className="flash-sale__ambient" aria-hidden="true">
        <span className="flash-sale__orb flash-sale__orb--one" />
        <span className="flash-sale__orb flash-sale__orb--two" />
        <span className="flash-sale__line-art" />
      </div>
      <div className="flash-sale__container">
        <motion.div
          className="flash-sale__content"
          initial={shouldReduceMotion ? false : { opacity: 0, x: -42 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={entranceTransition}
        >
          <p className="flash-sale__eyebrow">Save {sale.discount}% today</p>
          <h2 id="flash-sale-title">{sale.heading}</h2>
          <p className="flash-sale__subtext">{sale.subtext}</p>

          <div className="flash-sale__countdown" aria-live="polite" aria-label="Time remaining in flash sale">
            {timerUnits.map((unit, index) => (
              <motion.div
                className="flash-sale__time-unit"
                key={unit.key}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.5,
                  delay: shouldReduceMotion ? 0 : 0.18 + index * 0.08,
                  ease: 'easeOut',
                }}
              >
                <TimerDigit value={timerValues[unit.key]} reduceMotion={shouldReduceMotion} />
                <span className="flash-sale__time-label">{unit.label}</span>
              </motion.div>
            ))}
          </div>

          {isComplete ? (
            <button className="flash-sale__cta is-ended" type="button" disabled>
              Sale Ended
            </button>
          ) : (
            <a className="flash-sale__cta" href={sale.ctaHref}>
              {sale.ctaText} <ArrowRight size={18} strokeWidth={2.3} aria-hidden="true" />
            </a>
          )}

          <div className="flash-sale__perks" aria-label="Flash sale benefits">
            {sale.perks.map((perk, index) => (
              <span key={perk} className="flash-sale__perk">
                <i className={`flash-sale__perk-icon flash-sale__perk-icon--${index + 1}`} aria-hidden="true" />
                {perk}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="flash-sale__phones"
          initial={shouldReduceMotion ? false : { opacity: 0, x: 42 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ ...entranceTransition, delay: shouldReduceMotion ? 0 : 0.12 }}
        >
          {sale.images.map((image, index) => (
            <PhoneCard key={image.id} image={image} index={index} reduceMotion={shouldReduceMotion} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
