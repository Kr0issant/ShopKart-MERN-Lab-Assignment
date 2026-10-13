import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getProductById, addToWishlist, removeFromWishlist, getWishlist } from "../services/api";
import { useCart } from "../context/CartContext";

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addedToCart, setAddedToCart] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartError, setCartError] = useState("");
  const [wishlistState, setWishlistState] = useState("idle"); // idle | saving | saved | error
  const [wishlistError, setWishlistError] = useState("");

  useEffect(() => {
    const fetchProductAndWishlist = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getProductById(id);
        if (res.success && res.product) {
          setProduct(res.product);
        } else {
          setError("Product not found");
        }

        // Check if currently saved in user's wishlist
        try {
          const wishRes = await getWishlist();
          if (wishRes.success && Array.isArray(wishRes.wishlist)) {
            const isSaved = wishRes.wishlist.some(
              (item) => (item._id || item) === id
            );
            if (isSaved) setWishlistState("saved");
          }
        } catch {
          // wishlist fetch failure shouldn't block product details
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
      fetchProductAndWishlist();
    }
  }, [id]);

  const handleWishlistToggle = async () => {
    if (wishlistState === "saving") return;
    setWishlistError("");
    setWishlistState("saving");

    try {
      if (wishlistState === "saved") {
        await removeFromWishlist(id);
        setWishlistState("idle");
      } else {
        await addToWishlist(id);
        setWishlistState("saved");
      }
    } catch (err) {
      console.error("Wishlist action failed:", err);
      if (err.response?.status === 409) {
        setWishlistState("saved");
      } else {
        setWishlistState("error");
        setWishlistError(
          err.response?.data?.message || "Unable to update wishlist. Please try again."
        );
        setTimeout(() => setWishlistError(""), 3500);
      }
    }
  };

  const handleAddToCart = async () => {
    if (addingToCart || isOutOfStock) return;
    setAddingToCart(true);
    setCartError("");
    try {
      await addToCart(id);
      setAddedToCart(true);
      setTimeout(() => {
        setAddedToCart(false);
      }, 2500);
    } catch (err) {
      console.error("Add to cart failed:", err);
      setCartError(
        err.response?.data?.message || "Failed to add product to cart. Please try again."
      );
      setTimeout(() => setCartError(""), 3500);
    } finally {
      setAddingToCart(false);
    }
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
              disabled={isOutOfStock || addingToCart}
            >
              {isOutOfStock ? (
                "Out of Stock"
              ) : addingToCart ? (
                <>
                  <svg className="spin-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Adding to Bag...
                </>
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

            <button
              type="button"
              className={`btn btn-details-wishlist ${
                wishlistState === "saved"
                  ? "saved"
                  : wishlistState === "error"
                  ? "error"
                  : wishlistState === "saving"
                  ? "saving"
                  : ""
              }`}
              onClick={handleWishlistToggle}
              disabled={wishlistState === "saving"}
            >
              {wishlistState === "saving" ? (
                <>
                  <svg className="spin-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  <span>Saving...</span>
                </>
              ) : wishlistState === "saved" ? (
                <>
                  <svg className="heart-icon-filled" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  <span>Added to Wishlist</span>
                </>
              ) : wishlistState === "error" ? (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                  </svg>
                  <span>Retry</span>
                </>
              ) : (
                <>
                  <svg className="heart-icon-outline" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  <span>Add to Wishlist</span>
                </>
              )}
            </button>
          </div>

          {cartError && (
            <div className="product-details-wishlist-error" role="alert">
              {cartError}
            </div>
          )}

          {wishlistError && (
            <div className="product-details-wishlist-error" role="alert">
              {wishlistError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
