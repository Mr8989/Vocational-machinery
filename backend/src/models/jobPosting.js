import mongoose from "mongoose";

const jobPosting = new mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    company:{
        type: mongoose.Types.ObjectId,
        ref: "company",
        required: true
    },
    description: {
        type: String,
        required: true,
    },
    requirements :{
        type: String,
    },
    skillsRequired: {
        type: String
    },
    location: {
        type: String
    },
    deadline: {
        type: Date
    },
    trainingRequirement:{
        type: mongoose.Types.ObjectId,
        ref: "Training"
    }
},{timestamps: true})

const JobPosting = mongoose.model("JobPosting", jobPosting);
export default JobPosting;