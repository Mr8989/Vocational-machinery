import express from "express"
import { underGraduateRoute } from "../middleware/auth.middle.js";
import {
    submitApplication,
    getApplicants,
    updateApplicationStatus, // Renamed from myApplication
} from "../controller/applicationRouteController.js"; // Assuming this is where your controller functions are


const router = express.Router();


router.post("/", underGraduateRoute, submitApplication);
router.get("/job/jobId", getApplicants);
router.patch("/my-application", updateApplicationStatus)


export default router;