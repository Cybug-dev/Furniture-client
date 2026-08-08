import styles from './Hero.module.scss';

const HERO_IMAGE_BASE = 'https://picsum.photos/seed/furniture-hero';
const HERO_WIDTHS = [640, 960, 1280, 1600, 1920];

const heroSrcSet = HERO_WIDTHS.map(
  (w) => `${HERO_IMAGE_BASE}/${w}/${Math.round(w * 0.72)} ${w}w`
).join(', ');

export default function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-heading">
      <div className={styles.media}>
        <img
          className={styles.image}
          src={`${HERO_IMAGE_BASE}/1600/1152`}
          srcSet={heroSrcSet}
          sizes="100vw"
          width={1600}
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
