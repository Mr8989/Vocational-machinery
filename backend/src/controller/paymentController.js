// paymentController.js
import Payment from "../models/payment.js"; // Ensure your Mongoose Payment model is correctly imported
// You might need to install node-fetch if your Node.js version is < 18
// npm install node-fetch@2 --save (for CommonJS environments, or if you prefer this over native fetch)
// const fetch = require('node-fetch'); // Uncomment if you are not using native Node.js fetch (Node 18+)

// KoraPay API Base URL
const KORAPAY_API_BASE_URL = "https://api.korapay.com/merchant/api/v1";

export const initializePayment = async (req, res) => {
    // Access Payment model and KORAPAY_SECRET_KEY from req.app.get
    const Payment = req.app.get('Payment');
    const SECRET_KEY = req.app.get('KORAPAY_SECRET_KEY'); // Changed to KORAPAY_SECRET_KEY

    // Diagnostic log: Check the value of SECRET_KEY right after retrieval
    //console.log('paymentController.js: SECRET_KEY retrieved:', SECRET_KEY ? '*****' + SECRET_KEY.substring(SECRET_KEY.length - 5) : 'undefined');


    console.log('paymentController.js: initializePayment executed. Request to /api/payment/initialize received.');
   // console.log('paymentController.js: Request body:', req.body);

    // KoraPay Mobile Money requires email, amount, reference, mobileNumber, and mobileNetwork
    const { email, amount, reference, selectedCourse, mobileNumber, mobileNetwork } = req.body;

    // Input validation for KoraPay Mobile Money
    if (!email || !reference || !amount || !mobileNumber || !mobileNetwork) {
        return res.status(400).json({ success: false, message: "Email, amount, reference, mobile number, and mobile network are all required." });
    }

    // Check if KoraPay secret key is configured
    if (!SECRET_KEY) {
        console.error('paymentController.js: SERVER ERROR: KoraPay secret key is not set in app.locals.');
        return res.status(500).json({ success: false, message: "Server configuration error: KoraPay secret key missing." });
    }

    // KoraPay expects amount in minor units (pesewas/cents) for GHS.
    const amountInMinorUnits = parseFloat(amount); // Amount is already in minor units from frontend

    try {
        // 1. Save initial transaction details to MongoDB
        // Store mobile money details in metadata for full record
        const newTransaction = new Payment({
            email,
            amount: amountInMinorUnits, // Save amount in minor units
            reference,
            metadata: {
                ...req.body.metadata, // Preserve any existing metadata
                selectedCourse,
                mobileNumber,
                mobileNetwork
            },
            status: "pending",
        });
        await newTransaction.save();
        console.log("paymentController.js: Initial transaction saved to DB:", newTransaction);

        // 2. Initiate mobile money charge with KoraPay API
        const korapayInitRes = await fetch(`${KORAPAY_API_BASE_URL}/charges/mobile-money`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${SECRET_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                reference: reference,
                amount: amountInMinorUnits,
                currency: "GHS", // Ghana Cedi
                customer: {
                    email: email,
                    // name: "Customer Name" // Optional, if you collect full name in frontend
                },
                mobile_money: {
                    number: mobileNumber,
                    network: mobileNetwork,
                },
                description: `Payment for ${selectedCourse}`,
                // callback_url: "YOUR_WEBHOOK_URL_HERE", // IMPORTANT: Add your webhook URL for real-time updates
                metadata: {
                    selectedCourse,
                    email,
                    mobileNumber,
                    mobileNetwork,
                }
            }),
        });

        const data = await korapayInitRes.json();
        console.log('paymentController.js: KoraPay Initiation Response:', data);

        // Check if KoraPay initialization was NOT successful (status code is not 2xx from KoraPay)
        // Or if KoraPay's internal 'status' is not 'success' or 'processing'
        if (!korapayInitRes.ok || (data.status !== 'success' && data.status !== 'processing')) {
            console.error('paymentController.js: KoraPay Initialization Error:', data.message || 'Unknown KoraPay error');
            await Payment.findOneAndUpdate(
                { reference: reference },
                { $set: { status: "failed_korapay_init", korapayData: data, updatedAt: Date.now() } }, // Store full error data
                { new: true }
            );
            return res.status(korapayInitRes.status || 500).json({ // Return KoraPay's status code or 500
                success: false,
                message: data.message || "Failed to initialize transaction with KoraPay."
            });
        }

        // If KoraPay initialization was successful or processing
        // 3. Update transaction in DB with KoraPay's response
        await Payment.findOneAndUpdate(
            { reference: reference },
            { $set: { korapayData: data.data, status: data.status, updatedAt: Date.now() } }, // Store KoraPay's 'data' field and status
            { new: true }
        );
        console.log("paymentController.js: Transaction updated in DB with KoraPay data and status.");

        // 4. Send KoraPay's response data back to frontend
        // Frontend will use 'status' and 'message' to guide the user (e.g., check phone)
        res.status(200).json({ success: true, status: data.status, message: data.message, data: data.data });

    } catch (error) {
        console.error("paymentController.js: Backend error in payment initialization:", error);

        if (reference) {
            await Payment.findOneAndUpdate(
                { reference: reference },
                { $set: { status: "backend_error", updatedAt: Date.now() } },
                { new: true }
            ).catch(dbError => console.error("paymentController.js: Failed to update DB on backend error during error handling:", dbError));
        }
        res.status(500).json({ success: false, message: "Internal server error during payment initialization." });
    }
};

