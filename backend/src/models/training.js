import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
    title: String,
    description: String,
    filePath: String,
    duration: Number,
    uploadedAt: { type: Date, default: Date.now },
});

const trainingSchema = new mongoose.Schema({
    title: { type: String, required: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    category: {
        type: String,
        enum: ["backhoe", "excavator", "forklift", "longtruck", "crain"], // ✅ consistent
        default: "backhoe"
    },
    videos: [videoSchema]  
}, { timestamps: true });

const Training = mongoose.model("Training", trainingSchema);

export default Training;
