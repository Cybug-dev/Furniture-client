import { useEffect, useMemo, useState } from 'react';
import { Heart, Repeat2, Share2 } from 'lucide-react';
import { getProducts } from '../../api/api.js';
import './Products.scss';

const PAGE_SIZE = 8;

// Accept both the originally documented shape and the live API shape from
// Swagger. The live endpoint returns { data: [...], pagination: {...} }.
function normalizeProductsResponse(response, requestedPage) {
  const documentedPayload = response?.data && !Array.isArray(response.data) ? response.data : null;
  const livePagination = response?.pagination || {};

  if (Array.isArray(response?.data)) {
    return {
      items: response.data,
      page: livePagination.page ?? requestedPage,
      total: livePagination.totalProducts ?? response.data.length,
      pages: livePagination.totalPages ?? 1,
    };
  }

  return {
    items: Array.isArray(documentedPayload?.items) ? documentedPayload.items : [],
    page: documentedPayload?.page ?? requestedPage,
    total: documentedPayload?.total ?? 0,
    pages: documentedPayload?.pages ?? 1,
  };
}

// Format Decimal-as-string prices for display only. Pricing math should remain
// on the backend so the UI never becomes the source of truth for money values.
function formatPrice(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return '$0';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

// Pick the most intentional image first, then fall back through the API's
// ordering hints before giving the card a CSS-only placeholder.
function getPrimaryImage(images = []) {
  if (!Array.isArray(images) || images.length === 0) {
    return null;
  }

  return images.find((image) => image.isPrimary) || images.find((image) => image.position === 0) || images[0];
}

function ProductCard({ product }) {
  const [imageFailed, setImageFailed] = useState(false);
  const primaryImage = useMemo(() => getPrimaryImage(product.images), [product.images]);
  const hasImage = primaryImage?.url && !imageFailed;
  const currentPrice = Number(product.price);
  const originalPrice = Number(product.compareAtPrice);
  const hasDiscount =
    product.compareAtPrice &&
    Number.isFinite(currentPrice) &&
    Number.isFinite(originalPrice) &&
    originalPrice > currentPrice;
  const discountPercent = hasDiscount ? Math.round((1 - currentPrice / originalPrice) * 100) : 0;

  const handleAddToCart = () => {
    // TODO: wire to cart endpoint once available.
  };

  const handleShare = () => {
    // TODO: wire to share/deep-link behavior once product routes are finalized.
  };

  const handleCompare = () => {
    // TODO: wire to compare endpoint once available.
  };

  const handleLike = () => {
    // TODO: wire to wishlist endpoint once available.
  };

  return (
    <article className="products-card">
      <div className="products-card__media">
        {hasDiscount ? <span className="products-card__badge">-{discountPercent}%</span> : null}

        {hasImage ? (
          <img
            src={primaryImage.url}
            alt={primaryImage.altText || product.name}
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="products-card__placeholder" aria-label={`${product.name} image unavailable`} role="img" />
        )}

        <div className="products-card__overlay">
          <button className="products-card__cart" type="button" onClick={handleAddToCart}>
            Add to cart
          </button>
          <div className="products-card__actions" aria-label={`${product.name} quick actions`}>
            <button type="button" onClick={handleShare} aria-label={`Share ${product.name}`}>
              <Share2 size={18} aria-hidden="true" />
            </button>
            <button type="button" onClick={handleCompare} aria-label={`Compare ${product.name}`}>
              <Repeat2 size={18} aria-hidden="true" />
            </button>
            <button type="button" onClick={handleLike} aria-label={`Like ${product.name}`}>
              <Heart size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <div className="products-card__body">
        {/* New badge intentionally omitted pending a backend field. */}
        <h3>{product.name}</h3>
        <p>{product.shortDescription}</p>
        <div className="products-card__prices">
          <span className="products-card__price">{formatPrice(product.price)}</span>
          {hasDiscount ? <span className="products-card__compare">{formatPrice(product.compareAtPrice)}</span> : null}
        </div>
      </div>
    </article>
  );
}

export default function Products() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [hasLoaded, setHasLoaded] = useState(false);

  // One loader handles both the initial page and later pagination so the API
  // response remains the only source for page, total, and pages metadata.
  const loadProducts = async ({ nextPage = 1, append = false } = {}) => {
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsInitialLoading(true);
    }

    setError('');

    try {
      const response = await getProducts({ page: nextPage, limit: PAGE_SIZE });
      const payload = normalizeProductsResponse(response, nextPage);

      setItems((currentItems) => (append ? [...currentItems, ...payload.items] : payload.items));
      setPage(payload.page);
      setTotal(payload.total);
      setPages(payload.pages);
      setHasLoaded(true);
    } catch (fetchError) {
      setError(fetchError?.message || 'Unable to load products. Please try again.');
    } finally {
      setIsInitialLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    loadProducts({ nextPage: 1, append: false });
  }, []);

  const handleRetry = () => {
    const hasExistingProducts = items.length > 0;

    loadProducts({
      nextPage: hasExistingProducts ? page + 1 : 1,
      append: hasExistingProducts,
    });
  };

  const handleShowMore = () => {
    if (!isLoadingMore && page < pages) {
      loadProducts({ nextPage: page + 1, append: true });
    }
  };

  const canShowMore = page < pages;

  return (
    <section id="products" className="products" aria-labelledby="products-title">
      <div className="products__header">
        <h2 id="products-title">Products</h2>
        {total > 0 ? <p>{total} curated pieces available</p> : null}
      </div>

      {isInitialLoading ? (
        <div className="products__grid" aria-label="Loading products">
          {Array.from({ length: PAGE_SIZE }).map((_, index) => (
            <div className="products-card products-card--skeleton" key={index} />
          ))}
        </div>
      ) : null}

      {!isInitialLoading && error ? (
        <div className="products__message products__message--error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={handleRetry}>
            Retry
          </button>
        </div>
      ) : null}

      {!isInitialLoading && !error && hasLoaded && items.length === 0 ? (
        <p className="products__message">No products found</p>
      ) : null}

      {!isInitialLoading && items.length > 0 ? (
        <>
          <div className="products__grid">
            {items.map((product) => (
              <ProductCard key={product.id || product.slug} product={product} />
            ))}
          </div>

          {canShowMore && !error ? (
            <button className="products__show-more" type="button" onClick={handleShowMore} disabled={isLoadingMore}>
              {isLoadingMore ? 'Loading...' : 'Show More'}
            </button>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
