//import JobApplication from "../models/jobApplication";
import {v4 as uuid} from "uuid";
import JobApplication from "../models/jobApplication.js";
import JobPosting from "../models/jobPosting.js";
import router from "../routes/applicationRoute.js";
import multer from "multer";
import upload from "cloudinary";
import { application } from "express";

export const submitApplication =  async (req, res) => {
    try {
        const {JobPostingId, coverLetter, skills} = req.body;

        // check whether job posting exist 
        const jobPosting = await JobPosting.findById(jobPostingId);

        if(!jobPosting){
           return res.status(404).json({message: "Job posting not found"})
        }

        //create job application
        const application = new JobApplication({
            jobPosting:  JobPostingId,
            application: req.user._id,
            resumeUrl: req.file.path, //url from your storage upload
            coverLetter,
            skills: JSON.parse(skills)
        });

        await application.save();

        res.status(201).json(application)
    } catch (error) {
        res.status(500).json({message: "Error in submit application", error: error.message});
        console.log("Error in submit application ", error);
    }
}

//Get applications for a job posting  employer view
export const getApplicants = async (req, res) =>{
    try {
        const applications = await JobApplication.find({jobPosting: req.params.jobId})
        .populate("applicant", "name email")
        .populate("Training", "title")
    } catch (error) {
        res.status(500).json({error: error.message});
        console.log("Error in get application ", error);
    }
};

// Get user's application (applicant view)
export const myApplication = async (req, res) => {
    try {
        const {status} = req.body;
        const application = await JobApplication.findByIdAndUpdate(
            req.params.id,
            { status},
            {new : true}
        )
        res.json(application)
    } catch (error) {
        res.status(500).json({error: error.message});
        console.log("Error in my application", error)
    }
}
