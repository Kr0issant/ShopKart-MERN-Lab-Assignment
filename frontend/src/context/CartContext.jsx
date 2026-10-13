import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { getCart, addToCart as apiAddToCart, updateCartQuantity as apiUpdateCartQuantity, removeFromCart as apiRemoveFromCart } from "../services/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mutatingItemId, setMutatingItemId] = useState(null);

  // Fetch cart from backend
  const fetchCart = useCallback(async () => {
    if (!user) {
      setCartItems([]);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await getCart();
      if (data.success && Array.isArray(data.cart)) {
        setCartItems(data.cart);
      } else {
        setCartItems([]);
      }
    } catch (err) {
      console.error("Error loading cart:", err);
      setError("Unable to load cart. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Synchronize cart on auth changes
  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCartItems([]);
    }
  }, [user, fetchCart]);

  // Add product to cart
  const addToCart = async (productId) => {
    setMutatingItemId(productId);
    try {
      const data = await apiAddToCart(productId);
      if (data.success && Array.isArray(data.cart)) {
        setCartItems(data.cart);
      }
      return data;
    } finally {
      setMutatingItemId(null);
    }
  };

  // Update quantity of an item
  const updateQuantity = async (productId, quantity) => {
    setMutatingItemId(productId);
    try {
      const data = await apiUpdateCartQuantity(productId, quantity);
      if (data.success && Array.isArray(data.cart)) {
        setCartItems(data.cart);
      }
      return data;
    } finally {
      setMutatingItemId(null);
    }
  };

  // Remove product from cart
  const removeFromCart = async (productId) => {
    setMutatingItemId(productId);
    try {
      const data = await apiRemoveFromCart(productId);
      if (data.success && Array.isArray(data.cart)) {
        setCartItems(data.cart);
      }
      return data;
    } finally {
      setMutatingItemId(null);
    }
  };

  // Derived Values calculated directly from state
  const totalUnits = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (item.quantity || 0), 0);
  }, [cartItems]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const price = item.product?.price || 0;
      const qty = item.quantity || 0;
      return acc + price * qty;
    }, 0);
  }, [cartItems]);

  const isItemInCart = useCallback((productId) => {
    return cartItems.some((item) => (item.product?._id || item.product) === productId);
  }, [cartItems]);

  const getItemQuantity = useCallback((productId) => {
    const item = cartItems.find((i) => (i.product?._id || i.product) === productId);
    return item ? item.quantity : 0;
  }, [cartItems]);

  const value = {
    cartItems,
    loading,
    error,
    mutatingItemId,
    totalUnits,
    subtotal,
    addToCart,
    updateQuantity,
    removeFromCart,
    refreshCart: fetchCart,
    isItemInCart,
    getItemQuantity
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
