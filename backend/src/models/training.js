import mongoose from "mongoose";


const videoSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    gridfsId: { type: mongoose.Schema.Types.ObjectId, required: true }, // store reference to GridFS
    duration: Number,
    thumbnail: String,
    uploadedAt: { type: Date, default: Date.now }
});

const trainingSchema = new mongoose.Schema({
    title: { type: String, required: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    category: {
        type: String,
        enum: ["backhoe", "excavator", "Forklift", "LongTruck", "Crain"],
        default: "backhoe"
    },
    videos: [videoSchema]
},
    { timestamps: true }
);
const Training = mongoose.model("Training", trainingSchema);

export default Training;