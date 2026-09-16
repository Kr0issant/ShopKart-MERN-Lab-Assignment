import jwt from "jsonwebtoken";
import Customer from "../models/customer.model.js";

export async function isAuthenticated(req, res, next) {
    try {
        const token = req.cookies?.token;
        if (!token) {
            return res.status(401).json({ success: false, message: "Not Authorized" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const customer = await Customer.findById(decoded.userId).select("-password");

        if (!customer) {
            return res.status(401).json({ success: false, message: "Customer Not Found. Token Invalid" });
        }

        req.user = customer;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
}
