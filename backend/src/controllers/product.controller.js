import Product from "../models/product.model.js";

export async function addProduct(req, res) {
    try {
        const { name, description, price, category, image, stock } = req.body;

        if (!name || !description || !price || !category || !image) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        if (stock < 0) {
            return res.status(400).json({ success: false, message: "Stock must not be negative" });
        }
        if (price <= 0) {
            return res.status(400).json({ success: false, message: "Price must be greater than 0" });
        }

        const product = new Product({ name, description, price, category, image, stock });

        await product.save();

        return res.status(201).json({ success: true, message: "Product added successfully", product });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error", error: error });
    }
}
