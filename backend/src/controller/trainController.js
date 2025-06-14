import Training from "../models/training.js";
import multer from "multer";

import pkg from "cloudinary"

const storage = multer.memoryStorage();
const upload = multer({storage: storage});

export const createSession = async (req, res) =>{
    try {
        //validate request
        console.log("Received request body before destructiong", req.body)
        
        const {title, instructor, description, category} = req.body;

        const videoFile = req.file
        console.log("Receiving video file", req.file)

        if(!title || !instructor || !description || !category){
          return  res.status(400).json({message : "All fields are required"})
        }
        let cloudinaryResponse = null;

        if(!videoFile){
            return res.status(400).json({message:"video file required"})
            
        }
        const b64 = Buffer.from(videoFile.buffer).toString('base64');
        const dataUri = "data:" + videoFile.mimetype + ";base64," + b64;

        cloudinaryResponse = await pkg.uploader.upload(dataUri,{
            resource_type:"video",
            folder:"newsession",
            chunk_size: 6000000 //6MB chuncks for large videos
        })
       
        const newSession = await Training.create({
            title,
            instructor,
            description,
            category,
            video: cloudinaryResponse?.secure_url? cloudinaryResponse.secure_url : "",
        })
        res.status(201).json({
            success: true,
            data: newSession
        })
    } catch (error) {
        console.log("Error in creating session", error);
        res.status(500).json({success:false, data:"Server error"})
        
    }
}
// Get all upcoming training session
export const incomingSession = async (req, res) => {
    try {
        const upcomingSession = await Training.find({
            status: "upcoming",
            startTime: {$gt: new Date()} //onlly future sessions
        }).sort({startTime: 1}) //Ascending order
        return res.status(200).json({
            success: true,
            count: upcomingSession.length,
            data: upcomingSession
        })
    } catch (error) {
        console.log("Error at incoming session", error)
        res.status(500).json({
            success: false,
            data: "Server error"
        })
    }
}

//enroll user to a session
export const enrollUser = async (req, res) => {
    try {
        const session = await Training.findById(req.params.id);
        if(!session){
            res.status(404).json({
                success: false,
                error: "Session failed"
            })
        }

        // check if user already enrolled
        if(session.participants.includes(req.user._id)){
            return res.status(400).json({
                success: false,
                error: "User already enrolled in this session"
            })
        }
        //check if session is upcoming
        if(session.status !== "upcoming"){
            res.status(400).json({
                success: false,
                error: "Session is already completed or is cancelled"
            })
        }
        // Add user to participant
        session.participants.push(req.user._id);
        await session.save();

        res.status(200).json({
            success: true,
            data: session
        })
    } catch (error) {
        console.log("Error in enrolling in session ", error)
        res.status(500).json({
            success: false,
            error: "Server error"
        })
    }
}

export const paginationSession = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const sessions = await Training.find({status: "upcoming"})
    .skip(skip)
    .limit(limit);

    res.json({
        page,
        limit,
        total: await Training.countDocuments(),
        data: sessions
    })
}

export const filterSession = async (req, res) => {
    const filters = {};
    if(req.query.instructor){
        filters.instructor = req.query.instructor
    }
    if(req.query.fromDate){
        filters.startTime = {$gt: new Date(req.query.fromDate)};
    }

    const sessions = await Training.find(filters);
    res.json(sessions);
}

export const updateAndCancel = async (req, res) => {
    try {

        //Define allowed fields that can be updated
        const allowedUpdates = ["title", "startTime", "endTime", "status"];

        //check if requested updates are allowed
        const requestUpdates = Object.keys(req.body);
        const isValidUpdate = requestUpdates.every(field => allowedUpdates.includes(field));

        if(!isValidUpdate){
            return res.status(400).json({
                success: false,
                error: "Invalid update fields",
                allowedFields: allowedUpdates
            })
        }

        //find and update the session
        const updatedSession = await Training.findByIdAndUpdate(
            req.params.id,
            req.body,
            {new: true, runValidators: true}
        )

        if(!updatedSession){
            return res.status(404).json({
                error:"Session not found",
                success: false
            })    
        }

        // Return success response
        res.status(200).json({
            success: true,
            data: updatedSession
        })
    } catch (error) {
        // Handle validation error 
        if(error.name === "validationError"){
            return res.status(400).json({
                success: false,
                error: "Validation failed",
                details: error.message
            })
        }
        else {
            res.status(500).json({
                success: false,
                error: "Server error while updating"
            })
        }
    }
}