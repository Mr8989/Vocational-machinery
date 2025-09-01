//import { set } from "mongoose";
import React from "react";
import { create } from "zustand";


//New Zustand store for managing overall payment

export const usePaymentStore = create((set) => ({
    isPaid: false, // Tracks if payment has been successfully made
    paymentLoading: false,
    paymentError: null,
    lastTransaction: null, // Stores details of the last payment attempt (ref, status, amount)

    setPaid: (paidStatus) => set({ isPaid: paidStatus }),
    setPaymentLoading: (loadingStatus) => set({ paymentLoading: loadingStatus }),
    setPaymentError: (error) => set({ paymentError: error }),
    setLastTransaction: (transactionDetails) => set({ lastTransaction: transactionDetails }),
}));