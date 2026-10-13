import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

// Add a product to the authenticated user's wishlist
export async function addToWishlist(req, res) {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return res.status(404).json({ success: false, message: "Customer not found" });
        }

        const alreadyWishlisted = customer.wishlist.some(
            (id) => id.toString() === productId
        );

        if (alreadyWishlisted) {
            return res.status(409).json({ success: false, message: "Product already in wishlist" });
        }

        customer.wishlist.push(productId);
        await customer.save();

        return res.status(200).json({
            success: true,
            message: "Product added to wishlist"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
}

// Get the authenticated user's populated wishlist
export async function getWishlist(req, res) {
    try {
        const customer = await Customer.findById(req.user._id).populate({
            path: "wishlist",
            select: "name price category image stock description createdAt"
        });

        if (!customer) {
            return res.status(404).json({ success: false, message: "Customer not found" });
        }

        // Filter out any referenced products that might have been deleted from the database
        const activeWishlist = (customer.wishlist || []).filter((item) => item !== null);

        return res.status(200).json({
            success: true,
            count: activeWishlist.length,
            wishlist: activeWishlist
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
}

// Remove a product from the authenticated user's wishlist
export async function removeFromWishlist(req, res) {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }

        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return res.status(404).json({ success: false, message: "Customer not found" });
        }

        const index = customer.wishlist.findIndex(
            (id) => id.toString() === productId
        );

        if (index === -1) {
            return res.status(404).json({ success: false, message: "Product not in wishlist" });
        }

        customer.wishlist.splice(index, 1);
        await customer.save();

        return res.status(200).json({
            success: true,
            message: "Product removed from wishlist"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
}

// Bonus: Toggle wishlist status
export async function toggleWishlist(req, res) {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return res.status(404).json({ success: false, message: "Customer not found" });
        }

        const index = customer.wishlist.findIndex(
            (id) => id.toString() === productId
        );

        if (index > -1) {
            // Already in wishlist -> remove
            customer.wishlist.splice(index, 1);
            await customer.save();
            return res.status(200).json({
                success: true,
                saved: false,
                message: "Product removed from wishlist"
            });
        } else {
            // Not in wishlist -> add
            customer.wishlist.push(productId);
            await customer.save();
            return res.status(200).json({
                success: true,
                saved: true,
                message: "Product added to wishlist"
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
}
