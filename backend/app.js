import express from 'express';
import cors from 'cors';
import dotenv from "dotenv";
import mongoose from 'mongoose';
import cookieParser from "cookie-parser";
import customerRoutes from "./src/routes/customer.routes.js";
import productRoutes from "./src/routes/product.routes.js";
import wishlistRoutes from "./src/routes/wishlist.routes.js";
import cartRoutes from "./src/routes/cart.routes.js";
import orderRoutes from "./src/routes/order.routes.js";

dotenv.config()

mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log("MongoDB Connected");
}).catch((err) => {
    console.log(err);
})

const app = express();

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://shopkart-mern-lab-assignment.vercel.app",
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [])
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, or server-to-server)
        if (!origin) return callback(null, true);

        const cleanOrigin = origin.replace(/\/$/, "");
        const isAllowed =
            allowedOrigins.some((allowed) => allowed.replace(/\/$/, "") === cleanOrigin) ||
            /^https:\/\/shopkart-mern-lab-assignment.*\.vercel\.app$/.test(cleanOrigin);

        if (isAllowed) {
            return callback(null, true);
        }
        return callback(new Error(`CORS Error: Origin ${origin} not allowed by CORS policy`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"]
}));
app.use(express.json());
app.use(cookieParser())

const registerRoutes = (prefix = "") => {
    app.use(`${prefix}/customers`, customerRoutes);
    app.use(`${prefix}/products`, productRoutes);
    app.use(`${prefix}/wishlist`, wishlistRoutes);
    app.use(`${prefix}/cart`, cartRoutes);
    app.use(`${prefix}/orders`, orderRoutes);
};

// Support both direct access (localhost) and /api rewrite (Vercel)
registerRoutes("");
registerRoutes("/api");

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: "Internal Server Error" });
});

export default app;