export const verifyPayment = async (req, res) => {
    // Access Payment model and KORAPAY_SECRET_KEY from req.app.get
    const Payment = req.app.get('Payment');
    const SECRET_KEY = req.app.get('KORAPAY_SECRET_KEY'); // Changed to KORAPAY_SECRET_KEY

    // Diagnostic log: Check the value of SECRET_KEY right after retrieval
    console.log('paymentController.js: SECRET_KEY retrieved:', SECRET_KEY ? '*****' + SECRET_KEY.substring(SECRET_KEY.length - 5) : 'undefined');

    console.log('paymentController.js: verifyPayment executed. Request to /api/payment/verify received.');
    console.log('paymentController.js: Request body:', req.body);

    const { reference } = req.body;

    if (!reference) {
        return res.status(400).json({ success: false, message: "Transaction reference is required for verification." });
    }

    if (!SECRET_KEY) {
        console.error('paymentController.js: SERVER ERROR: KoraPay secret key is not set in app.locals.');
        return res.status(500).json({ success: false, message: "Server configuration error: KoraPay secret key missing." });
    }

    try {
        // Make the API call to KoraPay to verify the transaction
        const korapayVerifyRes = await fetch(`${KORAPAY_API_BASE_URL}/charges/verify/${reference}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${SECRET_KEY}`
            },
        });
        const data = await korapayVerifyRes.json();
        console.log('paymentController.js: KoraPay Verification Response:', data);


        // Check if KoraPay verification was NOT successful (status code is not 2xx from KoraPay)
        // Or if KoraPay's internal 'status' is not 'success'
        if (!korapayVerifyRes.ok || data.status !== 'success' || (data.data && data.data.status !== 'successful')) {
            console.error("paymentController.js: KoraPay verification error:", data.message || 'Unknown KoraPay verification error');
            await Payment.findOneAndUpdate(
                { reference },
                { $set: { status: 'verification_failed_korapay', korapayData: data, updatedAt: Date.now() } }, // Store full error data
                { new: true }
            );
            return res.status(korapayVerifyRes.status || 500).json({
                success: false,
                message: data.message || 'Failed to verify transaction with KoraPay.'
            });
        }

        // If KoraPay verification was successful, process the data
        let transactionStatus = 'success';
        const amountVerified = data.data ? data.data.amount : null; // Amount from KoraPay will be in minor units

        // Retrieve the original transaction from DB to compare amounts
        const originalTransaction = await Payment.findOne({ reference });

        if (!originalTransaction) {
            console.error('paymentController.js: Original transaction not found for verification:', reference);
            return res.status(404).json({ success: false, message: 'Original transaction not found.' });
        }

        // Compare original amount with verified amount (both should be in minor units)
        if (originalTransaction.amount !== amountVerified) {
            console.warn('paymentController.js: Amount mismatch for reference:', reference, 'Expected:', originalTransaction.amount, 'Got:', amountVerified);
            transactionStatus = 'amount_mismatch'; // Custom status for amount discrepancy
        }

        // Update transaction status and full KoraPay response in MongoDB
        await Payment.findOneAndUpdate(
            { reference },
            {
                status: transactionStatus,
                korapayData: data.data, // Store the full verification response from KoraPay
                updatedAt: Date.now(),
            },
            { new: true }
        );

        if (transactionStatus === 'success') {
            res.status(200).json({
                success: true,
                status: 'success',
                amount: amountVerified, // Send amount in minor units to frontend
                message: 'Payment verified successfully.'
            });
        } else {
            res.status(400).json({
                success: false,
                status: transactionStatus,
                message: `Payment not successful or verification failed: ${transactionStatus}`
            });
        }

    } catch (error) {
        console.error('paymentController.js: Backend error during payment verification:', error);
        res.status(500).json({ success: false, message: 'Internal server error during payment verification.' });
    }
};
