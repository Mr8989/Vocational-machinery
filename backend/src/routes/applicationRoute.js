import express from "express";
import { underGraduateRoute } from "../middleware/auth.middle.js";
import {submitApplication, getApplicants, myApplication} from "../controller/applicationRouteController.js";


const router = express.Router();


router.post("/", underGraduateRoute, submitApplication);
router.get("/job/jobId", getApplicants);
router.patch("/my-application", myApplication)


export default router;