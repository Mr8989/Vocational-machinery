import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useVideoStore } from "../stores/useVideoStore";
import { Play } from "lucide-react";

function Training() {
  const { videos, fetchVideos } = useVideoStore();
              console.log("video", videos);
  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-20 flex flex-col items-center">
      <motion.h1
        className="text-5xl font-extrabold text-center mb-12 text-emerald-300"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Welcome to the Training Session Dashboard
      </motion.h1>

      <motion.div
        className="bg-gray-800 shadow-xl rounded-lg p-8 w-full max-w-6xl mt-12"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <h2 className="text-3xl font-bold mb-6 text-emerald-400 text-center">
          Recent Uploads
        </h2>

        <div className="text-gray-400">
          {videos.length === 0 ? (
            <p className="text-center">
              No recent video uploads to display yet. Upload a video using the
              form above!
            </p>
          ) : (
            <ul className="space-y-4">
              {videos.map((video) => (
                <motion.li
                  key={video._id}  
                  className="bg-gray-700 p-4 rounded-md shadow-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center space-x-4">
                    <Play className="h-6 w-6 text-emerald-400" />
                    <div>
                      <p className="font-medium text-white">{video.title}</p>
                      <p className="text-sm text-gray-300">
                        Instructor: {video.instructor?.username || "Betty"} |{" "}
                        Category: {video.category}
                      </p>
                    </div>
                  </div>
                  {/* Video Preview */}
                  {video.filePath && (
                    <video className="mt-4 rounded-lg w-full max-h-64" controls>
                      <source
                        src={`http://localhost:5000${video.filePath.split("/").pop()}`} // backend sends relative path (e.g., uploads/file.mp4)
                        type="video/mp4"
                      />
                      Your browser does not support the video tag.
                    </video>
                  )}
                </motion.li>
              ))}
            </ul>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default Training;
