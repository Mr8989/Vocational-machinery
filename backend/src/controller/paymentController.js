import Payment from "../models/payment.js";
//import "";

export const initializePayment = async (req, res) => {

    const Payment = req.app.get('Payment');
    const SECRET_KEY = req.app.get('PAYSTACK_SECRET_KEY');

    console.log('paymentController.js: initializePayment executed. Request to /api/payment/initialize received.'); // CRITICAL Diagnostic log
    console.log('paymentController.js: Request body:', req.body);


    const { email, amount, reference, metadata } = req.body;

    if (!email || !reference || !amount) {
        return res.status(400).json({ success: false, message: "All fields are required" })
    }

    if (!SECRET_KEY) {
        console.error('paymentController.js: SERVER ERROR: Paystack secret key is not set in app.locals.');
        return res.status(500).json({ success: false, message: "Server configuration error: Paystack secret key missing." });
      }

    //const SECRET_KEY = PAYSTACK_SECRET_KEY
    try {
        const newTransaction = new Payment({
            email,
            amount,
            reference,
            metadata,
            status: "pending",
        })
        await newTransaction.save();
        console.log("Initial transaction saved to DB", newTransaction)

        const paystackInitRes = await fetch("https://api.paystack.co/transaction/initialize", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${SECRET_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                amount,
                reference,
                metadata,
            }),
        });
        const data = await paystackInitRes.json()

        if (!paystackInitRes.ok) {
            console.log('paystack Initialization error', data)
        
        await Payment.findByIdAndUpdate(
            { reference : reference },
            { $set: { status: "failed_paystack_init", paystackData: data.data, updatedAt: Date.now() } },
            { new: true }
        );
        return res.status(200).json({ success: true, data: data.data }) // Send Paystack's data.data which contains access_code
    }
        // 3. Update transaction in DB with Paystack's successful response
        await Payment.findOneAndUpdate(
            { reference: reference },
            { $set: {paystackData: data.data, updatedAt: Date.now() } },
            { new: true }
        );
        console.log("paymentController.js: Transaction updated in DB with Paystack data.");

        // 4. Send Paystack's response data (containing access_code) back to frontend
        res.status(200).json({ success: true, data: data.data });

    } catch (error) {
        console.error("Backend error in payment initialization", error)

        if (reference) {
            await Payment.findOneAndUpdate(
                { reference: reference },
                { $set: { status: "backend_error", updatedAt: Date.now() } },
                { new: true }
            ).catch(dbError => console.error("paymentController.js: Failed to update DB on backend error during error handling:", dbError));
          }

        res.status(500).json({ success: false, message: "Internal server error during payment initialization " })
    }
}

export const verifyPayment = async () => {

    // Access Payment model and SECRET_KEY from the Express app locals.
    const Payment = req.app.get('Payment');
    const SECRET_KEY = req.app.get('PAYSTACK_SECRET_KEY');

    console.log('paymentController.js: verifyPayment executed. Request to /api/payment/verify received.'); // Diagnostic log
    console.log('paymentController.js: Request body:', req.body);


    const { reference } = req.body;

    if (!reference) {
        return res.status(400).json({ success: false, message: "Transaction reference is required for verification" })
    }

    if (!SECRET_KEY) {
        console.error('paymentController.js: SERVER ERROR: Paystack secret key is not set in app.locals.');
        return res.status(500).json({ success: false, message: "Server configuration error: Paystack secret key missing." });
      }

    try {
        const paystackVerifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
            method: 'GET', 
            headers: {
                Authorization: `Bearer ${SECRET_KEY}`
            },
        });
        const data = await paystackVerifyRes.json();

        if (!paystackVerifyRes.ok) {
            console.error("Paystack verification error", data);
            // If Paystack verification fails, update DB
            await Transaction.findOneAndUpdate({ reference }, { status: 'verification_failed', updatedAt: Date.now() });
            return res.status(paystackVerifyRes.status).json({ success: false, message: data.message || 'Failed to verify transaction with Paystack.' });
        }

        let transactionStatus = data.data && data.data.status === 'success' ? 'success' : 'failed';
        const amountVerified = data.data ? data.data.amount : null;

        //IMPORTANT: Always verify the amount on your backend to prevent manipulation
        // Retrieve the original transaction from DB to compare amounts
        const originalTransaction = await Transaction.findOne({ reference });

        if (!originalTransaction) {
            console.error('Original transaction not found for verification:', reference);
            return res.status(404).json({ success: false, message: 'Original transaction not found.' });
        }

        // Compare original amount with verified amount
        if (originalTransaction.amount !== amountVerified) {
            console.warn('Amount mismatch for reference:', reference, 'Expected:', originalTransaction.amount, 'Got:', amountVerified);
            transactionStatus = 'amount_mismatch'; // Custom status for amount discrepancy
        }

        // Update transaction status and full Paystack response in MongoDB
        await Transaction.findOneAndUpdate(
            { reference },
            {
                status: transactionStatus,
                paystackData: data.data, // Store the full verification response
                updatedAt: Date.now(),
            },
            { new: true } // Return the updated document
        );

        if (transactionStatus === 'success') {
            res.status(200).json({
                success: true,
                status: 'success',
                amount: amountVerified,
                message: 'Payment verified successfully.'
            });
        } else {
            res.status(400).json({
                success: false,
                status: transactionStatus, // Send the specific status (failed, amount_mismatch, etc.)
                message: `Payment not successful or verification failed: ${transactionStatus}`
            });
      }
    } catch (error) {
        console.error('Backend error during payment verification:', error);
        res.status(500).json({ success: false, message: 'Internal server error during payment verification.' });
      
    }
}