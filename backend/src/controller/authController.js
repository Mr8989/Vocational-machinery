import User from "../models/User.js";
import jwt from "jsonwebtoken";

const generateToken = (userId) => {

    return jwt.sign({userId}, process.env.JWT_SECRET, {expiresIn: "15d"});
}

export const  signup = async (req, res) => {
    try {
        const {username, email, password, confirmPassword, school, role} = req.body;

        if(!username || !email || !password || !confirmPassword || !school || !role){
            return res.status(400).json({message: "All fields are required"});
        }
        if(password.length < 6){
            return res.status(400).json({message:"Password should be atleast 6 characters"})
        }
        if(username.length < 3){
            return res.status(400).json({message:"Username should be at least 4 characters"})
        }

        //check if user already exist

        const existingUser = await User.findOne({$or: [{email}, {username}]});

        if(existingUser){
            return res.status(400).json({message: "User already exist"})
        }

        const user = new User({
            email,
            username,
            password,
            school,
            role,
            school
            
        });

        await user.save();

        const token = generateToken(user._id);

        res.status(201).json({
            token,
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            school: user.school,
            createdAt: user.createdAt,
        })

    } catch (error) {
        console.log("Error in signup route ", error);
        res.status(500).json({message:"Internal server error", error: error})
    }
}

export const login = async (req, res) => {
    try {
        const {email, password} = req.body;

        if(!email || !password){
            return res.status(400).json({message: "All fields are required"});
        }

        //check if user exist
        const user = await User.findOne({email});
        if(!user){
            return res.status(401).json({message: "Invalid credentials"})
        }
        //check if password exist
        const isPasswordCorrect = await user.comparePassword(password);
        if(!isPasswordCorrect){
            return res.status(401).json({message:"Incorrect password try again"})
        }
        const token = generateToken(user._id);
        res.status(200).json({
            success: true,
            message:"Login successfully",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt
            }
        })
    } catch (error) {
        console.log("Error in login route", error);
        res.status(500).json({message:"Please check your network", error});
    }
}

export const protect = async( req, res) => {
    res.status(200).json({
        success: true,
        user: {
        id:req.user._id,
        username: req.user.username,
        email:req.user.email,
        role:req.user.role,
        createdAt: req.user.createdAt
        }
    })
}