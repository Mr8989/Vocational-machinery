import express from "express";
import {initializePayment, verifyPayment, authorizePayment} from "../controller/paymentController.js"


const router = express.Router();

router.post("/initialize",initializePayment);
router.post("/authorize",authorizePayment)
router.get("/verify", verifyPayment) 

export default router;