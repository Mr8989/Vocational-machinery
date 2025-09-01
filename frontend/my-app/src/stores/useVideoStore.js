import { create } from "zustand"


export const useVideoStore = create((set) => ({
    videos: [],
    loading: false,
    token: null,
    setVideos: (videos) => set({ videos }),

    createBackhoeVideo: async (backhoeData) => {
        set({ loading: true })
        try {
            const token = localStorage.getItem("authToken");
            if (!token) {
                throw new Error("No authentication token found");
            }

            // Create FormData for file upload (instead of JSON)
            const formData = new FormData();
            formData.append('title', backhoeData.title);
            formData.append('instructor', backhoeData.instructor);
            formData.append('description', backhoeData.description);
            formData.append('category', backhoeData.category)

            if (backhoeData.video) {
                if (backhoeData.video instanceof File) {
                    // If it's a File object, append directly
                    formData.append('video', backhoeData.video);
                } else if (typeof backhoeData.video === 'string' && backhoeData.video.startsWith('data:')) {
                    // If it's a base64 string, convert to blob
                    const response = await fetch(backhoeData.video);
                    const blob = await response.blob();
                    formData.append('video', blob, 'video.mp4');
                }
            }

            const res = await fetch("http://localhost:5000/api/training/videos", {
                method: "POST",
                headers: {
                    // Remove Content-Type header - let browser set it for FormData
                    "Authorization": `Bearer ${token}`
                },
                body: formData // Send FormData instead of JSON
            });


            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Failed to upload video")
            }
            const newVideo = await res.json();

            set((state) => ({
                videos: [...state.videos, newVideo],//add a new video
                loading: false,
            }));
            return newVideo;
        } catch (error) {
            set({ loading: false })
            console.log("Error creating video", error.message)
        }
    },
    fetchVideos: async () => {
        set({ loading: true, error: null });
        try {
            const token = localStorage.getItem("authToken"); // Assuming token is needed to fetch
            const response = await fetch("http://localhost:5000/api/training/videos", { // Endpoint to fetch ALL videos
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to fetch videos");
            }
            const data = await response.json();
            set({ videos: data.data, loading: false }); // Assuming backend sends { success: true, data: [...] }
        } catch (error) {
            set({ error: error.message, loading: false });
            console.error("Error fetching videos:", error);
        }
    },
}))