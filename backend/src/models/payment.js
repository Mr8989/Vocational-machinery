import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    reference:{
        type:String,
        unique:true,
        required: true
    },
    amount:{
        type: Number,
        required: true,
    },
    status:{
        type:String,
        default: "pending"
    },
    paystackData:{
        type:Object
    },
    metadata:{
        type:Object
    },
    courses:{
        type: String,
        enum:["Backhoe", "Folklift", "Excavator", "Crain"],
        default:"Backhoe"
    },
    createdAt:{
       type: Date,
        default: Date.now()
    },
    updatedAt:{
        type:Date,
        default: Date.now()
    },
    
},{timestamps: true});

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;