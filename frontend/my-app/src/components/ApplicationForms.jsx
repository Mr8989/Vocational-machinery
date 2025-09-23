import React, { useState } from "react"; // Import useState
import { motion } from "framer-motion";
import { useApplicationStore } from "../stores/useApplicationStore"; // Adjust path as necessary
// Import icons from lucide-react (or your preferred icon library)
import { Upload, X, Loader, PlusCircle, FileText } from "lucide-react";

function ApplicationForms() {
  // Destructure createApplication and loading from the Zustand store
  const { createApplication, loading } = useApplicationStore();

  const [formData, setFormData] = useState({
    jobPostingId: "", // NEW: Field to link application to a job posting
    fullName: "",
    email: "",
    phone: "",
    experienceYears: "", // Renamed from experienceYears for clarity with type="number"
    skillsInput: "", // NEW: Input for comma-separated skills
    coverLetter: "",
    cvFile: null, // State for CV file
  });

  const [errors, setErrors] = useState({});
  const [submissionSuccess, setSubmissionSuccess] = useState(false); // State for success message

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    // Clear error for the field being changed
    if (errors[name]) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    }
    // Reset success message on any change
    setSubmissionSuccess(false);
  };

  const handleCvChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(file.type)) {
        setErrors({
          ...errors,
          cvFile: "Please select a valid CV file (PDF, DOC, DOCX).",
        });
        setFormData((prevData) => ({ ...prevData, cvFile: null })); // Clear invalid file
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5 MB
      if (file.size > maxSize) {
        setErrors({
          ...errors,
          cvFile: `File size must be less than ${formatFileSize(maxSize)}.`,
        });
        setFormData((prevData) => ({ ...prevData, cvFile: null })); // Clear oversized file
        return;
      }

      setFormData((prevData) => ({
        ...prevData,
        cvFile: file,
      }));
      setErrors((prevErrors) => ({ ...prevErrors, cvFile: "" })); // Clear error if valid
    } else {
      setFormData((prevData) => ({
        ...prevData,
        cvFile: null,
      }));
      setErrors((prevErrors) => ({
        ...prevErrors,
        cvFile: "CV file is required.",
      }));
    }
    setSubmissionSuccess(false); // Reset success message
  };

  const removeCv = () => {
    setFormData((prevData) => ({
      ...prevData,
      cvFile: null,
    }));
    const fileInput = document.getElementById("cvFile");
    if (fileInput) fileInput.value = ""; // Clear the file input visually
    setErrors((prevErrors) => ({
      ...prevErrors,
      cvFile: "CV file is required.", // Re-add required error
    }));
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.jobPostingId.trim()) {
      newErrors.jobPostingId = "Job Posting ID is required.";
    }
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full Name is required.";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email address is invalid.";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    }
    if (
      formData.experienceYears === "" ||
      parseInt(formData.experienceYears) < 0
    ) {
      newErrors.experienceYears =
        "Years of experience must be a non-negative number.";
    }
    if (!formData.skillsInput.trim()) {
      newErrors.skillsInput = "Skills are required.";
    }
    if (!formData.coverLetter.trim()) {
      newErrors.coverLetter = "Cover letter is required.";
    }
    if (!formData.cvFile) {
      newErrors.cvFile = "CV file is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionSuccess(false); // Clear previous success message
    if (!validateForm()) {
      return;
    }

    try {
      // Prepare skills array: combine skillsInput and experienceYears
      const skillsArray = formData.skillsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean); // Split, trim, and remove empty strings

      if (formData.experienceYears !== "") {
        skillsArray.push(`Years of Experience: ${formData.experienceYears}`);
      }

      await createApplication({
        jobPostingId: formData.jobPostingId, // Pass the new jobPostingId
        coverLetter: formData.coverLetter,
        skills: skillsArray, // Pass the constructed skills array
        cvFile: formData.cvFile,
      });

      // Reset form after successful submission
      setFormData({
        jobPostingId: "",
        fullName: "",
        email: "",
        phone: "",
        experienceYears: "",
        skillsInput: "",
        coverLetter: "",
        cvFile: null,
      });
      setErrors({});
      // Clear the file input visually after successful submission
      const fileInput = document.getElementById("cvFile");
      if (fileInput) fileInput.value = "";
      setSubmissionSuccess(true); // Set success message
    } catch (error) {
      console.error("Error submitting application:", error.message);
      // You might want to set a general form error here, e.g., setErrors({ general: error.message });
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center p-20">
      <motion.div
        className="bg-gray-800 shadow-lg rounded-lg p-8 max-w-xl w-full mx-auto border border-emerald-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-3xl font-bold mb-6 text-emerald-400 text-center">
          Apply for Attachment 
        </h2>

        {submissionSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-600 text-white p-3 rounded-md mb-4 text-center"
          >
            Application submitted successfully!
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Posting ID */}
          <div>
            <label
              htmlFor="jobPostingId"
              className="block text-sm font-medium text-gray-300"
            >
              Job Posting ID
            </label>
            <input
              type="text"
              id="jobPostingId"
              name="jobPostingId"
              value={formData.jobPostingId}
              onChange={handleChange}
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3
                text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="e.g., 60d5ec49f8c6b7001c87a5a3"
              required
            />
            {errors.jobPostingId && (
              <p className="mt-1 text-sm text-red-400">{errors.jobPostingId}</p>
            )}
          </div>

          {/* Full Name */}
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-gray-300"
            >
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3
                text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Enter your full name"
              required
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-400">{errors.fullName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3
                text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Enter your email"
              required
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-400">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-300"
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3
                text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Enter your phone number"
              required
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-400">{errors.phone}</p>
            )}
          </div>

          {/* Years of Experience */}
          <div>
            <label
              htmlFor="experienceYears"
              className="block text-sm font-medium text-gray-300"
            >
              Years of Experience (Heavy Equipment)
            </label>
            <input
              type="number"
              id="experienceYears"
              name="experienceYears"
              value={formData.experienceYears}
              onChange={handleChange}
              min="0"
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3
                text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="e.g., 5"
              required
            />
            {errors.experienceYears && (
              <p className="mt-1 text-sm text-red-400">
                {errors.experienceYears}
              </p>
            )}
          </div>

          {/* Skills Input */}
          <div>
            <label
              htmlFor="skillsInput"
              className="block text-sm font-medium text-gray-300"
            >
              Skills (comma-separated)
            </label>
            <input
              type="text"
              id="skillsInput"
              name="skillsInput"
              value={formData.skillsInput}
              onChange={handleChange}
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3
                text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="e.g., Forklift Operation, Excavation, Welding"
              required
            />
            {errors.skillsInput && (
              <p className="mt-1 text-sm text-red-400">{errors.skillsInput}</p>
            )}
          </div>

          {/* Cover Letter */}
          <div>
            <label
              htmlFor="coverLetter"
              className="block text-sm font-medium text-gray-300"
            >
              Cover Letter / Why You Want to Join
            </label>
            <textarea
              id="coverLetter"
              name="coverLetter"
              value={formData.coverLetter}
              onChange={handleChange}
              rows="5"
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3
                text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Tell us about your interest and qualifications..."
              required
            />
            {errors.coverLetter && (
              <p className="mt-1 text-sm text-red-400">{errors.coverLetter}</p>
            )}
          </div>

          {/* CV Upload Field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Upload CV *
            </label>
            {!formData.cvFile ? (
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-emerald-500 transition-colors">
                <input
                  type="file"
                  id="cvFile"
                  onChange={handleCvChange}
                  className="sr-only"
                  accept=".pdf,.doc,.docx" // Accept common CV file types
                />
                <label
                  htmlFor="cvFile"
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
                    PDF, DOC, DOCX up to 5MB
                  </p>
                </label>
              </div>
            ) : (
              <div className="bg-gray-700 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-emerald-400" />{" "}
                    {/* Replaced DocumentIcon with FileText from lucide-react */}
                    <div>
                      <p className="text-white font-medium ">
                        {formData.cvFile.name}
                      </p>
                      <p className="text-sm text-gray-400">
                        {formatFileSize(formData.cvFile.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeCv}
                    className="text-red-400 hover:text-red-300 transition-colors p-2 rounded-full hover:bg-gray-600"
                    title="Remove CV"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
            {errors.cvFile && (
              <p className="mt-1 text-sm text-red-400">{errors.cvFile}</p>
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
                Submitting Application...
              </>
            ) : (
              <>
                <PlusCircle className="mr-2 h-5 w-5" />
                Submit Application
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default ApplicationForms;
