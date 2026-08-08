import styles from './Hero.module.scss';

const HERO_IMAGE = '/hero-room.jpg';

export default function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-heading">
      <div className={styles.media}>
        <img
          className={styles.image}
          src={HERO_IMAGE}
          width={2048}
          height={1152}
          alt="Minimalist living room with a rattan lounge chair, a potted palm, and a white storage cabinet"
          loading="eager"
          fetchpriority="high"
        />
      </div>

      <div className={styles.content}>
        <p className={styles.eyebrow}>New Arrival</p>
        <h1 id="hero-heading" className={styles.heading}>
          Discover Our New Collection
        </h1>
        <p className={styles.description}>
          Elevate your living space with pieces made to last — comfort and
          design, in equal measure.
        </p>
        <a href="/shop" className={styles.cta}>
          Buy Now
        </a>
      </div>
    </section>
  );
}
