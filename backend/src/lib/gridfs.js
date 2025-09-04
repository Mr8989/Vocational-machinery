
import mongoose from "mongoose";
import Grid from "gridfs-stream";

let gfs;

mongoose.connection.once("open", () => {
    gfs = Grid(mongoose.connection.db, mongoose.mongo);
    gfs.collection("videos"); // creates videos.files + videos.chunks
    console.log("✅ GridFS initialized on main DB connection");
});

export { gfs };
