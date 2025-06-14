import "dotenv/config.js";
import express from "express";
import authRoutes from "./routes/authRoutes.js";
import { connectDB } from "./lib/db.js";
import trainRoutes from "./routes/trainRoutes.js";
import applicationRoute from "./routes/applicationRoute.js";
import cors from "cors";
import cloudinary from "./lib/cloudinary.js";


const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json()); //req body
app.use(express.urlencoded({extended:true}))
app.use(cors());
app.use("/api/auth", authRoutes);
app.use("/api/training",trainRoutes);
app.use("/api/application",applicationRoute);

app.listen(PORT,() => {
    console.log(`Server is running on port ${PORT}`)
    connectDB().catch(err => {
        console.error("Database connection failed", err)
    });

    process.on("unhandledRejection", (err) => {
        console.err("Server crushed", err);
        process.exit(1);
    })
})