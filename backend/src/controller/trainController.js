import Training from "../models/training.js";
import multer from "multer";
import { gfs } from "../lib/gridFs.js";
import {GridFsStorage} from "multer-gridfs-storage"
import "dotenv/config.js"
//import Video from "../models/training.js"


//import pkg from "cloudinary"


const storage = new GridFsStorage({
    url:process.env.MONGO_URI,
    file:(req, file) => {
        return {
            bucketName: "videos",
            fileName:`${Date.now()}-${file.originalname}}`,
        };
    }
})

export const upload = multer({storage})

export const createSession = async (req, res) =>{
    try {
        console.log("Received request body", req.body);

        const { title, description, category, startTime, endTime} = req.body;

        if (!title ||  !description || !category || !startTime || !endTime) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (!req.file) {
            return res.status(400).json({ message: "Video file is required"});
        }

                //instructor comes from login
             const instructorUsername = req.user?.username || "Unknown";

             if(req.user.role !== "instructor" && req.user.role !== "admin"){
                return res.status(403).json({message: "Only instructors or admin can create session"})
             }

        // Construct video object
        const video = {
            title,
            description,
            gridfsId: null, // not used when storing in uploads folder
            duration: 120,
            uploadedAt: new Date(),
            thumbnail: null,
            filePath: `uploads/${req.file.filename}`
        };

        // Add file path if uploaded
        if (req.file) {
            video.filePath = `/uploads/${req.file.filename}`;
        }

        // Save metadata in Training collection
        const newSession = await Training.create({
            title,
            instructor:req.user._id,
            description,
            category,
            startTime, 
            endTime,
            videos: [video],
        
        });

        res.status(201).json({
            success: true, 
            data: newSession,
        });
    } catch (error) {
        console.log("Error in creating session", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
export const getAllVideos = async (req, res) => {
    try {
        const sessions = await Training.find();

        // Flatten out videos from all sessions
        const videos = sessions.flatMap(session =>
            session.videos.map(video => ({
                ...video.toObject(),
                sessionId: session._id.toString(),
                instructor: session.instructor,
                category: session.category,
            }))
        );

        res.status(200).json({
            success: true,
            data: videos,
        });
    } catch (error) {
        console.error("Error fetching videos:", error);
        res.status(500).json({ message: "Error fetching videos", error });
    }
};


// ✅ Stream video back
export const streamVideo = async (req, res) => {
    try {
        const file = await gfs.files.findOne({ filename: req.params.filename });
        if (!file) {
            return res.status(404).json({ message: "Video not found" });
        }

        const readstream = gfs.createReadStream(file.filename);
        res.set("Content-Type", file.contentType);
        readstream.pipe(res);
    } catch (error) {
        console.log("Error streaming video", error);
        res.status(500).json({ message: "Error streaming video" });
    }
};



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