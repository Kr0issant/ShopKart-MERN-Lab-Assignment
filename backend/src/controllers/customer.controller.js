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
            return res.status(400).json({ success: false, message: "All fields Required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ success: false, message: "Password Length should be greater than 6" });
        }

        const emailExists = await Customer.findOne({ email });
        if (emailExists) {
            return res.status(409).json({ success: false, message: "Customer Already Exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newCustomer = await Customer.create({
            fullName,
            email,
            password: hashedPassword,
            phone
        });

        const token = genToken(newCustomer._id);
        res.cookie("token", token, cookiesOptions);

        res.status(201).json({
            success: true,
            message: "Customer registered successfully",
            customer: {
                _id: newCustomer._id,
                fullName: fullName,
                email: email,
                phone: phone
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error
        });
    }
}

export async function loginCustomer(req, res) {
    try {
        const { email, password } = req.body;

        const customer = await Customer.findOne({ email });
        if (!customer) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const passwordCheck = await bcrypt.compare(password, customer.password);
        if (!passwordCheck) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const token = genToken(customer._id);
        res.cookie("token", token, cookiesOptions);

        res.status(200).json({ success: true, message: "Login successful" });
    } catch(error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error
        });
    }
}

export async function getCustomer(req, res) {
    try {
        res.status(200).json({
            _id: req.user._id, 
            fullName: req.user.fullName, 
            email: req.user.email,
            phone: req.user.phone
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error
        });
    }
}

export async function logoutCustomer(req, res) {
    res.clearCookie("token", {
        httpOnly: true,
        secure: true
    });

    res.status(200).json({ success: true, message: "Logged out successfully" });
}

export async function changePassword(req, res) {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ success: false, message: "Both old and new passwords are required" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: "New password must contain at least 6 characters" });
        }

        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return res.status(404).json({ success: false, message: "Customer not found" });
        }

        const isMatch = await bcrypt.compare(oldPassword, customer.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Incorrect old password" });
        }

        const salt = await bcrypt.genSalt(10);
        customer.password = await bcrypt.hash(newPassword, salt);
        await customer.save();

        res.status(200).json({ success: true, message: "Password changed successfully" });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error
        });
    }
}