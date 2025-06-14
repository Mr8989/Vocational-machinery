import React from 'react'
import {create} from "zustand"

export const useApplicationStore = create((set, get) => ({
    application: [],
    loading: false,
    error: null,

    createApplication: async (applicationData) => {
        set({loading: true, error: null})
        try {
            // Simulate API call for application submission
            // In a real app, this would be a fetch to your backend API
            console.log("Submitting application:", applicationData);

            // In a real scenario, if you're sending files, you'd typically use FormData
            const formDataToSend = new FormData();
            formDataToSend.append('fullName', applicationData.fullName);
            formDataToSend.append('email', applicationData.email);
            formDataToSend.append('phone', applicationData.phone);
            formDataToSend.append('experienceYears', applicationData.experienceYears);
            formDataToSend.append('coverLetter', applicationData.coverLetter);
            if (applicationData.cvFile) {
                formDataToSend.append('cv', applicationData.cvFile); // Append the actual File object
            }

            // Simulate network request
            return new Promise((resolve) => {
                setTimeout(() => {
                    const newApplication = {
                        id: Date.now(), // Unique ID for key prop
                        ...applicationData,
                        cvFileName: applicationData.cvFile ? applicationData.cvFile.name : null, // Store filename for display
                        submissionDate: new Date().toLocaleDateString(),
                    };
                    set((state) => ({
                        applications: [...state.applications, newApplication],
                        loading: false,
                    }));
                    console.log("Application submitted successfully:", newApplication);
                    resolve(newApplication);
                }, 1500); // Simulate network delay
            });
        } catch (error) {
            set({ loading: false, error: error.message });
            console.error("Error creating application:", error.message);
            throw error;
        }
    },

    fetchApplications: async () => {
        set({ loading: true, error: null });
        try {
            // Simulate fetching applications
            // In a real app, this would be a fetch to your backend API
            return new Promise((resolve) => {
                setTimeout(() => {
                    const mockApplications = [
                        // { id: 1, fullName: "John Doe", email: "john@example.com", phone: "123-456-7890", experienceYears: 2, submissionDate: "2023-01-15", cvFileName: "john_doe_cv.pdf" },
                    ];
                    set({ applications: mockApplications, loading: false });
                    console.log("Applications fetched.");
                    resolve(mockApplications);
                }, 1000); // Simulate network delay
            });
        } catch (error) {
            set({ loading: false, error: error.message });
            console.error("Error fetching applications:", error);
            throw error;
        }


    },
}))

