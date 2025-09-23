import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  MapPin,
  Banknote,
  Calendar,
  Mail,
  Building2,
  List,
  FileText,
  Loader,
  PlusCircle,
  Edit,
  Trash2,
  XCircle,
  CheckCircle,
  Search,
  DollarSign
} from "lucide-react"; // Icons from lucide-react
import { useApplicationStore } from "../stores/useApplicationStore"; // Assuming this path is correct

function AdminJobPost() {
  // Destructure actions and state from the Zustand store
  const {
    jobPostings,
    loading,
    error,
    fetchJobPostings,
    createJobPosting,
    updateJobPosting,
    deleteJobPosting,
  } = useApplicationStore();

  // State for the form (for both creating and updating)
  // State for the form (for both creating and updating)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    location: "",
    salaryRange: "",
    applicationDeadline: "",
    companyName: "",
    contactEmail: "",
  });

  // State for form validation errors
  const [errors, setErrors] = useState({});
  // State for submission success message
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  // State to track if we are editing an existing posting (holds the ID of the posting being edited)
  const [editingPostingId, setEditingPostingId] = useState(null);
  // State for search query
  const [searchQuery, setSearchQuery] = useState("");
  // State for confirmation modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [postingToDelete, setPostingToDelete] = useState(null);

  // // --- Effect to fetch job postings on component mount ---
   useEffect(() => {
    fetchJobPostings();
  }, [fetchJobPostings]); // Dependency array ensures it runs once on mount

  // --- Effect to populate form when editingPostingId changes ---
  useEffect(() => {
    if (editingPostingId) {
      const postingToEdit = jobPostings.find((p) => p._id === editingPostingId);
      if (postingToEdit) {
        setFormData({
          title: postingToEdit.title || "",
          description: postingToEdit.description || "",
          requirements: postingToEdit.requirements || "",
          location: postingToEdit.location || "",
          salaryRange: postingToEdit.salaryRange || "",
          // Format date for input type="date"
          applicationDeadline: postingToEdit.applicationDeadline
            ? new Date(postingToEdit.applicationDeadline)
                .toISOString()
                .split("T")[0]
            : "",
          companyName: postingToEdit.companyName || "",
          contactEmail: postingToEdit.contactEmail || "",
        });
        setErrors({}); // Clear errors when starting an edit
        setSubmissionSuccess(false); // Clear success message
      }
    } else {
      // Clear form when not editing
      setFormData({
        title: "",
        description: "",
        requirements: "",
        location: "",
        salaryRange: "",
        applicationDeadline: "",
        companyName: "",
        contactEmail: "",
      });
      setErrors({});
      setSubmissionSuccess(false);
    }
  }, [editingPostingId, jobPostings]); // Re-run if editing ID or jobPostings list changes

  // --- Form field change handler ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    }
    setSubmissionSuccess(false); // Reset success message on any change
  };
  // --- Form validation logic ---
  const validateForm = () => {
    let newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Job Title is required.";
    if (!formData.description.trim())
      newErrors.description = "Job Description is required.";
    if (!formData.requirements.trim())
      newErrors.requirements = "Job Requirements are required.";
    if (!formData.location.trim()) newErrors.location = "Location is required.";
    if (!formData.salaryRange.trim())
      newErrors.salaryRange = "Salary Range is required.";
    if (!formData.applicationDeadline)
      newErrors.applicationDeadline = "Application Deadline is required.";
    else if (new Date(formData.applicationDeadline) < new Date()) {
      newErrors.applicationDeadline = "Deadline cannot be in the past.";
    }
    if (!formData.companyName.trim())
      newErrors.companyName = "Company Name is required.";
    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = "Contact Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      newErrors.contactEmail = "Contact Email address is invalid.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Form submission handler (for both create and update) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionSuccess(false); // Clear previous success message
    if (!validateForm()) {
      return;
    }

    try {
      if (editingPostingId) {
        // If editing, call updateJobPosting
        await updateJobPosting(editingPostingId, formData);
        setEditingPostingId(null); // Exit edit mode
        setSubmissionSuccess("updated");
      } else {
        // If not editing, call createJobPosting
        await createJobPosting(formData);
        setSubmissionSuccess("created");
      }
      // Reset form after successful submission/update
      setFormData({
        title: "",
        description: "",
        requirements: "",
        location: "",
        salaryRange: "",
        applicationDeadline: "",
        companyName: "",
        contactEmail: "",
      });
      setErrors({});
    } catch (err) {
      console.error("Submission error:", err.message);
      // You might want to set a general form error here, e.g., setErrors({ general: err.message });
    }
  };

  // --- Handler for Edit button click ---
  const handleEdit = (postingId) => {
    setEditingPostingId(postingId);
    window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to top to show the form
  };

  // --- Handler for Cancel Edit button click ---
  const handleCancelEdit = () => {
    setEditingPostingId(null);
    setFormData({
      // Reset form to initial empty state
      title: "",
      description: "",
      requirements: "",
      location: "",
      salaryRange: "",
      applicationDeadline: "",
      companyName: "",
      contactEmail: "",
    });
    setErrors({});
    setSubmissionSuccess(false);
  };

  // --- Handler for Delete button click (opens confirmation modal) ---
  const handleDeleteClick = (posting) => {
    setPostingToDelete(posting);
    setShowDeleteConfirm(true);
  };

  // --- Handler for confirming deletion ---
  const confirmDelete = async () => {
    if (postingToDelete) {
      try {
        await deleteJobPosting(postingToDelete._id);
        setSubmissionSuccess("deleted"); // Set success message for deletion
      } catch (err) {
        console.error("Deletion error:", err.message);
      } finally {
        setShowDeleteConfirm(false);
        setPostingToDelete(null);
      }
    }
  };

  // --- Filtered job postings based on search query ---
  // Added a defensive check: (jobPostings || []) ensures jobPostings is always an array
  const filteredJobPostings = (jobPostings || []).filter(
    (posting) =>
      posting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      posting.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      posting.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 text-white p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Form Section (Create/Update) */}
        <motion.div
          className="bg-gray-800 shadow-lg rounded-lg p-8 mb-8 border border-emerald-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl font-bold mb-6 text-emerald-400 text-center">
            {editingPostingId ? "Edit Job Posting" : "Create New Attachment Posting"}
          </h2>

          <AnimatePresence>
            {submissionSuccess === "created" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-green-600 text-white p-3 rounded-md mb-4 flex items-center justify-center"
              >
                <CheckCircle className="h-5 w-5 mr-2" /> Attachment Posting created
                successfully!
              </motion.div>
            )}
            {submissionSuccess === "updated" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-blue-600 text-white p-3 rounded-md mb-4 flex items-center justify-center"
              >
                <CheckCircle className="h-5 w-5 mr-2" /> Job Posting updated
                successfully!
              </motion.div>
            )}
            {error && (
               <motion.div
               initial={{ opacity: 0, y: -10 }}
                 animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className=" text-white p-3 rounded-md mb-4 flex items-center justify-center"
               >
                 <XCircle className="h-5 w-5 mr-2" /> Error: {error}
               </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Job Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-300"
              >
                Job Title
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </div>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-md
                                text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g., Bachhoe"
                  required
                />
              </div>
              {errors.title && (
                <p className="mt-1 text-sm text-red-400">{errors.title}</p>
              )}
            </div>

            {/* Company Name */}
            <div>
              <label
                htmlFor="companyName"
                className="block text-sm font-medium text-gray-300"
              >
                Company Name
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </div>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-md
                                text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g., Chafas Institute."
                  required
                />
              </div>
              {errors.companyName && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.companyName}
                </p>
              )}
            </div>

            {/* Job Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-300"
              >
                Job Description
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 pt-3 flex items-start pointer-events-none">
                  <FileText
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </div>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="6"
                  className="block w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-md
                                text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Provide a detailed description of the job role..."
                  required
                />
              </div>
              {errors.description && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Requirements */}
            <div>
              <label
                htmlFor="requirements"
                className="block text-sm font-medium text-gray-300"
              >
                Requirements (comma-separated or bullet points)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 pt-3 flex items-start pointer-events-none">
                  <List className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <textarea
                  id="requirements"
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  rows="4"
                  className="block w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-md
                                text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g., Bachelor's degree, 3+ years experience, Strong communication skills"
                  required
                />
              </div>
              {errors.requirements && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.requirements}
                </p>
              )}
            </div>

            {/* Location */}
            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-300"
              >
                Location
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </div>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-md
                                text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g., Greater Accra"
                  required
                />
              </div>
              {errors.location && (
                <p className="mt-1 text-sm text-red-400">{errors.location}</p>
              )}
            </div>

            {/* Salary Range */}
            <div>
              <label
                htmlFor="salaryRange"
                className="block text-sm font-medium text-gray-300"
              >
                Salary Range
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Banknote
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </div>
                <input
                  type="text"
                  id="salaryRange"
                  name="salaryRange"
                  value={formData.salaryRange}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-md
                                text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g., GHC5,000 - GHC7,000 / month"
                  required
                />
              </div>
              {errors.salaryRange && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.salaryRange}
                </p>
              )}
            </div>

            {/* Application Deadline */}
            <div>
              <label
                htmlFor="applicationDeadline"
                className="block text-sm font-medium text-gray-300"
              >
                Application Deadline
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </div>
                <input
                  type="date"
                  id="applicationDeadline"
                  name="applicationDeadline"
                  value={formData.applicationDeadline}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-md
                                text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>
              {errors.applicationDeadline && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.applicationDeadline}
                </p>
              )}
            </div>

            {/* Contact Email */}
            <div>
              <label
                htmlFor="contactEmail"
                className="block text-sm font-medium text-gray-300"
              >
                Contact Email for Applicants
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="email"
                  id="contactEmail"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-md
                                text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g., hr@example.com"
                  required
                />
              </div>
              {errors.contactEmail && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.contactEmail}
                </p>
              )}
            </div>

            {/* Submit/Update Button */}
            <div className="flex space-x-4">
              <button
                type="submit"
                className="flex-1 flex justify-center items-center py-3 px-6 border border-transparent rounded-lg shadow-sm text-base
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
                    {editingPostingId
                      ? "Updating Posting..."
                      : "Creating Posting..."}
                  </>
                ) : (
                  <>
                    {editingPostingId ? (
                      <Edit className="mr-2 h-5 w-5" />
                    ) : (
                      <PlusCircle className="mr-2 h-5 w-5" />
                    )}
                    {editingPostingId
                      ? "Update Job Posting"
                      : "Create Job Posting"}
                  </>
                )}
              </button>
              {editingPostingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 flex justify-center items-center py-3 px-6 border border-gray-600 rounded-lg shadow-sm text-base
                                font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2
                                focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                  disabled={loading}
                >
                  <XCircle className="mr-2 h-5 w-5" />
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </motion.div>

        {/* Job Postings List Section */}
        <h2 className="text-3xl font-bold mb-6 text-emerald-400 text-center mt-12">
          Existing Job Postings
        </h2>

        {/* Search Bar */}
        <div className="mb-6 relative">
          <input
            type="text"
            placeholder="Search job postings by title, company, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white
                    focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
        </div>

        <AnimatePresence>
          {submissionSuccess === "deleted" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-600 text-white p-3 rounded-md mb-4 flex items-center justify-center"
            >
              <CheckCircle className="h-5 w-5 mr-2" /> Job Posting deleted
              successfully!
            </motion.div>
          )}
        </AnimatePresence>

        {loading && !jobPostings.length ? (
          <div className="text-center text-gray-400 flex items-center justify-center py-8">
            <Loader className="h-6 w-6 animate-spin mr-2" /> Loading job
            postings...
          </div>
        ) : filteredJobPostings.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            {searchQuery
              ? "No job postings found matching your search."
              : "No job postings available."}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence>
              {filteredJobPostings.map((posting) => (
                <motion.div
                  key={posting._id}
                  layout
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center"
                >
                  <div className="flex-1 mb-4 md:mb-0">
                    <h3 className="text-xl font-semibold text-emerald-300 mb-1">
                      {posting.title}
                    </h3>
                    <p className="text-gray-300 mb-1 flex items-center">
                      <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                      {posting.companyName}
                    </p>
                    <p className="text-gray-400 text-sm flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                      {posting.location}
                    </p>
                    <p className="text-gray-400 text-sm flex items-center">
                      <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
                      {posting.salaryRange}
                    </p>
                    <p className="text-gray-400 text-sm flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      Deadline:{" "}
                      {new Date(
                        posting.applicationDeadline
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleEdit(posting._id)}
                      className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors text-white"
                      title="Edit Job Posting"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(posting)}
                      className="p-2 rounded-full bg-red-600 hover:bg-red-700 transition-colors text-white"
                      title="Delete Job Posting"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-lg p-6 shadow-xl max-w-sm w-full border border-red-700"
            >
              <h3 className="text-xl font-bold text-red-400 mb-4">
                Confirm Deletion
              </h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete the job posting for "
                <span className="font-semibold text-white">
                  {postingToDelete?.title}
                </span>
                " at "
                <span className="font-semibold text-white">
                  {postingToDelete?.companyName}
                </span>
                "? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="py-2 px-4 rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="py-2 px-4 rounded-md bg-red-600 hover:bg-red-700 text-white transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdminJobPost;
