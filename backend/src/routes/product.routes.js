import express from "express";
import { addProduct, getProducts, getProduct } from "../controllers/product.controller.js";

const productRoutes = express.Router();

productRoutes.post("/", addProduct);
productRoutes.get("/", getProducts);
productRoutes.get("/:id", getProduct);

export default productRoutes;