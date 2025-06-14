import jwt from "jsonwebtoken";
import User from "../models/User.js";
import "dotenv/config.js";


export const protectRoute = async (req, res, next) => {
    try {
        //get token 
        const token = req.header("Authorization").replace("Bearer", "");
        if(!token){
            return res.status(401).json({message: "No authentication token access denied"});
        }
    
        //verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
        //find user
        const user = await User.findById(decoded.userId).select("-password");
        if(!user){
            return res.status(401).json({message: "token is not valid"})
        }
        req.user = user;
        next();
        
    } catch (error) {
        console.log("Error from protectRoute", error)
        res.status(401).json({message: "token is not valid"});
    }

}

export const isInstructorOrAdmin = async (req, res, next)=> {
    // auth.middle.js
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: "Access denied" });
        }

        try {
            console.log("secret for verification (isInstructorOrAdmin)", process.env.JWT_SECRET)
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = {
                id: decoded.userId,
                role: decoded.role  // Ensure your JWT includes this
            };
            next();
        } catch (err) {
            res.status(401).json({ message: "Invalid token" });
            console.log("JWT Verification", err.message)
        }
  };


export const underGraduateRoute = async (req, res, next) => {
    if(req.user.role === "undergraduate"){
        next()
    }
    else{
        res.status(403).json({message: "Unauthorized undergraduate only"});
    }
}