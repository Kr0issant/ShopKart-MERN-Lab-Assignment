import Customer from "../models/customer.model.js";
import bcrypt from 'bcrypt';
import { genToken } from "../utils/generateToken.js";

const cookiesOptions = {
    httpOnly: true,
    secure: true
}

export async function registerCustomer(req, res) {
    try {
        const { fullName, email, password, phone } = req.body;

        if (!fullName || !email || !password || !phone) {
            return res.status(400).json({ message: "All fields Required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password Length should be greater than 6" });
        }

        const emailExists = await Customer.findOne({ email });
        if (emailExists) {
            return res.status(409).json({ message: "Customer Already Exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newCustomer = await Customer.create({
            fullName,
            email,
            password: hashedPassword,
            phone
        });

        // const token = genToken(newCustomer._id);
        // res.cookie("token", token, cookiesOptions);

        res.status(201).json({
            "success": true,
            "message": "Customer registered successfully",
            "customer": {
                "_id": newCustomer._id,
                "fullName": fullName,
                "email": email,
                "phone": phone
            }
        });
    } catch (error) {
        res.status(500).json({
            "success": false,
            "message": "Internal Server Errorr",
            "error": error
        });
    }
}
