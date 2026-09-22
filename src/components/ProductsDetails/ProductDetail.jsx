import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import { useProduct, useProducts } from '../../hooks/apiHooks';
import './ProductDetail.scss';

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
  return `Rs. ${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function ProductDetail() {
  const { id } = useParams();
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

  const sizes = product?.sizes || [];
  const colors = product?.colors || [];
  const tags = product?.tags || [];
  const specs = product?.specifications || [];
  const reviews = product?.reviews || [];

  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [tab, setTab] = useState('description');

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
  const reviewCount = product.reviewCount ?? reviews.length ?? 0;
  const selectedSize = size || sizes[0];
  const selectedColor = color || colors[0];

  function handleAddToCart() {
    console.log('add-to-cart', { id: product.id, qty, size: selectedSize, color: selectedColor });
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
            <span>{reviewCount} Customer Review</span>
          </div>

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
              <button type="button" onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
              <span>{qty}</span>
              <button type="button" onClick={() => setQty(qty + 1)}>+</button>
            </div>
            <button type="button" className="product-detail__cart" onClick={handleAddToCart}>
              Add To Cart
            </button>
            <button type="button" className="product-detail__compare">+ Compare</button>
          </div>

          <dl className="product-detail__meta">
            <div><dt>SKU</dt><dd>: {product.sku || product.id}</dd></div>
            <div><dt>Category</dt><dd>: {product.category?.name || product.category || '—'}</dd></div>
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
            {String(product.description || '').split('\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
            <div className="product-detail__scenes">
              {images.slice(0, 2).map((src) => (
                <figure key={src}><img src={src} alt="" /></figure>
              ))}
            </div>
          </div>
        )}

        {tab === 'additional' && (
          <div className="product-detail__copy">
            {specs.map((spec) => (
              <p key={spec.name || spec.key}><strong>{spec.name || spec.key}:</strong> {spec.value}</p>
            ))}
          </div>
        )}

        {tab === 'reviews' && (
          <div className="product-detail__copy">
            {reviews.map((review) => (
              <article key={review.id || review.author}>
                <strong>{review.author || review.userName || 'Customer'}</strong>
                <p>{review.comment || review.body}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="product-detail__related">
        <h2>Related Products</h2>
        <div className="product-detail__grid">
          {related.map((item) => {
            const src = imageUrl(item.primaryImage || item.image || item.images?.[0]);
            return (
              <Link key={item.id} to={`/products/${item.id}`} className="product-detail__card">
                <div className="product-detail__card-media">
                  {src ? <img src={src} alt={item.name} /> : null}
                </div>
                <div className="product-detail__card-body">
                  <h3>{item.name}</h3>
                  <p>{item.category?.name || ''}</p>
                  <strong>{formatMoney(item.price)}</strong>
                </div>
              </Link>
            );
          })}
        </div>
        <Link to="/shop" className="product-detail__more">Show More</Link>
      </section>

      <Footer />
    </div>
  );
}