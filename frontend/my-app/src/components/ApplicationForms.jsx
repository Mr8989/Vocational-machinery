import React from 'react'
import {motion} from "framer-motion"

function ApplicationForms() {

  const { createApplication, loading } = useApplicationStore();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    experienceYears: "",
    coverLetter: "",
    cvFile: null, // New state for CV file
  });

  const [errors, setErrors] = useState({});

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
  };

  const handleCvChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type (e.g., PDF, DOCX)
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
        return;
      }

      // Validate file size (e.g., 5MB limit for CVs)
      const maxSize = 5 * 1024 * 1024; // 5 MB
      if (file.size > maxSize) {
        setErrors({
          ...errors,
          cvFile: `File size must be less than ${formatFileSize(maxSize)}.`,
        });
        return;
      }

      setFormData((prevData) => ({
        ...prevData,
        cvFile: file,
      }));
      if (errors.cvFile) {
        setErrors((prevErrors) => ({ ...prevErrors, cvFile: "" }));
      }
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
      cvFile: "CV file is required.",
    })); // Re-add required error
  };

  const validateForm = () => {
    let newErrors = {};
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
    if (formData.experienceYears === "" || formData.experienceYears < 0) {
      // Check for empty string or negative
      newErrors.experienceYears =
        "Years of experience must be a non-negative number.";
    }
    if (!formData.coverLetter.trim()) {
      newErrors.coverLetter = "Cover letter is required.";
    }
    if (!formData.cvFile) {
      // Check if CV file is present
      newErrors.cvFile = "CV file is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      await createApplication(formData);
      // Reset form after successful submission
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        experienceYears: "",
        coverLetter: "",
        cvFile: null,
      });
      setErrors({});
      // Clear the file input visually after successful submission
      const fileInput = document.getElementById("cvFile");
      if (fileInput) fileInput.value = "";
    } catch (error) {
      console.error("Error submitting application:", error.message);
      // You might want to set a general form error here
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + "" + sizes[i];
  };

  return (
    <div>
      <motion.div
        className="bg-gray-800 shadow-lg rounded-lg p-8 max-w-xl w-full mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-3xl font-bold mb-6 text-emerald-400 text-center">
          Apply for Training
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
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

          {/* CV Upload Field (NEW) */}
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
                    <DocumentIcon className="h-8 w-8 text-emerald-400" />{" "}
                    {/* Generic document icon */}
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
///Simple SVG icon for documents
const DocumentIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path fillRule="evenodd" d="M11.828 2.25c-.139 0-.272.01-.403.028A17.292 17.292 0 005.682 1.5a4.75 4.75 0 00-1.926.394 1.75 1.75 0 00-1.026 1.026A4.735 4.735 0 001.5 6.318c0 2.234.252 4.414.747 6.476A17.291 17.291 0 002.25 12.172c0 .139-.01.272-.028.403A17.292 17.292 0 001.5 18.318a4.75 4.75 0 00.394 1.926 1.75 1.75 0 001.026 1.026A4.735 4.735 0 006.318 22.5a17.292 17.292 0 006.476-.747c.131-.027.264-.037.403-.037a17.292 17.292 0 005.682.747 4.75 4.75 0 001.926-.394 1.75 1.75 0 001.026-1.026A4.735 4.735 0 0022.5 17.682a17.292 17.292 0 00-.747-6.476c-.027-.131-.037-.264-.037-.403A17.292 17.292 0 0022.5 5.682a4.75 4.75 0 00-.394-1.926 1.75 1.75 0 00-1.026-1.026A4.735 4.735 0 0017.682 1.5a17.292 17.292 0 00-6.476.747zM10.25 10.25a.75.75 0 011.5 0v3.5a.75.75 0 01-1.5 0v-3.5zm3.75 0a.75.75 0 010 1.5h-3.5a.75.75 0 010-1.5h3.5z" clipRule="evenodd" />
  </svg>
);


export default ApplicationForms
