import mongoose from "mongoose";

const trainingSchema = new mongoose.Schema({
    title: {
        type: String,
        description: true,
        required: true
    },
    instructor:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime:{
        type:Date,
        required: true
    },
    category:{
        type: String,
        enum:["backhoe", "excavator", "Forklift", "LongTruck", "Crain"],
        default: "backhoe"
    },
    videos: [{
        title: {
            type: String,
            required: true
        },
        description:{
            type: String,  
        },
        url:{
            type: String,
            required: true,
        },
        duration:{
            type: Number, // in seconds
        },
        thumbnail:{
            type: String  //url to thumbnail image
        },
        uploadAt:{
            type: Date,
            default: Date.now
        }
    }]
},{timestamps:true});

const Training = mongoose.model("Training", trainingSchema);

export default Training;