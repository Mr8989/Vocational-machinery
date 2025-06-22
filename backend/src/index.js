import "dotenv/config.js";
import express from "express";
import authRoutes from "./routes/authRoutes.js";
import { connectDB } from "./lib/db.js";
import trainRoutes from "./routes/trainRoutes.js";
import paymentRoute from "./routes/paymentRoute.js";
import applicationRoute from "./routes/applicationRoute.js";
import cors from "cors";
import Payment from "./models/payment.js";



const app = express();

const PORT = process.env.PORT || 5000;



app.use(express.json()); //req body
app.use(express.urlencoded({extended:true}))
app.use(cors());

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
if(!PAYSTACK_SECRET_KEY){
    console.error('PAYSTACK_SECRET_KEY is not defined in the environment variable please set it')
    process.exit(1);
}
app.set('Payment', Payment);
app.set('PAYSTACK_SECRET_KEY', PAYSTACK_SECRET_KEY);

app.use("/api/auth", authRoutes);
app.use("/api/training",trainRoutes);
app.use("/api/application",applicationRoute);
app.use("/api/payment",paymentRoute);

app.listen(PORT,() => {
    console.log(`Server is running on port ${PORT}`)
    connectDB()
    console.log(`Server running on port ${PORT}`);
    console.log(`Access the root at http://localhost:${PORT}`);
    console.log(`Expected payment initialize endpoint: http://localhost:${PORT}/api/payment/initialize (POST)`);
    console.log(`Expected payment verify endpoint: http://localhost:${PORT}/api/payment/verify (POST)`);
    });

