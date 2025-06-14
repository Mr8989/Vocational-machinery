import { application } from "express";
import mongoose, { model } from "mongoose";
import Training from "./training.js";

const jobApplication = new mongoose.Schema({
    jobPosting: {
        type: mongoose.Types.ObjectId,
        ref: 'JobPosting',
        required: true
    },
    application:{
        type: mongoose.Types.ObjectId,
        ref:"User",
        required: true,
    },
    trainingSession:{
        type: mongoose.Types.ObjectId,
        ref: "Training",
    },
    resumeUrl:{
        type: String,
        required: true
    },
    coverLetter:{
        type: String
    },
    status:{
        type: String,
        enum: ["submitted", "under_review", "accepted", "rejected"],
        default: "submitted"
    },
    skills: [{
        type: String
    }],
    submitted :{
        type: Date,
        default: Date.now()
    }
},{
    timestamps: true
})

const JobApplication = mongoose.model("JobApplication", jobApplication);

export default JobApplication;
