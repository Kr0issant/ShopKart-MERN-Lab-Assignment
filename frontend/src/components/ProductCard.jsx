import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
  const isOutOfStock = product.stock <= 0;

  return (
    <div className="product-card">
      <div className="product-card-image-wrapper">
        <img
          src={product.image}
          alt={product.name}
          className="product-card-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://placehold.co/400x300?text=Product+Image";
          }}
        />
        <span className="product-card-category">{product.category}</span>
      </div>

      <div className="product-card-body">
        <h3 className="product-card-title" title={product.name}>
          {product.name}
        </h3>

        <div className="product-card-meta">
          <div className="price-group">
            <span className="product-card-price">
              ₹{product.price?.toLocaleString("en-IN")}
            </span>
          </div>
          <span
            className={`product-stock-badge ${
              isOutOfStock ? "stock-out" : product.stock <= 5 ? "stock-low" : "stock-in"
            }`}
          >
            {isOutOfStock
              ? "Out of Stock"
              : product.stock <= 5
              ? `Only ${product.stock} left`
              : "In Stock"}
          </span>
        </div>

        <Link
          to={`/products/${product._id}`}
          className="btn btn-secondary btn-sm product-card-btn"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
