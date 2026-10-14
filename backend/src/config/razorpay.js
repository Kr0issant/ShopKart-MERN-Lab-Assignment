import Razorpay from "razorpay";
import dotenv from "dotenv";

dotenv.config();

const key_id = process.env.RAZORPAY_KEY_ID || "";
const key_secret = process.env.RAZORPAY_KEY_SECRET || "";

let razorpay = null;

if (key_id && key_secret) {
    razorpay = new Razorpay({
        key_id,
        key_secret,
    });
} else {
    console.warn(
        "[Razorpay Config] Warning: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not configured in backend/.env"
    );
}

export const getRazorpayInstance = () => {
    if (!razorpay) {
        if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
            razorpay = new Razorpay({
                key_id: process.env.RAZORPAY_KEY_ID,
                key_secret: process.env.RAZORPAY_KEY_SECRET,
            });
            return razorpay;
        }
    }
    return razorpay;
};

export default razorpay;
