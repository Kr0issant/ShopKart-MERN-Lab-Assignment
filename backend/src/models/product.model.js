import mongoose from "mongoose";

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        validate: {
            validator: (v) => v > 0,
            message: props => `${props.value} must be greater than zero`
        }
    },
    category: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        required: true,
        validate: {
            validator: (v) => v >= 0,
            message: props => `${props.value} must be greater than or equal to zero`
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
});

const Product = mongoose.model("Product", productSchema);

export default Product;
