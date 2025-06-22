import React from "react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { usePaymentStore } from "../stores/usePayment";
import { CreditCard, Loader, X } from "lucide-react";

function PaymentGate({ children }) {
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

  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [paystackPopInstance, setPaystackPopInstance] = useState(null);

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

  const [paymentDetails, setPaymentDetails] = useState({
    email: "",
    amount: "", // Initialize as empty, will be set by selectedCourse or user input
    selectedCourse: "",
  });
  const [inputErrors, setInputErrors] = useState({});

  useEffect(() => {
    const storedPaymentStatus = localStorage.getItem("hasPaidForAccess");
    if (storedPaymentStatus === "true") {
      setPaid(true);
      return;
    }

    const scriptId = "paystack-inline-js-gate";
    if (!document.getElementById(scriptId)) {
      setPaymentLoading(true);
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.id = scriptId;
      script.onload = () => {
        // IMPORTANT: Check if window.PaystackPop is available after script loads
        if (window.PaystackPop && typeof window.PaystackPop === "function") {
          setPaystackPopInstance(() => window.PaystackPop); // Store the constructor
          setScriptLoaded(true);
          setPaymentLoading(false);
          console.log(
            "Paystack inline.js script for PaymentGate loaded successfully and PaystackPop is available."
          );
        } else {
          console.error(
            "Paystack inline.js script loaded, but window.PaystackPop not found or not a function."
          );
          setPaymentError(
            "Payment script loaded, but gateway not initialized correctly."
          );
          setPaymentLoading(false);
        }
      };
      script.onerror = (e) => {
        console.error(
          "Failed to load Paystack inline.js script for PaymentGate:",
          e
        );
        setPaymentLoading(false);
        setPaymentError(
          "Failed to load payment script. Please try again later."
        );
      };
      document.body.appendChild(script);
    } else {
      // If script is already in DOM (e.g., component re-renders), re-check availability
      if (window.PaystackPop && typeof window.PaystackPop === "function") {
        setPaystackPopInstance(() => window.PaystackPop);
        setScriptLoaded(true);
      } else {
        console.warn(
          "Paystack inline.js script already in DOM, but window.PaystackPop not found/ready."
        );
        // Optionally, set an error or try reloading the script if this state is unexpected
      }
    }
  }, [setPaid, setPaymentLoading, setPaymentError]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newAmount = paymentDetails.amount;
    let newSelectedCourse = paymentDetails.selectedCourse;

    if (name === "selectedCourse") {
      newSelectedCourse = value;
      // Set amount based on selected course, or clear if no course selected
      newAmount = value ? (coursePrices[value] || "").toString() : "";
    } else {
      // If other input fields change, update them normally
      setPaymentDetails((prev) => ({ ...prev, [name]: value }));
    }

    // Now update all relevant state, including the potentially new amount
    setPaymentDetails((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "selectedCourse" && {
        amount: newAmount,
        selectedCourse: newSelectedCourse,
      }),
    }));

    // Clear error for this input when user types
    if (inputErrors[name]) {
      setInputErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setPaymentError(null); // Clear general payment error on input change
    setLastTransaction(null); // Clear last transaction details on new input
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
    setInputErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePayNow = async () => {
    if (!validateInputs()) {
      return;
    }

    if (!scriptLoaded) {
      setPaymentError(
        "Payment script not loaded or initialized. Please wait or refresh."
      );
      return;
    }

    setPaymentLoading(true);
    setPaymentError(null);
    setLastTransaction(null); // Clear previous transaction details

    const currentReference = `access_payment_${Date.now()}`;
    const amountInKobo = parseFloat(paymentDetails.amount) * 100;

    try {
      // --- CRITICAL CHANGE HERE: Use relative path for frontend fetch ---
      const initializeRes = await fetch("/api/payment/initialize", {
        // Changed URL from absolute to relative
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: paymentDetails.email,
          amount: amountInKobo,
          reference: currentReference,
          metadata: {
            purpose: "course_enrollment",
            course: paymentDetails.selectedCourse,
          },
        }),
      });

      if (!initializeRes.ok) {
        const errorData = await initializeRes.json();
        throw new Error(
          errorData.message || "Failed to initialize payment on backend."
        );
      }

      const { data: paystackResponseData } = await initializeRes.json();
      const access_code = paystackResponseData.access_code;

      if (!access_code) {
        throw new Error("Missing access_code from payment initialization.");
      }

      // Step 2: Complete transaction using Paystack Popup
      const popup = new paystackPop();
      popup.resumeTransaction(access_code, {
        onClose: () => {
          console.log("Paystack popup closed by user.");
          setPaymentLoading(false);
          setPaymentError("Payment cancelled by user.");
          setLastTransaction({
            reference: currentReference,
            status: "cancelled",
            amount: paymentDetails.amount,
            course: paymentDetails.selectedCourse,
          });
        },
        onSuccess: async (transaction) => {
          console.log("Paystack transaction successful:", transaction);
          // Step 3: Verify transaction status from your backend
          try {
            // --- CRITICAL CHANGE HERE: Use relative path for frontend fetch ---
            const verifyRes = await fetch("/api/payment/verify", {
              // Changed URL from absolute to relative
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ reference: transaction.reference }),
            });

            if (!verifyRes.ok) {
              const errorData = await verifyRes.json();
              throw new Error(
                errorData.message || "Failed to verify payment on backend."
              );
            }

            const verificationResult = await verifyRes.json();
            if (
              verificationResult.status === "success" &&
              verificationResult.amount === amountInKobo
            ) {
              setPaid(true);
              localStorage.setItem("hasPaidForAccess", "true");
              setPaymentLoading(false);
              setPaymentError(null);
              setLastTransaction({
                reference: transaction.reference,
                status: "success",
                amount: paymentDetails.amount,
                course: paymentDetails.selectedCourse,
              });
            } else {
              const statusMsg = verificationResult.status || "unknown_status";
              setPaymentError(
                `Payment verification failed or amount mismatch: ${statusMsg}`
              );
              setLastTransaction({
                reference: transaction.reference,
                status: statusMsg,
                amount: paymentDetails.amount,
                course: paymentDetails.selectedCourse,
              });
              setPaymentLoading(false);
            }
          } catch (verifyError) {
            console.error("Error during payment verification:", verifyError);
            setPaymentError(
              `Payment verification failed: ${verifyError.message}`
            );
            setLastTransaction({
              reference: currentReference,
              status: "verification_error",
              amount: paymentDetails.amount,
              course: paymentDetails.selectedCourse,
            });
            setPaymentLoading(false);
          }
        },
      });
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
    <div className="fixed inset-0 bg-gray-950 text-white flex items-center justify-center p-4">
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

        {/* Input fields for email, course, and amount */}
        <div className="space-y-4 mb-6">
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
              {courses.map((course, index) => (
                <option key={index} value={course}>
                  {course} - $
                  {coursePrices[course]
                    ? coursePrices[course].toFixed(2)
                    : "N/A"}
                </option>
              ))}
            </select>
            {inputErrors.selectedCourse && (
              <p className="text-red-400 text-sm mt-1 text-left">
                {inputErrors.selectedCourse}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="amount" className="sr-only">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                $
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
              {paymentError
                ? paymentError
                : !scriptLoaded
                ? "Loading payment gateway..."
                : "Processing payment..."}
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
            <button
              onClick={handlePayNow}
              className="w-full flex justify-center items-center py-3 px-6 border border-transparent rounded-lg shadow-sm text-base
                       font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2
                       focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
              disabled={
                !scriptLoaded ||
                paymentLoading ||
                !paymentDetails.email.trim() ||
                !paymentDetails.amount.trim() ||
                !paymentDetails.selectedCourse
              }
            >
              <CreditCard className="mr-2 h-5 w-5" /> Pay $
              {parseFloat(paymentDetails.amount || "0").toFixed(2)} to Access
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
                <strong>Amount:</strong> $
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