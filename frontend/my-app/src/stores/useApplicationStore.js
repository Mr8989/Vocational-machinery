import { create } from "zustand";

export const useApplicationStore = create((set) => ({
    jobPostings: [],
    loading: false,
    error: null,

    // ✅ Create Job Posting
    createJobPosting: async (formData) => {
        try {
            set({ loading: true });

            // Map frontend fields → backend schema fields
            const payload = {
                title: formData.title,
                description: formData.description,
                requirements: formData.requirements,
                location: formData.location,
                deadline: formData.applicationDeadline, // maps to "deadline" in schema
                company: formData.companyId, // needs companyId (ObjectId)
                skillsRequired: formData.skillsRequired || "",
                salaryRange: formData.salaryRange || "",
                contactEmail: formData.contactEmail || ""
            };

            const res = await fetch("http://localhost:5000/api/application/job", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                     "Content-Type": "application/json" 
                    },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error("Failed to create job posting");
            const newJob = await res.json();

            set((state) => ({
                jobPostings: [...state.jobPostings, newJob],
                loading: false
            }));
        } catch (err) {
            set({ error: err.message, loading: false });
        }
    },
    // 🔹 Fetch all job postings
    fetchJobPostings: async () => {
        try {
            set({ loading: true });
            const res = await fetch("http://localhost:5000/api/application/job",{
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },

            });
            if (!res.ok) throw new Error("Failed to fetch job postings");

            const data = await res.json();
            set({ jobPostings: data, loading: false });
        } catch (err) {
            set({ error: err.message, loading: false });
        }
    },

    // ✅ Update Job Posting
    updateJobPosting: async (id, formData) => {
        try {
            set({ loading: true });

            const payload = {
                title: formData.title,
                description: formData.description,
                requirements: formData.requirements,
                location: formData.location,
                deadline: formData.applicationDeadline,
                company: formData.companyId,
                skillsRequired: formData.skillsRequired || "",
                salaryRange: formData.salaryRange || "",
                contactEmail: formData.contactEmail || ""
            };

            const res = await fetch(`/api/jobs/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Failed to update job posting");
            const updatedJob = await res.json();

            set((state) => ({
                jobPostings: state.jobPostings.map((j) =>
                    j._id === id ? updatedJob : j
                ),
                loading: false
            }));
        } catch (err) {
            set({ error: err.message, loading: false });
        }
    },

    // ✅ Delete Job Posting
    deleteJobPosting: async (id) => {
        try {
            set({ loading: true });

            const res = await fetch(`/api/jobs/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete job posting");

            set((state) => ({
                jobPostings: state.jobPostings.filter((j) => j._id !== id),
                loading: false
            }));
        } catch (err) {
            set({ error: err.message, loading: false });
        }
    }
}));
