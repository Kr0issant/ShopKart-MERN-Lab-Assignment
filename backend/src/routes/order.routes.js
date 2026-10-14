import express from "express";
import {
    createPaymentOrder,
    verifyPayment,
    getOrders,
    getOrderById,
    updateOrderStatus
} from "../controllers/order.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const orderRoutes = express.Router();

// All order endpoints require authentication
orderRoutes.use(isAuthenticated);

orderRoutes.post("/create-payment-order", createPaymentOrder);
orderRoutes.post("/verify-payment", verifyPayment);
orderRoutes.get("/", getOrders);
orderRoutes.get("/:id", getOrderById);
orderRoutes.patch("/:id/status", updateOrderStatus);

export default orderRoutes;
