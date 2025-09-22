import jwt from "jsonwebtoken";
import User from "../models/User.js";
import "dotenv/config.js";


export const protectRoute = async (req, res, next) => {
    try {
        //get token 
        const token = req.header("Authorization").replace("Bearer ", "");
        if(!token){
            return res.status(401).json({message: "No authentication token access denied"});
        }
    
        //verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
        //find user
        const user = await User.findById(decoded.id).select("-password");
        if(!user){
            return res.status(401).json({message: "token is not valid"})
        }

        // req.user = {
        //     id: decoded.userId,
        //     username: decoded.username,
        //     role: decoded.role,
        // }
        console.log("Decoded user from token", req.user);
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

    if(!req.user){
        return res.status(401).json({message: "Not authorized, user missing"})
    }
    
    if(req.user.role === "undergraduate"){
        next()
    }
    else{
        res.status(403).json({message: "Unauthorized undergraduate only"});
    }
}


export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET); // Use your secret key

            // Attach user to the request object (excluding password)
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            next(); // Proceed to the next middleware/route handler
        } catch (error) {
            console.error('Token verification failed:', error.message);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

