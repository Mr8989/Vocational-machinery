import express from "express";
import {signup, login} from "../controller/authController.js"
import { protect } from "../middleware/auth.middle.js";


const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", protect)

export default router;