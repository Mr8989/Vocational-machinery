import React from "react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Loader, Play, PlusCircle, Upload, X } from "lucide-react";
import { useVideoStore } from "../stores/useVideoStore";

const categories = ["backhoe", "forklift", "excavator", "longtruck", "crain"];

function CreateBackhoe() {

const {createBackhoeVideo, loading} = useVideoStore()

const [errors, setErrors] = useState({});

  const [newVideo, setNewVideo] = useState({
    title: "",
    //instructor: "",
    description: "",
    video: null,
    videoPreview:"",
    category:"backhoe",
    startTime: new Date().toISOString().slice(0, 16), //now
    endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16) //1hr later
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createBackhoeVideo(newVideo);
      setNewVideo({title:"", instructor:"", description:"", video:""})  
    } catch (error) {
      console.log("Error creating a video in backhoe", error)
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if(file){
      //validate file type
      if(!file.type.startsWith("video/")){
        setErrors({...errors, video: "Please select a valid video file"});
        return;
      }
      // const maxSize = 1024 * 1024 * 1024//1GB
      // if(file.size > maxSize){
      //   setErrors({...errors, video: "file size must be less than 50MB"})
      //   return;
      // }
      const reader = new FileReader();
      reader.onload = () => {
        setNewVideo({
          ...newVideo,video:file,
          videoPreview:reader.result
        })
        //clear video error
        if(errors.video){
          setErrors({...errors, video: ""})
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const removeVideo = () => {
    setNewVideo({
      ...newVideo,
      video:null,
      videoPreview:""
    });

    // reset file input
    const fileInput = document.getElementById("video");
    if(fileInput) fileInput.value ="";
  }

  const formatFileSize = (bytes) => {
    if(bytes === 0)return '0 Bytes';
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + '' + sizes[i];
  }
  
  return (
    <div>
      <motion.div
        className="bg-gray-800 shadow-lg rounded-lg p-8 mb-8 max-w-xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-3xl font-bold mb-6 text-emerald-400">
          Create a new Video
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-300"
            >
              {/**Title input */}
              Video Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={newVideo.title || ""}
              onChange={(e) =>
                setNewVideo({ ...newVideo, title: e.target.value })
              }
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2
            text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Enter video title "
              required
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-400">{errors.title}</p>
            )}
          </div>
          {/**Instructor Input */}
             {/* <div>
            <label
              htmlFor="instructor"
              className="block text-sm font-medium text-gray-300"
            >
              Instructor name
            </label>
            <input
              type="text"
              id="instructor"
              name="instructor"
              value={newVideo.instructor}
              onChange={(e) =>
                setNewVideo({ ...newVideo, instructor: e.target.value })
              }
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2
            text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Enter instructor's name"
              required
            />
            {errors.instructor && (
              <p className="mt-1 text-sm text-red-400">{errors.instructor}</p>
            )}
          </div>    */}
          {/**Description */}
          <div>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={newVideo.description || ""}
              onChange={(e) =>
                setNewVideo({ ...newVideo, description: e.target.value })
              }
              rows="3"
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2
            text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Describe your video content"
              required
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-400">{errors.description}</p>
            )}
          </div>
          {/**Categories */}
          {/* Category Select */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-300"
            >
              Select Category
            </label>
            <select
              id="category"
              value={newVideo.category || "baackhoe"}
              onChange={(e) =>
                setNewVideo({ ...newVideo, category: e.target.value })
              }
              className="block w-full px-3 py-2 pl-3 bg-gray-700 rounded-md shadow-sm
              placeholder-gray-400 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
            >
              {categories.map((category) => (
                <option key={category} value={category.toLowerCase().replace(" ","")}>
                  {category}
                </option>
              ))}
            </select>
          </div>
              {/**Start time */}
              <label htmlFor="start-time">Start Time</label>
          <div className="block w-full px-3 py-2 pl-3 bg-gray-700 rounded-md shadow-sm
          placeholder-gray-400 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm">
              <input
              type="datetime-local"
              value={newVideo.startTime}
              onChange={(e) => setNewVideo({...newVideo, startTime: e.target.value})}
              />
          </div>
              {/**End time */}
              <label htmlFor="end-time">End Time</label>
          <div className="block w-full px-3 py-2 pl-3 bg-gray-700 rounded-md shadow-sm
          placeholder-gray-400 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm">
              <input 
              type="datetime-local" 
              value={newVideo.endTime}
              onChange={(e) => setNewVideo({...newVideo, endTime: e.target.value})}
              />
          </div>

          {/* Video Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Video File *
            </label>

            {!newVideo.video ? (
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-emerald-500 transition-colors">
                <input
                  type="file"
                  id="video"
                  onChange={handleVideoChange}
                  className="sr-only"
                  accept="video/*"
                />
                <label
                  htmlFor="video"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <Upload className="h-12 w-12 text-gray-400" />
                  <div className="text-gray-300">
                    <span className="font-medium text-emerald-400">
                      Click to upload
                    </span>{" "}
                    or drag and drop
                  </div>
                  <p className="text-sm text-gray-500">
                    MP4, WebM, AVI up to 10MB
                  </p>
                </label>
              </div>
            ) : (
              <div className="bg-gray-700 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Play className="h-8 w-8 text-emerald-400" />
                    <div>
                      <p className="text-white font-medium ">
                        {newVideo.video.name}
                      </p>
                      <p>{formatFileSize(newVideo.video.size)}</p>
                    </div>
                  </div>
                  {/* ✅ Remove button shown only when a file is uploaded */}
                  <button
                    type="button"
                    onClick={removeVideo}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full flex justify-center items-center py-3 px-6 border border-transparent rounded-lg shadow-sm text-base
    font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2
    focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader
                  className="mr-2 h-5 w-5 animate-spin"
                  aria-hidden="true"
                />
                Creating Video...
              </>
            ) : (
              <>
                <PlusCircle className="mr-2 h-5 w-5" />
                Create Video
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default CreateBackhoe;
