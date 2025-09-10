import express from "express";
import multer from "multer";
import path from "path"
import { fileURLToPath } from "url";
import { isInstructorOrAdmin, protectRoute } from "../middleware/auth.middle.js";
import { createSession, enrollUser, paginationSession, filterSession, updateAndCancel, streamVideo, getAllVideos} from "../controller/trainController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//save video files in uploads

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../uploads"))
    },
    filename: (req, file, cb)=> {
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + "_" + Math.round(Math.random() * 1e9) + ext);
    }
});
const upload = multer({storage: storage})

const router = express.Router();

router.post("/videos",protectRoute, upload.single('video'),  createSession);
router.get("/videos",getAllVideos)
router.post("/", protectRoute, isInstructorOrAdmin);
router.get("/video/:filename", streamVideo)
router.post("/:id/enroll", isInstructorOrAdmin, enrollUser);
router.get("/paginate",protectRoute, paginationSession);
router.get("/filter", protectRoute, filterSession);
router.patch("/:id",isInstructorOrAdmin, updateAndCancel);


export default router;