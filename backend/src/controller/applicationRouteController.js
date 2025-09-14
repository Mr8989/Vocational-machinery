import JobApplication from "../models/jobApplication.js";
import JobPosting from "../models/jobPosting.js";
import Training from "../models/training.js";
// The following imports are typically used for setting up routes or middleware,
// and are not directly consumed within these controller functions.
// import { v4 as uuid } = "uuid";
// import multer from "multer"; // Implies multer middleware handles file upload before these functions
// import upload from "cloudinary"; // Implies cloudinary integration handles file storage before these functions



/**
 * @function submitApplication
 * @description Submits a new job application.
 * @param {Object} req - The request object, expecting:
 * - req.body.jobPostingId: ID of the job posting.
 * - req.body.coverLetter: The cover letter text.
 * - req.body.skills: A JSON string representing an array of skills.
 * - req.file.path: The URL/path to the uploaded resume (provided by multer middleware).
 * - req.user._id: The authenticated applicant's ID (provided by authentication middleware).
 * @param {Object} res - The response object.
 * @returns {Response} 201 Created on success, 400 Bad Request if missing fields,
 * 401 Unauthorized if no authenticated user, 404 Not Found if job posting doesn't exist,
 * or 500 Internal Server Error on unexpected errors.
 */
export const submitApplication = async (req, res) => {
    try {
        const { title, description, requirements, skillsRequired, location, deadline, trainingRequirement } = req.body;

        // Check if trainingRequirement exists (optional)
        let training = null;
        if (trainingRequirement) { 
            training = await Training.findById(trainingRequirement);
            if (!training) {
                return res.status(404).json({ success: false, message: "Training requirement not found" });
            }
        }

        const newPosting = await JobPosting.create({
            title,
            company: req.user._id, // logged-in company/instructor
            description,
            requirements,
            skillsRequired,
            location,
            deadline,
            trainingRequirement: training ? training._id : null,
        });

        res.status(201).json({ success: true, job: newPosting });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @function getApplicants
 * @description Retrieves all job applications for a specific job posting.
 * This is typically used by an employer to view applicants for their job.
 * @param {Object} req - The request object, expecting:
 * - req.params.jobId: The ID of the job posting.
 * @param {Object} res - The response object.
 * @returns {Response} 200 OK with applications, 400 Bad Request if Job ID missing,
 * 404 Not Found if no applications, or 500 Internal Server Error.
 */
export const getApplicants = async (req, res) => {
    try {
        const { jobId } = req.params; // Extract job ID from request parameters

        // 1. Validate if jobId is provided
        if (!jobId) {
            return res.status(400).json({
                message: "Job ID is required to fetch applicants for a job posting.",
            });
        }

        // 2. Find applications associated with the given jobId
        const applications = await JobApplication.find({ jobPosting: jobId })
            .populate("applicant", "name email") // Populate applicant's name and email for employer view
            .populate("jobPosting", "title company"); // Populate job posting title and company name for context

        // 3. Check if any applications were found
        if (!applications || applications.length === 0) {
            return res.status(404).json({
                message: `No applications found for job posting with ID: ${jobId}.`, 
            });
        }

        // 4. Respond with the list of applications
        res.status(200).json({
            message: "Applicants retrieved successfully.",
            count: applications.length,
            applications,
        });

    } catch (error) {
        console.error("Error in getApplicants:", error);
        res.status(500).json({
            message: "An internal server error occurred while fetching applicants.",
            error: error.message,
        });
    }
};

/**
 * @function updateApplicationStatus
 * @description Updates the status of a specific job application.
 * This function is typically used by an employer or administrator.
 * @param {Object} req - The request object, expecting:
 * - req.params.id: The ID of the job application to update.
 * - req.body.status: The new status for the application (e.g., "accepted", "rejected", "interview").
 * @param {Object} res - The response object.
 * @returns {Response} 200 OK with updated application, 400 Bad Request if IDs/status missing,
 * 404 Not Found if application doesn't exist, or 500 Internal Server Error.
 */
export const updateApplicationStatus = async (req, res) => {
    try {
        const { id } = req.params; // Extract application ID from request parameters
        const { status } = req.body; // Extract new status from request body

        // 1. Validate if both application ID and new status are provided
        if (!id || !status) {
            return res.status(400).json({
                message: "Application ID and the new status are required to update an application.",
            });
        }

        // 2. Find the application by ID and update its status
        // `new: true` returns the modified document rather than the original.
        // `runValidators: true` ensures any schema validators on the 'status' field are run.
        const updatedApplication = await JobApplication.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        );

        // 3. Check if the application was found and updated
        if (!updatedApplication) {
            return res.status(404).json({
                message: `Job application with ID: ${id} not found.`,
            });
        }

        // 4. Respond with the successfully updated application
        res.status(200).json({
            message: "Job application status updated successfully.",
            application: updatedApplication,
        });

    } catch (error) {
        // Handle Mongoose validation errors specifically if `runValidators` is true
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: "Validation error: " + error.message,
                error: error.errors,
            });
        }
        console.error("Error in updateApplicationStatus:", error);
        res.status(500).json({
            message: "An internal server error occurred while updating application status.",
            error: error.message,
        });
    }
};

