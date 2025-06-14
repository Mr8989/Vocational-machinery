import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useVideoStore } from "../stores/useVideoStore";
import CreateBackhoe from "./CreateBackhoe";

function Training() {
  const { videos, fetchVideos } = useVideoStore();

  useEffect(() => {
    //fetch videos and fetchVideos directly drom the store
    fetchVideos();
  }, [fetchVideos]); // Depend on fetchVideos to avoid re-running unecessorily
  return (
    <div className="min-h-screen bg-gray-950 text-white p-8 flex flex-col items-center">
      <motion.h1
        className="text-5xl font-extrabold text-center mb-12 text-emerald-300"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Welcome to the Training Session Dashboard
      </motion.h1>
      <h2 className="text-3xl font-bold mb-6 text-emerald-400">
        Current Sesssion Details
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-6xl">
        {/* Left column for general session info */}
        <motion.div
          className="bg-gray-800 shadow-xl rounded-lg p-8"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold mb-6 text-emerald-400">
            Current Session Details
          </h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            This section provides an overview of the ongoing training session.
            You can monitor progress, review scheduled modules, and manage
            participant access.
          </p>
          <ul className="space-y-3 text-gray-400">
            <li>
              <span className="font-semibold text-emerald-300">
                Session Name:
              </span>{" "}
              Heavy Equipment Operator Training
            </li>
            <li>
              <span className="font-semibold text-emerald-300">Module:</span>{" "}
              Video Upload & Management
            </li>
            <li>
              <span className="font-semibold text-emerald-300">Status:</span>{" "}
              Active
            </li>
            <li>
              <span className="font-semibold text-emerald-300">
                Participants:
              </span>{" "}
              45/50
            </li>
          </ul>
          <button
            className="mt-8 w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 px-4 rounded-lg
                             shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            View All Sessions
          </button>
        </motion.div>

        {/* Right column for CreateBackhoe component */}
        
      </div>
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
          {videos.length === 0 ? ( // Display based on videos from the store
            <p className="text-center">
              No recent video uploads to display yet. Upload a video using the
              form above!
            </p>
          ) : (
            <ul className="space-y-4">
              {videos.map(
                (
                  video // Map over videos from the store
                ) => (
                  <motion.li
                    key={video._id || video.id || video.title} // Use a robust key (backend _id, or generated id, or title)
                    className="bg-gray-700 p-4 rounded-md shadow-sm flex items-center space-x-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Play className="h-6 w-6 text-emerald-400" />
                    <div>
                      <p className="font-medium text-white">{video.title}</p>
                      <p className="text-sm text-gray-300">
                        Instructor: {video.instructor} | Category:{" "}
                        {video.category}
                      </p>
                      {/* Assuming video.video contains size info if returned by backend, or adjust as needed */}
                      {video.video &&
                      typeof video.video === "object" &&
                      video.video.size ? (
                        <p className="text-xs text-gray-400">
                          File Size:{" "}
                          {(video.video.size / (1024 * 1024)).toFixed(2) +
                            " MB"}
                        </p>
                      ) : video.videoSize ? (
                        <p className="text-xs text-gray-400">
                          File Size:{" "}
                          {(video.videoSize / (1024 * 1024)).toFixed(2) + " MB"}
                        </p>
                      ) : null}
                    </div>
                  </motion.li>
                )
              )}
            </ul>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default Training;
