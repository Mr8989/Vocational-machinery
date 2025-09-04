import express from "express";
import multer from "multer";
import { isInstructorOrAdmin, protectRoute } from "../middleware/auth.middle.js";
import { createSession, enrollUser, paginationSession, filterSession, updateAndCancel, streamVideo} from "../controller/trainController.js";

const storage = multer.memoryStorage();
const upload = multer({storage: storage})

const router = express.Router();

router.post("/videos",upload.single('video') ,isInstructorOrAdmin, createSession);
router.post("/", protectRoute, isInstructorOrAdmin);
router.get("/video/:filename", streamVideo)
router.post("/:id/enroll", isInstructorOrAdmin, enrollUser);
router.get("/paginate",protectRoute, paginationSession);
router.get("/filter", protectRoute, filterSession);
router.patch("/:id",isInstructorOrAdmin, updateAndCancel);


export default router;