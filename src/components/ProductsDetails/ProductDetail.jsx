import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import { useProduct, useProducts } from '../../hooks/apiHooks';
import './ProductDetail.scss';
import { useAddToCart } from '../../commerce/commerce.hooks.js';
import { money } from '../../commerce/commerce.utils.js';
import ProductCard from '../Products/ProductCard.jsx';
import ProductNotice from '../Products/ProductNotice.jsx';

function unwrap(payload) {
  if (!payload) return null;
  if (payload.success === true && payload.data) return payload.data;
  if (payload.data && (payload.data.id || payload.data.name)) return payload.data;
  return payload;
}

function asList(payload) {
  const data = unwrap(payload) ?? payload;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

function imageUrl(image) {
  if (!image) return '';
  if (typeof image === 'string') return image;
  return image.url || image.src || image.secureUrl || image.secure_url || '';
}

function formatMoney(value) {
  if (value === null || value === undefined || value === '') return '';
  const amount = Number(value);
  if (Number.isNaN(amount)) return String(value);
  return money(amount, 'NGN');
}

export default function ProductDetail() {
  const { id } = useParams();
  const cart = useAddToCart();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [id]);

  const productQuery = useProduct(id);
  const product = unwrap(productQuery.data);

  const categorySlug = product?.category?.slug || product?.categorySlug;
  const relatedQuery = useProducts({
    category: categorySlug || undefined,
    limit: 4,
    page: 1,
  });
  const related = asList(relatedQuery.data)
    .filter((item) => item.id !== product?.id)
    .slice(0, 4);

  const images = useMemo(() => {
    if (!product) return [];
    const list = (product.images || []).map(imageUrl).filter(Boolean);
    const primary = imageUrl(product.primaryImage || product.image || product.thumbnail);
    return list.length ? list : primary ? [primary] : [];
  }, [product]);

  const sizes = Array.isArray(product?.sizes) ? product.sizes : [];
  const colors = Array.isArray(product?.colors) ? product.colors : [];
  const tags = Array.isArray(product?.tags) ? product.tags : [];
  const specs = Array.isArray(product?.specifications) ? product.specifications : [];
  const reviews = Array.isArray(product?.reviews) ? product.reviews : [];
  const brandName = product?.brand?.name || product?.brandName || product?.manufacturer || '—';
  const categoryName = product?.category?.name || product?.category || '—';
  const rawStock = product?.stockQuantity ?? product?.stock ?? product?.inventory;
  const hasKnownStock = rawStock !== undefined && rawStock !== null && Number.isFinite(Number(rawStock));
  const stockQuantity = hasKnownStock ? Number(rawStock) : null;
  const maximumQuantity = hasKnownStock ? Math.max(1, Math.min(99, stockQuantity)) : 99;

  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [tab, setTab] = useState('description');
  const [productNotice, setProductNotice] = useState(null);
  const showProductNotice = useCallback((notice) => setProductNotice({ ...notice, id: Date.now() }), []);
  const closeProductNotice = useCallback(() => setProductNotice(null), []);

  if (!id) {
    return (
      <div className="product-detail">
        <Header />
        <div className="product-detail__status">Missing product id.</div>
        <Footer />
      </div>
    );
  }

  if (productQuery.isPending) {
    return (
      <div className="product-detail">
        <Header />
        <div className="product-detail__status">Loading product…</div>
        <Footer />
      </div>
    );
  }

  if (productQuery.isError) {
    const missing = productQuery.error?.type === 'not-found';
    return (
      <div className="product-detail">
        <Header />
        <div className="product-detail__status">
          <h1>{missing ? 'Product not found' : 'Could not load product'}</h1>
          {!missing && <p>{productQuery.error?.message}</p>}
          {missing ? (
            <Link to="/shop">Back to shop</Link>
          ) : (
            <button type="button" onClick={() => productQuery.refetch()}>Try again</button>
          )}
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) return null;

  const gallerySrc = images[activeImage] || images[0] || '';
  const rating = Number(product.rating ?? product.averageRating ?? 0);
  const reviewCount = Number(product.reviewCount ?? reviews.length ?? 0);
  const selectedSize = size || sizes[0];
  const selectedColor = color || colors[0];
  const showRating = rating > 0 || reviewCount > 0;

  function handleAddToCart() {
    cart.add(product.id, qty);
  }

  return (
    <div className="product-detail">
      <Header />

      <nav className="product-detail__crumb">
        <div className="product-detail__crumb-inner">
          <Link to="/">Home</Link>
          <span>›</span>
          <Link to="/shop">Shop</Link>
          <span className="product-detail__crumb-rule" />
          <strong>{product.name}</strong>
        </div>
      </nav>

      <section className="product-detail__hero">
        <div className="product-detail__gallery">
          <div className="product-detail__thumbs">
            {images.map((src, index) => (
              <button
                key={src + index}
                type="button"
                className={`product-detail__thumb ${index === activeImage ? 'is-active' : ''}`}
                onClick={() => setActiveImage(index)}
              >
                <img src={src} alt="" />
              </button>
            ))}
          </div>
          <div className="product-detail__stage">
            {gallerySrc ? <img src={gallerySrc} alt={product.name} /> : null}
          </div>
        </div>

        <div className="product-detail__info">
          <h1>{product.name}</h1>
          <p className="product-detail__price">{formatMoney(product.price)}</p>

          {showRating && (
            <div className="product-detail__rating">
              <span className="product-detail__stars">
                {Array.from({ length: 5 }, (_, i) => (
                  <span
                    key={i}
                    className={
                      i < Math.floor(rating)
                        ? 'is-on'
                        : i === Math.floor(rating) && rating % 1 >= 0.5
                          ? 'is-half'
                          : ''
                    }
                  >
                    ★
                  </span>
                ))}
              </span>
              <span>
                {reviewCount} Customer {reviewCount === 1 ? 'Review' : 'Reviews'}
              </span>
            </div>
          )}

          <p className="product-detail__lead">{product.shortDescription || product.description}</p>

          {sizes.length > 0 && (
            <div className="product-detail__option">
              <p>Size</p>
              <div className="product-detail__chips">
                {sizes.map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`product-detail__chip ${selectedSize === value ? 'is-active' : ''}`}
                    onClick={() => setSize(value)}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          )}

          {colors.length > 0 && (
            <div className="product-detail__option">
              <p>Color</p>
              <div className="product-detail__swatches">
                {colors.map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`product-detail__swatch ${selectedColor === value ? 'is-active' : ''}`}
                    style={{ background: value }}
                    onClick={() => setColor(value)}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="product-detail__buy">
            <div className="product-detail__qty">
              <button type="button" aria-label="Decrease quantity" disabled={qty <= 1 || cart.isPending} onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
              <span>{qty}</span>
              <button type="button" aria-label="Increase quantity" disabled={cart.isPending || qty >= maximumQuantity} onClick={() => setQty((current) => Math.min(maximumQuantity, current + 1))}>+</button>
            </div>
            <button type="button" className="product-detail__cart" disabled={cart.isPending || (hasKnownStock && stockQuantity < 1) || qty > maximumQuantity} onClick={handleAddToCart}>
              {cart.isPending ? 'Adding…' : 'Add To Cart'}
            </button>
          </div>

          {cart.error && <p role="alert">{cart.error.message}</p>}
          {cart.isSuccess && <p role="status">Added to your cart. <Link to="/cart">View cart →</Link></p>}
          {(sizes.length > 0 || colors.length > 0) && <p>Size and colour selections are previews only; this checkout saves the listed product.</p>}
          <dl className="product-detail__meta">
            <div><dt>Brand</dt><dd>: {brandName}</dd></div>
            <div><dt>Category</dt><dd>: {categoryName}</dd></div>
            <div><dt>Stock</dt><dd>: {hasKnownStock ? (stockQuantity > 0 ? `${stockQuantity} available` : 'Out of stock') : 'Confirmed when added to cart'}</dd></div>
            {tags.length > 0 && <div><dt>Tags</dt><dd>: {tags.join(', ')}</dd></div>}
          </dl>
        </div>
      </section>

      <section className="product-detail__tabs">
        <div className="product-detail__tablist">
          <button type="button" className={tab === 'description' ? 'is-active' : ''} onClick={() => setTab('description')}>Description</button>
          <button type="button" className={tab === 'additional' ? 'is-active' : ''} onClick={() => setTab('additional')}>Additional Information</button>
          <button type="button" className={tab === 'reviews' ? 'is-active' : ''} onClick={() => setTab('reviews')}>Reviews [{reviewCount}]</button>
        </div>

        {tab === 'description' && (
          <div className="product-detail__copy">
            {product.description ? (
              String(product.description || '').split('\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))
            ) : (
              <div className="product-detail__empty-state" role="status" aria-live="polite">
                <h3>Product description coming soon</h3>
                <p>We’re preparing the full product details for this item. Check back soon for the complete overview.</p>
              </div>
            )}
            {images.length > 0 && (
              <div className="product-detail__scenes">
                {images.slice(0, 2).map((src) => (
                  <figure key={src}><img src={src} alt="" /></figure>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'additional' && (
          <div className="product-detail__copy">
            {specs.length === 0 ? (
              <div className="product-detail__empty-state" role="status" aria-live="polite">
                <h3>Additional information unavailable</h3>
                <p>More technical details for this product will be added soon.</p>
              </div>
            ) : (
              specs.map((spec) => (
                <p key={spec.name || spec.key}><strong>{spec.name || spec.key}:</strong> {spec.value}</p>
              ))
            )}
          </div>
        )}

        {tab === 'reviews' && (
          <div className="product-detail__copy">
            {reviews.length === 0 ? (
              <div className="product-detail__empty-state" role="status" aria-live="polite">
                <h3>No reviews yet</h3>
                <p>Be the first to share your experience with this product and help other customers make an informed choice.</p>
              </div>
            ) : (
              reviews.map((review) => (
                <article key={review.id || review.author}>
                  <strong>{review.author || review.userName || 'Customer'}</strong>
                  <p>{review.comment || review.body}</p>
                </article>
              ))
            )}
          </div>
        )}
      </section>

      <section className="product-detail__related">
        <h2>Related Products</h2>
        {related.length === 0 ? (
          <div className="product-detail__empty-state product-detail__empty-state--compact" role="status" aria-live="polite">
            <h3>No related products available</h3>
            <p>Explore more pieces from the collection to discover similar styles.</p>
          </div>
        ) : (
          <>
            <div className="products__grid products__grid--recommendations">
              {related.map((item) => <ProductCard key={item.id} product={item} onNotice={showProductNotice} />)}
            </div>
            <Link to="/shop" className="products__show-more">Show More</Link>
          </>
        )}
      </section>

      <ProductNotice notice={productNotice} onClose={closeProductNotice} />

      <Footer />
    </div>
  );
}
