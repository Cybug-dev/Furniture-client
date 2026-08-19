import { motion, useReducedMotion } from 'framer-motion';
import galleryData from './galleryData';
import useGalleryScroll, { useGalleryImageInView } from './useGalleryScroll';
import './ShareSetup.scss';

const desktopColumns = Array.from({ length: 4 }, () => []);
galleryData.forEach((image, index) => desktopColumns[index % desktopColumns.length].push(image));

const entrance = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0 },
};

function GalleryImage({ image, index, observerRootRef }) {
  const shouldReduceMotion = useReducedMotion();
  const { imageRef, isInView } = useGalleryImageInView(observerRootRef);

  return (
    <motion.a
      ref={imageRef}
      className="share-setup__card"
      href={`/category/${image.category}`}
      aria-label={`Explore ${image.category.replace('-', ' ')} inspiration`}
      style={{ '--image-ratio': image.ratio }}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
      animate={isInView || shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.42,
        ease: 'easeOut',
      }}
    >
      <img src={image.src} alt={image.alt} loading={index < 4 ? 'eager' : 'lazy'} />
    </motion.a>
  );
}

function ShareSetup() {
  const shouldReduceMotion = useReducedMotion();
  const {
    sectionRef,
    galleryRef,
    isVisible,
    isDesktop,
  } = useGalleryScroll();
  const transition = { duration: shouldReduceMotion ? 0 : 0.65, ease: 'easeOut' };

  return (
    <section ref={sectionRef} className="share-setup" aria-labelledby="share-setup-title">
      <motion.header
        className="share-setup__heading"
        initial="hidden"
        animate={isVisible ? 'visible' : 'hidden'}
        variants={entrance}
        transition={transition}
      >
        <p>Share your setup with</p>
        <h2 id="share-setup-title">#Furniture</h2>
      </motion.header>

      <div
        ref={galleryRef}
        className="share-setup__desktop-gallery"
        aria-label="Furniture inspiration gallery"
        data-carousel-active={isDesktop}
      >
        <div className="share-setup__desktop-track">
          {[...desktopColumns, ...desktopColumns, ...desktopColumns, ...desktopColumns].map((column, columnIndex) => (
            <div className="share-setup__desktop-column" key={`column-${columnIndex}`}>
              {column.map((image) => (
                <GalleryImage
                  image={image}
                  index={image.id - 1}
                  key={`${columnIndex}-${image.id}`}
                  observerRootRef={galleryRef}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div
        className="share-setup__mobile-gallery"
      >
        {galleryData.map((image, index) => (
          <GalleryImage
            image={image}
            index={index}
            key={image.id}
          />
        ))}
      </div>
    </section>
  );
}

export default ShareSetup;
