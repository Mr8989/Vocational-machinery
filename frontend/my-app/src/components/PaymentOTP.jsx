import { useState } from "react";

function PaymentOTP({ transactionReference }) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/payment/authorize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactionReference,
          otp,
        }),
      });

      const data = await res.json();
      console.log("Authorization Response:", data);

      if (data.status) {
        setMessage("✅ Payment successful!");
      } else {
        setMessage("❌ Payment failed: " + data.message);
      }
    } catch (err) {
      setMessage("⚠️ Error: " + err.message);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Enter OTP</label>
      <input
        type="text"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? "Authorizing..." : "Submit OTP"}
      </button>
      {message && <p>{message}</p>}
    </form>
  );
}

export default PaymentOTP;
