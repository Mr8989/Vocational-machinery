import React from "react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { usePaymentStore } from "../stores/usePayment";
import { CreditCard, Loader, X } from "lucide-react";

function PaymentGate({ children }) {
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [transactionRef, setTransactionRef] = useState(null);
  const [otp, setOtp] = useState("");
  const {
    isPaid,
    setPaid,
    paymentLoading,
    setPaymentLoading,
    paymentError,
    setPaymentError,
    lastTransaction,
    setLastTransaction,
  } = usePaymentStore();

  // For KoraPay Mobile Money, we don't necessarily load a client-side script
  // We just need to know if the payment flow can proceed via the backend.
  // The 'paystackReady' concept is less relevant here, but we can use it to gate the button.
  const [payServiceReady, setPayServiceReady] = useState(true); // Assuming KoraPay is always ready on backend once the app loads

  // List of courses with their default prices
  const coursePrices = {
    "Backhoe Operation": 500.0,
    "Excavator Operation": 650.0,
    "Forklift Certification": 300.0,
    "Crane Operation & Safety": 700.0,
    "Heavy Equipment Maintenance": 450.0,
  };

  const courses = [
    "", // Default empty option
    ...Object.keys(coursePrices), // Dynamically get course names from keys
  ];

  // Mobile money networks supported in Ghana by KoraPay (based on their docs)
  const mobileNetworks = ["", "MTN", "AirtelTigo", "Vodafone"]; // Added Vodafone as it's common

  const [paymentDetails, setPaymentDetails] = useState({
    email: "",
    amount: "",
    selectedCourse: "",
    mobileNumber: "", // New: for mobile money
    mobileNetwork: "", // New: for mobile money network
  });
  const [inputErrors, setInputErrors] = useState({});

  useEffect(() => {
    const storedPaymentStatus = localStorage.getItem("hasPaidForAccess");
    if (storedPaymentStatus === "true") {
      setPaid(true);
      return;
    }
    // No client-side script loading for KoraPay Mobile Money for this flow.
    // We assume backend is available.
    setPayServiceReady(true);
    setPaymentLoading(false); // Ensure loading is false on initial load
  }, [setPaid, setPaymentLoading]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let updatedDetails = { ...paymentDetails, [name]: value };

    // If course is selected, auto-populate the amount
    if (name === "selectedCourse") {
      updatedDetails.amount = value
        ? coursePrices[value]?.toString() || ""
        : "";
    }

    setPaymentDetails(updatedDetails);
    // Clear error for this input when user types
    if (inputErrors[name]) {
      setInputErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setPaymentError(null);
    setLastTransaction(null);
  };

  const validateInputs = () => {
    let errors = {};

    if (!paymentDetails.email.trim()) {
      errors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(paymentDetails.email)) {
      errors.email = "Invalid email format.";
    }

    if (!paymentDetails.selectedCourse) {
      errors.selectedCourse = "Please select a course.";
    }

    const parsedAmount = parseFloat(paymentDetails.amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      errors.amount = "Amount must be a positive number.";
    }

    // New validations for mobile money
    if (!paymentDetails.mobileNumber.trim()) {
      errors.mobileNumber = "Mobile number is required.";
    } else if (!/^\d{10}$/.test(paymentDetails.mobileNumber.trim())) {
      errors.mobileNumber = "Invalid 10-digit mobile number.";
    }

    if (!paymentDetails.mobileNetwork) {
      errors.mobileNetwork = "Please select a mobile network.";
    }

    setInputErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePayNow = async () => {
    if (!validateInputs()) {
      return;
    }

    setPaymentLoading(true);
    setPaymentError(null);
    setLastTransaction(null);

    const currentReference = `access_payment_${Date.now()}`;
    // KoraPay expects amount in minor units (pesewas/cents) for GHS.
    const amountInMinorUnits = parseFloat(paymentDetails.amount) * 100;

    try {
      // Step 1: Initiate payment on backend (KoraPay API call)
      const initializeRes = await fetch("/api/payment/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: paymentDetails.email,
          amount: amountInMinorUnits,
          reference: currentReference,
          selectedCourse: paymentDetails.selectedCourse,
          mobileNumber: paymentDetails.mobileNumber.trim(),
          mobileNetwork: paymentDetails.mobileNetwork,
        }),
      });



      if (!initializeRes.ok) {
        const errorData = await initializeRes.json();
        throw new Error(
          errorData.message || "Failed to initialize payment on backend."
        );
      }

      const backendResponse = await initializeRes.json();
      console.log("Backend payment initiation response:", backendResponse);

      if(backendResponse.message === "Authorization required"){
        setTransactionRef(backendResponse.data.lastTransaction)
        setShowOtpInput(true) // show otp input UI
        setPaymentLoading(false)
      }

      // KoraPay's response structure for mobile money might include a status and auth_model
      // If it's a direct success, great. If it's pending (STK push, OTP), your backend should handle it
      // and send appropriate instructions back to the frontend.
      if (
        backendResponse.status === "success" &&
        backendResponse.data.status === "successful"
      ) {
        // Direct success from KoraPay through your backend
        setPaid(true);
        localStorage.setItem("hasPaidForAccess", "true");
        setPaymentLoading(false);
        setPaymentError(null);
        setLastTransaction({
          reference: currentReference,
          status: "success",
          amount: paymentDetails.amount,
          course: paymentDetails.selectedCourse,
        });
      } else if (
        backendResponse.status === "processing" ||
        backendResponse.data?.status === "processing"
      ) {
        // Payment is pending, likely waiting for user approval on phone (STK push)
        setPaymentLoading(false);
        setPaymentError("Please check your phone to approve the payment.");
        setLastTransaction({
          reference: currentReference,
          status: "pending",
          amount: paymentDetails.amount,
          course: paymentDetails.selectedCourse,
        });
        // In a real app, you might start polling your backend for transaction status here
        // or rely on a webhook from KoraPay to your backend.
      } else {
        // Generic failure
        setPaymentError(
          backendResponse.message || "Payment initiation failed."
        );
        setLastTransaction({
          reference: currentReference,
          status: "failed",
          amount: paymentDetails.amount,
          course: paymentDetails.selectedCourse,
        });
        setPaymentLoading(false);
      }
    } catch (error) {
      console.error("Payment initiation error:", error);
      setPaymentError(`Failed to initiate payment: ${error.message}`);
      setLastTransaction({
        reference: currentReference,
        status: "initiation_failed",
        amount: paymentDetails.amount,
        course: paymentDetails.selectedCourse,
      });
      setPaymentLoading(false);
    }
  };

  if (isPaid) {
    return children;
  }

  return (
    <div className="fixed inset-0 bg-gray-950 text-white flex items-center justify-center p-4 top-35">
      <motion.div
        className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold mb-6 text-emerald-400">
          Enroll for a Course
        </h2>
        <p className="text-lg text-gray-300 mb-4">
          Select your desired course and complete payment to gain access.
        </p>

        <div className="space-y-4 mb-6">
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="sr-only">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={paymentDetails.email}
              onChange={handleInputChange}
              placeholder="Your email address"
              className={`w-full p-3 rounded-md bg-gray-700 border ${
                inputErrors.email ? "border-red-500" : "border-gray-600"
              } text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500`}
              disabled={paymentLoading}
            />
            {inputErrors.email && (
              <p className="text-red-400 text-sm mt-1 text-left">
                {inputErrors.email}
              </p>
            )}
          </div>

          {/* Course Selection */}
          <div>
            <label htmlFor="selectedCourse" className="sr-only">
              Select Course
            </label>
            <select
              id="selectedCourse"
              name="selectedCourse"
              value={paymentDetails.selectedCourse}
              onChange={handleInputChange}
              className={`w-full p-3 rounded-md bg-gray-700 border ${
                inputErrors.selectedCourse
                  ? "border-red-500"
                  : "border-gray-600"
              } text-white focus:outline-none focus:ring-2 focus:ring-emerald-500`}
              disabled={paymentLoading}
            >
              <option value="">-- Select a Course --</option>
              {courses.map((course) => (
                <option key={course} value={course}>
                  {course} - GHC
                  {coursePrices[course]
                    ? coursePrices[course].toFixed(2)
                    : "N/A"}{" "}
                  {/* FIX: Safely access toFixed */}
                </option>
              ))}
            </select>
            {inputErrors.selectedCourse && (
              <p className="text-red-400 text-sm mt-1 text-left">
                {inputErrors.selectedCourse}
              </p>
            )}
          </div>

          {/* Mobile Money Number Input */}
          <div>
            <label htmlFor="mobileNumber" className="sr-only">
              Mobile Money Number
            </label>
            <input
              type="text"
              id="mobileNumber"
              name="mobileNumber"
              value={paymentDetails.mobileNumber}
              onChange={handleInputChange}
              placeholder="Mobile Money Number (e.g., 0541234567)"
              className={`w-full p-3 rounded-md bg-gray-700 border ${
                inputErrors.mobileNumber ? "border-red-500" : "border-gray-600"
              } text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500`}
              disabled={paymentLoading}
            />
            {inputErrors.mobileNumber && (
              <p className="text-red-400 text-sm mt-1 text-left">
                {inputErrors.mobileNumber}
              </p>
            )}
          </div>

          {/* Mobile Money Network Selection */}
          <div>
            <label htmlFor="mobileNetwork" className="sr-only">
              Mobile Money Network
            </label>
            <select
              id="mobileNetwork"
              name="mobileNetwork"
              value={paymentDetails.mobileNetwork}
              onChange={handleInputChange}
              className={`w-full p-3 rounded-md bg-gray-700 border ${
                inputErrors.mobileNetwork ? "border-red-500" : "border-gray-600"
              } text-white focus:outline-none focus:ring-2 focus:ring-emerald-500`}
              disabled={paymentLoading}
            >
              <option value="">-- Select Mobile Network --</option>
              {mobileNetworks.map((network) => (
                <option key={network} value={network}>
                  {network}
                </option>
              ))}
            </select>
            {inputErrors.mobileNetwork && (
              <p className="text-red-400 text-sm mt-1 text-left">
                {inputErrors.mobileNetwork}
              </p>
            )}
          </div>

          {/* Amount Input (populated automatically but still displayed) */}
          <div>
            <label htmlFor="amount" className="sr-only">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400">
              GHC
              </span>
              <input
                type="number"
                id="amount"
                name="amount"
                value={paymentDetails.amount}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                min="0.01"
                className={`w-full pl-8 p-3 rounded-md bg-gray-700 border ${
                  inputErrors.amount ? "border-red-500" : "border-gray-600"
                } text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                disabled={paymentLoading}
              />
            </div>
            {inputErrors.amount && (
              <p className="text-red-400 text-sm mt-1 text-left">
                {inputErrors.amount}
              </p>
            )}
          </div>
        </div>

        {paymentLoading ? (
          <div className="flex flex-col items-center justify-center">
            <Loader className="h-16 w-16 text-emerald-400 animate-spin mb-4" />
            <p className="text-white text-lg font-semibold">
              Processing payment... (Please check your phone if prompted)
            </p>
          </div>
        ) : (
          <>
            {paymentError && (
              <div className="text-red-400 mb-4 flex items-center justify-center space-x-2">
                <X className="h-6 w-6" />
                <span>{paymentError}</span>
              </div>
            )}

            {/* Debug info - remove in production */}
            {process.env.NODE_ENV === "development" && (
              <div className="mb-4 p-2 bg-gray-700 rounded text-xs text-gray-300">
                <p>Debug Info:</p>
                <p>Payment Service Ready: {payServiceReady ? "✅" : "❌"}</p>
                <p>Email Valid: {paymentDetails.email.trim() ? "✅" : "❌"}</p>
                <p>
                  Amount Valid: {paymentDetails.amount.trim() ? "✅" : "❌"}
                </p>
                <p>
                  Course Selected: {paymentDetails.selectedCourse ? "✅" : "❌"}
                </p>
                <p>
                  Mobile Number:{" "}
                  {paymentDetails.mobileNumber.trim() ? "✅" : "❌"}
                </p>
                <p>
                  Mobile Network: {paymentDetails.mobileNetwork ? "✅" : "❌"}
                </p>
              </div>
            )}

            <button
              onClick={handlePayNow}
              className={`w-full flex justify-center items-center py-3 px-6 border border-transparent rounded-lg shadow-sm text-base
                       font-medium text-white transition-colors ${
                         !payServiceReady ||
                         paymentLoading ||
                         !paymentDetails.email.trim() ||
                         !paymentDetails.amount.trim() ||
                         !paymentDetails.selectedCourse ||
                         !paymentDetails.mobileNumber.trim() ||
                         !paymentDetails.mobileNetwork
                           ? "bg-gray-600 cursor-not-allowed opacity-50"
                           : "bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                       }`}
              disabled={
                !payServiceReady ||
                paymentLoading ||
                !paymentDetails.email.trim() ||
                !paymentDetails.amount.trim() ||
                !paymentDetails.selectedCourse ||
                !paymentDetails.mobileNumber.trim() ||
                !paymentDetails.mobileNetwork
              }
            >
              <CreditCard className="mr-2 h-5 w-5" />
              {paymentLoading
                ? "Processing Payment..."
                : `Pay ${parseFloat(paymentDetails.amount || "0").toFixed(
                    2
                  )} to Access`}
            </button>
          </>
        )}

        {lastTransaction && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-6 p-4 bg-gray-700 rounded-md text-left text-gray-300 text-sm"
          >
            <p className="font-semibold text-white mb-2">
              Last Payment Attempt Details:
            </p>
            <p>
              <strong>Reference:</strong> {lastTransaction.reference}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span
                className={`font-bold ${
                  lastTransaction.status === "success"
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {lastTransaction.status.toUpperCase().replace(/_/g, " ")}
              </span>
            </p>
            {lastTransaction.amount && (
              <p>
                <strong>Amount:</strong> GHC
                {parseFloat(lastTransaction.amount).toFixed(2)}
              </p>
            )}
            {lastTransaction.course && (
              <p>
                <strong>Course:</strong> {lastTransaction.course}
              </p>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default PaymentGate;
