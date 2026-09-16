import express from 'express';
import cors from 'cors';
import dotenv from "dotenv";
import mongoose from 'mongoose';
import cookieParser from "cookie-parser";
import customerRoutes from "./src/routes/customer.routes.js";

dotenv.config()

mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log("MongoDB Connected");
}).catch((err) => {
    console.log(err);
})

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(express.json());
app.use(cookieParser())

app.use('/customers', customerRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: "Internal Server Error" });
});

export default app;
