import express from "express";
import multer from "multer";
import { isInstructorOrAdmin, protectRoute } from "../middleware/auth.middle.js";
import { createSession, incomingSession, enrollUser, paginationSession, filterSession, updateAndCancel} from "../controller/trainController.js";

const storage = multer.memoryStorage();
const upload = multer({storage: storage})

const router = express.Router();

router.post("/videos",isInstructorOrAdmin, upload.single('video'), createSession);
router.post("/", protectRoute, isInstructorOrAdmin,incomingSession);
router.post("/:id/enroll", isInstructorOrAdmin, enrollUser);
router.get("/",protectRoute, paginationSession);
router.get("/", protectRoute, filterSession);
router.patch("/:id",isInstructorOrAdmin, updateAndCancel);


export default router;