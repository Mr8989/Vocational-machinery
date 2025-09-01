// server.js
import "dotenv/config.js";
import express from "express";
import authRoutes from "./routes/authRoutes.js";
import { connectDB } from "./lib/db.js";
import trainRoutes from "./routes/trainRoutes.js";
import paymentRoute from "./routes/paymentRoute.js";
import applicationRoute from "./routes/applicationRoute.js";
import cors from "cors";
import Payment from "./models/payment.js"; // Ensure this path is correct for your Payment model

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json()); // Enable parsing of JSON request bodies
app.use(express.urlencoded({ extended: true })); // Enable parsing of URL-encoded request bodies
app.use(cors()); // Enable CORS for all routes

// --- Database Connection (MongoDB) ---
// It's generally better to connect to DB before starting the server to ensure connectivity
 // Ensure this function establishes the MongoDB connection

// --- IMPORTANT: KoraPay Secret Key Configuration ---
// Get the KoraPay Secret Key from environment variables
const KORAPAY_SECRET_KEY = process.env.KORAPAY_SECRET_KEY;

// Diagnostic log: Verify the KoraPay Secret Key loaded from .env
//console.log("server.js: KoraPay secret key loaded from .env:", KORAPAY_SECRET_KEY ? '*****' + KORAPAY_SECRET_KEY.substring(KORAPAY_SECRET_KEY.length - 5) : 'undefined');

// Critical check: Ensure the KoraPay Secret Key is present
if (!KORAPAY_SECRET_KEY) {
    console.error('server.js: CRITICAL ERROR: KORAPAY_SECRET_KEY is not defined in the environment variables. Please set it in your .env file.');
    process.exit(1); // Exit the process if the critical key is missing
}

// Make the Payment Mongoose model available globally to Express app via app.set
app.set('Payment', Payment);

// Make the KoraPay Secret Key available globally to Express app via app.set
// This is what paymentController.js will retrieve using req.app.get('KORAPAY_SECRET_KEY')
//app.set('KORAPAY_SECRET_KEY', KORAPAY_SECRET_KEY);

// --- Register Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/training", trainRoutes);
app.use("/api/application", applicationRoute);
app.use("/api/payment", paymentRoute); // This route will use paymentController.js

// --- Start the Server ---
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
});