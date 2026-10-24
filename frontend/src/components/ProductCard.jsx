import { Link } from "react-router-dom";
import "../css/ProductCard.css";

function ProductCard({ product }) {
  const image = product.images?.[0];

  return (
    <article className="product-card">
      <Link
        to={`/products/${product._id}`}
        className="product-card__image-link"
      >
        <div className="product-card__image">
          <img
            src={product.images?.[0]}
            alt={product.name}
            loading="lazy"
            onError={(event) => {
              event.currentTarget.style.display = "none";
              event.currentTarget.parentElement.classList.add(
                "image-unavailable",
              );
            }}
          />
          <span className="image-fallback">Image unavailable</span>
        </div>
      </Link>

      <div className="product-card__content">
        <p className="product-card__brand">{product.brand || "REWEAR EDIT"}</p>

        <h3>{product.name}</h3>

        <p className="product-card__category">
          {product.category}
          {product.size && ` · Size ${product.size}`}
        </p>

        <div className="product-card__bottom">
          <p>
            <strong>₹{product.pricePerDay}</strong>
            <span> / day</span>
          </p>

          <Link to={`/products/${product._id}`} className="product-card__view">
            View piece ↗
          </Link>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
