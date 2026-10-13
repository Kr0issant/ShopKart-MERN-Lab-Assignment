import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

// Add product to cart (or increment quantity if already present)
export async function addToCart(req, res) {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        if (product.stock <= 0) {
            return res.status(400).json({ success: false, message: "Product is out of stock" });
        }

        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return res.status(404).json({ success: false, message: "Customer not found" });
        }

        if (!Array.isArray(customer.cart)) {
            customer.cart = [];
        }

        const existingItem = customer.cart.find(
            (item) => item.product.toString() === productId
        );

        if (existingItem) {
            const nextQuantity = existingItem.quantity + 1;
            if (nextQuantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot add more than available stock (${product.stock} available)`
                });
            }
            existingItem.quantity = nextQuantity;
        } else {
            customer.cart.push({
                product: productId,
                quantity: 1
            });
        }

        await customer.save();

        await customer.populate({
            path: "cart.product",
            select: "name price image stock category description"
        });

        const activeCart = customer.cart.filter((item) => item.product !== null);

        return res.status(200).json({
            success: true,
            message: "Cart updated",
            cart: activeCart
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
}

// Get current user's cart populated with Product details
export async function getCart(req, res) {
    try {
        const customer = await Customer.findById(req.user._id).populate({
            path: "cart.product",
            select: "name price image stock category description"
        });

        if (!customer) {
            return res.status(404).json({ success: false, message: "Customer not found" });
        }

        // Filter out any referenced products that were deleted
        const activeCart = (customer.cart || []).filter((item) => item.product !== null);

        return res.status(200).json({
            success: true,
            cart: activeCart
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
}

// Update quantity of a specific item in the cart
export async function updateCartQuantity(req, res) {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }

        if (typeof quantity !== "number" || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a number and at least 1"
            });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return res.status(404).json({ success: false, message: "Customer not found" });
        }

        const cartItem = (customer.cart || []).find(
            (item) => item.product.toString() === productId
        );

        if (!cartItem) {
            return res.status(404).json({ success: false, message: "Product not in cart" });
        }

        if (quantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: `Requested quantity exceeds available stock (${product.stock} available)`
            });
        }

        cartItem.quantity = quantity;
        await customer.save();

        await customer.populate({
            path: "cart.product",
            select: "name price image stock category description"
        });

        const activeCart = customer.cart.filter((item) => item.product !== null);

        return res.status(200).json({
            success: true,
            message: "Quantity updated",
            cart: activeCart
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
}

// Remove a product from the cart
export async function removeFromCart(req, res) {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }

        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return res.status(404).json({ success: false, message: "Customer not found" });
        }

        const itemIndex = (customer.cart || []).findIndex(
            (item) => item.product.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({ success: false, message: "Product not in cart" });
        }

        customer.cart.splice(itemIndex, 1);
        await customer.save();

        await customer.populate({
            path: "cart.product",
            select: "name price image stock category description"
        });

        const activeCart = customer.cart.filter((item) => item.product !== null);

        return res.status(200).json({
            success: true,
            message: "Product removed from cart",
            cart: activeCart
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
}
