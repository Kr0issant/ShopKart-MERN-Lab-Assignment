import crypto from "crypto";
import mongoose from "mongoose";
import Order from "../models/order.model.js";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";
import { getRazorpayInstance } from "../config/razorpay.js";

// POST /orders/create-payment-order
export async function createPaymentOrder(req, res) {
    try {
        const { shippingAddress } = req.body;

        // 1. Validate shipping address fields
        if (!shippingAddress || typeof shippingAddress !== "object") {
            return res.status(400).json({
                success: false,
                message: "Shipping address is required"
            });
        }

        const { fullName, phone, addressLine1, city, state, pincode } = shippingAddress;

        if (
            !fullName?.trim() ||
            !phone?.trim() ||
            !addressLine1?.trim() ||
            !city?.trim() ||
            !state?.trim() ||
            !pincode?.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "All shipping address fields are required"
            });
        }

        // Validate phone format (minimum 10 digits)
        const cleanedPhone = phone.replace(/[\s+-]/g, "");
        if (cleanedPhone.length < 10 || isNaN(cleanedPhone)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid phone number (minimum 10 digits)"
            });
        }

        // Validate pincode format (6 digits)
        const cleanedPincode = pincode.trim();
        if (!/^\d{6}$/.test(cleanedPincode)) {
            return res.status(400).json({
                success: false,
                message: "Pincode must contain exactly 6 digits"
            });
        }

        // 2. Load authenticated user's cart from database
        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        if (!Array.isArray(customer.cart) || customer.cart.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Your cart is empty. Please add items before checking out"
            });
        }

        // 3. Re-verify products and stock against latest database state
        const orderItems = [];
        let calculatedTotal = 0;

        for (const cartItem of customer.cart) {
            const product = await Product.findById(cartItem.product);

            if (!product) {
                return res.status(400).json({
                    success: false,
                    message: "One or more products in your cart are no longer available"
                });
            }

            if (product.stock <= 0) {
                return res.status(400).json({
                    success: false,
                    message: `Product "${product.name}" is out of stock`
                });
            }

            if (cartItem.quantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for "${product.name}". Only ${product.stock} units available`
                });
            }

            // Snapshot product details at purchase time
            orderItems.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: cartItem.quantity,
                image: product.image || ""
            });

            calculatedTotal += product.price * cartItem.quantity;
        }

        // 4. Check Razorpay initialization
        const razorpayInstance = getRazorpayInstance();
        if (!razorpayInstance) {
            return res.status(500).json({
                success: false,
                message: "Razorpay is not configured on the server. Please check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env"
            });
        }

        // 5. Create pending ShopKart order
        const order = new Order({
            user: customer._id,
            items: orderItems,
            shippingAddress: {
                fullName: fullName.trim(),
                phone: phone.trim(),
                addressLine1: addressLine1.trim(),
                city: city.trim(),
                state: state.trim(),
                pincode: pincode.trim()
            },
            totalAmount: calculatedTotal,
            status: "PENDING_PAYMENT",
            paymentStatus: "PENDING"
        });

        await order.save();

        // 6. Create Razorpay Order in paise (amount * 100)
        const amountInPaise = Math.round(calculatedTotal * 100);

        const razorpayOrder = await razorpayInstance.orders.create({
            amount: amountInPaise,
            currency: "INR",
            receipt: order._id.toString(),
            notes: {
                shopKartOrderId: order._id.toString(),
                userId: customer._id.toString()
            }
        });

        order.razorpayOrderId = razorpayOrder.id;
        await order.save();

        return res.status(200).json({
            success: true,
            shopKartOrderId: order._id,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error("createPaymentOrder error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to initiate checkout order",
            error: error.message
        });
    }
}

// POST /orders/verify-payment
export async function verifyPayment(req, res) {
    try {
        const {
            shopKartOrderId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        if (!shopKartOrderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Missing payment verification parameters"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(shopKartOrderId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid ShopKart order ID"
            });
        }

        const order = await Order.findById(shopKartOrderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Verify order ownership
        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Forbidden: You are not authorized to verify this order"
            });
        }

        // 1. Verify HMAC SHA-256 signature using Razorpay Key Secret and trusted razorpayOrderId
        const secret = process.env.RAZORPAY_KEY_SECRET;
        if (!secret) {
            return res.status(500).json({
                success: false,
                message: "RAZORPAY_KEY_SECRET is not configured on server"
            });
        }

        const body = `${order.razorpayOrderId}|${razorpay_payment_id}`;
        const expectedSignature = crypto
            .createHmac("sha256", secret)
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            order.paymentStatus = "FAILED";
            await order.save();
            return res.status(400).json({
                success: false,
                message: "Invalid payment signature. Verification failed."
            });
        }

        // 2. Mark order as PAID and PLACED
        order.paymentStatus = "PAID";
        order.status = "PLACED";
        order.razorpayPaymentId = razorpay_payment_id;
        await order.save();

        // 3. Deduct purchased quantities from product inventory
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: -item.quantity }
            });
        }

        // 4. Clear the customer's cart
        const customer = await Customer.findById(req.user._id);
        if (customer) {
            customer.cart = [];
            await customer.save();
        }

        return res.status(200).json({
            success: true,
            message: "Payment verified successfully and order placed",
            order
        });
    } catch (error) {
        console.error("verifyPayment error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to verify payment",
            error: error.message
        });
    }
}

// GET /orders
export async function getOrders(req, res) {
    try {
        const orders = await Order.find({ user: req.user._id })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            orders
        });
    } catch (error) {
        console.error("getOrders error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve orders",
            error: error.message
        });
    }
}

// GET /orders/:id
export async function getOrderById(req, res) {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID"
            });
        }

        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Enforce ownership
        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Forbidden: You are not authorized to view this order"
            });
        }

        return res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        console.error("getOrderById error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve order details",
            error: error.message
        });
    }
}

// PATCH /orders/:id/status (Bonus Challenge: Order Status Progression)
export async function updateOrderStatus(req, res) {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ["PENDING_PAYMENT", "PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`
            });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID"
            });
        }

        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Enforce ownership
        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Forbidden: You are not authorized to update this order"
            });
        }

        order.status = status;
        await order.save();

        return res.status(200).json({
            success: true,
            message: `Order status updated to ${status}`,
            order
        });
    } catch (error) {
        console.error("updateOrderStatus error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update order status",
            error: error.message
        });
    }
}
