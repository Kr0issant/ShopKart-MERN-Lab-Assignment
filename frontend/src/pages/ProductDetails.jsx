import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getProductById } from "../services/api";

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getProductById(id);
        if (res.success && res.product) {
          setProduct(res.product);
        } else {
          setError("Product not found");
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        const msg =
          err.response?.data?.message || "Failed to load product details. Please try again.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = () => {
    setAddedToCart(true);
    setTimeout(() => {
      setAddedToCart(false);
    }, 2500);
  };

  if (loading) {
    return (
      <div className="product-details-page container">
        <div className="products-loading">
          <div className="spinner-large"></div>
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-details-page container">
        <div className="products-error">
          <div className="alert alert-error">{error || "Product not found"}</div>
          <Link to="/products" className="btn btn-secondary btn-sm">
            ← Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="product-details-page container">
      {/* Breadcrumb / Back Link */}
      <div className="details-breadcrumb">
        <Link to="/products" className="back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Products
        </Link>
      </div>

      <div className="product-details-layout">
        {/* Left: Product Image */}
        <div className="product-details-image-container">
          <img
            src={product.image}
            alt={product.name}
            className="product-details-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/600x600?text=Product+Image";
            }}
          />
        </div>

        {/* Right: Product Info */}
        <div className="product-details-info">
          <div className="product-category-badge">{product.category}</div>
          <h1 className="product-details-title">{product.name}</h1>

          <div className="product-details-price-row">
            <span className="product-details-price">
              ₹{product.price?.toLocaleString("en-IN")}
            </span>
            <span
              className={`product-stock-badge ${
                isOutOfStock ? "stock-out" : product.stock <= 5 ? "stock-low" : "stock-in"
              }`}
            >
              {isOutOfStock
                ? "Out of Stock"
                : product.stock <= 5
                ? `Only ${product.stock} units left`
                : `${product.stock} units available`}
            </span>
          </div>

          <div className="product-details-divider"></div>

          <div className="product-details-section">
            <h3>Description</h3>
            <p className="product-description-text">{product.description}</p>
          </div>

          <div className="product-details-actions">
            <button
              type="button"
              className={`btn btn-primary btn-add-cart ${addedToCart ? "btn-added" : ""}`}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              {isOutOfStock ? (
                "Out of Stock"
              ) : addedToCart ? (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Added to Cart!
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                  </svg>
                  Add to Cart
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
