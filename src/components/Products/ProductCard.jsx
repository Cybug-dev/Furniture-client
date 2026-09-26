import { useMemo, useState } from "react";
import { Link } from "react-router";
import { Heart, ShoppingCart } from "lucide-react";
import { useAddToCart } from "../../commerce/commerce.hooks.js";
import { money } from "../../commerce/commerce.utils.js";
import "./Products.scss";

function formatPrice(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? money(amount, "NGN") : "Price unavailable";
}

function imageUrl(image) {
  if (!image) return "";
  if (typeof image === "string") return image;
  return image.url || image.src || image.secureUrl || image.secure_url || "";
}

function primaryImage(product) {
  const images = Array.isArray(product.images) ? product.images : [];
  const preferred =
    images.find((image) => image.isPrimary) ||
    images.find((image) => image.position === 0) ||
    images[0];
  return imageUrl(product.primaryImage || product.image || preferred);
}

export default function ProductCard({ product, onNotice }) {
  const cart = useAddToCart();
  const [imageFailed, setImageFailed] = useState(false);
  const [liked, setLiked] = useState(false);
  const src = useMemo(() => primaryImage(product), [product]);
  const currentPrice = Number(product.price);
  const originalPrice = Number(product.compareAtPrice);
  const hasDiscount =
    Number.isFinite(currentPrice) &&
    Number.isFinite(originalPrice) &&
    originalPrice > currentPrice;
  const productPath = `/products/${encodeURIComponent(product.id)}`;

  const addToCart = async () => {
    try {
      const result = await cart.add(product.id, 1);
      if (result)
        onNotice?.({
          type: "success",
          message: `${product.name} was added to your cart.`,
        });
    } catch (error) {
      onNotice?.({
        type: "error",
        message: error.message || "This item could not be added to your cart.",
      });
    }
  };

  return (
    <article className="products-card">
      <button
        className={`products-card__like${liked ? " is-liked" : ""}`}
        type="button"
        aria-label={`${liked ? "Unlike" : "Like"} ${product.name}`}
        aria-pressed={liked}
        onClick={() => {
          const next = !liked;
          setLiked(next);
          onNotice?.({
            type: "info",
            message: next
              ? `${product.name} was liked.`
              : `${product.name} was unliked.`,
          });
        }}
      >
        <Heart
          size={16}
          fill={liked ? "currentColor" : "none"}
          aria-hidden="true"
        />
      </button>
      <Link
        className="products-card__details"
        to={productPath}
        aria-label={`View details for ${product.name}`}
      >
        <div className="products-card__media">
          {hasDiscount && <span className="products-card__badge">Sale</span>}
          {src && !imageFailed ? (
            <img
              src={src}
              alt={product.name}
              loading="lazy"
              decoding="async"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div
              className="products-card__placeholder"
              role="img"
              aria-label={`${product.name} image unavailable`}
            />
          )}
        </div>
        <div className="products-card__body">
          <h3>{product.name}</h3>
          {product.shortDescription && <p>{product.shortDescription}</p>}
          <div className="products-card__prices">
            <strong>{formatPrice(product.price)}</strong>
            {hasDiscount && <span>{formatPrice(product.compareAtPrice)}</span>}
          </div>
        </div>
      </Link>
      <button
        className="products-card__cart"
        type="button"
        disabled={cart.isPending || product.stockQuantity === 0}
        onClick={addToCart}
      >
        <ShoppingCart size={16} aria-hidden="true" />
        <span>
          {product.stockQuantity === 0
            ? "Out of stock"
            : cart.isPending
              ? "Adding…"
              : "Add to Cart"}
        </span>
      </button>
    </article>
  );
}
