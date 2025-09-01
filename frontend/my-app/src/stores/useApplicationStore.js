import { create } from "zustand";

export const useApplicationStore = create((set, get) => ({
    applications: [], // Renamed from 'application' to 'applications' for clarity when storing multiple.
    loading: false,
    error: null,

    /**
     * @async createApplication
     * @description Submits a new job application to the backend.
     * @param {Object} data - The application data.
     * @param {string} data.jobPostingId - The ID of the job posting.
     * @param {string} data.coverLetter - The applicant's cover letter.
     * @param {string[]} data.skills - An array of applicant's skills.
     * @param {File} data.cvFile - The applicant's resume file.
     * @returns {Promise<Object>} The submitted application object from the backend.
     */
    createApplication: async ({ jobPostingId, coverLetter, skills, cvFile }) => {
        set({ loading: true, error: null });
        try {
            // Create FormData to send files and other data
            const formData = new FormData();
            formData.append('jobPostingId', jobPostingId);
            formData.append('coverLetter', coverLetter);
            // Skills need to be stringified to be sent as a single string field in FormData
            // The backend controller expects JSON.parse(skills)
            formData.append('skills', JSON.stringify(skills));
            if (cvFile) {
                formData.append('resume', cvFile); // Assuming your multer middleware expects 'resume' field name
            }

            const response = await fetch("/api/applications", { // Adjust API endpoint as per your Express setup
                method: "POST",
                // When using FormData, Content-Type header is typically not set manually;
                // the browser sets it automatically with the correct boundary.
                body: formData,
            });

            const responseData = await response.json();

            if (!response.ok) {
                // If the response is not OK (e.g., 400, 404, 500), throw an error
                throw new Error(responseData.message || "Failed to submit application.");
            }

            set((state) => ({
                applications: [...state.applications, responseData.application],
                loading: false,
            }));
            console.log("Application submitted successfully:", responseData.application);
            return responseData.application; // Return the created application
        } catch (error) {
            set({ loading: false, error: error.message });
            console.error("Error creating application:", error.message);
            throw error;
        }
    },

    /**
     * @async fetchApplications
     * @description Fetches job applications for a specific job posting from the backend.
     * @param {string} jobId - The ID of the job posting to fetch applications for.
     * @returns {Promise<Object[]>} An array of application objects.
     */
    fetchApplications: async (jobId) => {
        set({ loading: true, error: null });
        try {
            if (!jobId) {
                throw new Error("Job ID is required to fetch applications.");
            }

            const response = await fetch(`/api/applications/job/${jobId}`); // Adjust API endpoint
            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || "Failed to fetch applications.");
            }

            set({ applications: responseData.applications, loading: false });
            console.log("Applications fetched:", responseData.applications);
            return responseData.applications;
        } catch (error) {
            set({ loading: false, error: error.message });
            console.error("Error fetching applications:", error);
            throw error;
        }
    },

    /**
     * @async updateApplicationStatus
     * @description Updates the status of a specific job application on the backend.
     * @param {string} applicationId - The ID of the application to update.
     * @param {string} newStatus - The new status (e.g., "accepted", "rejected").
     * @returns {Promise<Object>} The updated application object from the backend.
     */
    updateApplicationStatus: async (applicationId, newStatus) => {
        set({ loading: true, error: null });
        try {
            if (!applicationId || !newStatus) {
                throw new Error("Application ID and new status are required.");
            }

            const response = await fetch(`/api/applications/${applicationId}`, { // Adjust API endpoint
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: newStatus }),
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || "Failed to update application status.");
            }

            set((state) => ({
                applications: state.applications.map((app) =>
                    app._id === applicationId ? responseData.application : app
                ),
                loading: false,
            }));
            console.log("Application status updated successfully:", responseData.application);
            return responseData.application;
        } catch (error) {
            set({ loading: false, error: error.message });
            console.error("Error updating application status:", error);
            throw error;
        }
    },
}));

