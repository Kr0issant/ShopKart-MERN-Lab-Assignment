import express from "express";
import { registerCustomer } from "../controllers/customer.controllers.js"

const customerRoutes = express.Router();

customerRoutes.post("/register", registerCustomer);

export default customerRoutes;