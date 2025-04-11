// 🔐 Purpose of verifyJWT:
// Jab koi user kisi protected route pe jaata hai (jaise /dashboard, /profile), toh pehle check karna padta hai:

// "Kya ye user valid hai? Kya iske paas sahi token hai?"

// Yeh function wahi kaam karta hai — verify karta hai ki:

// Kya token mila hai?

// Kya token valid hai?

// Kya user database mein exist karta hai?

// Agar sab kuch sahi ho, toh request ko aage next() middleware ya controller pe bhej diya jaata hai.

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";
import process from "process";
import { DB_NAME } from "../constants.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {

  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      throw new ApiError(401, "Unauthorized request")
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    console.log("Decoded Token:", decodedToken)

    
    //     Token se user ka ID nikal ke, database se user ko dhoondh rahe hain.
    // Aur -password -refreshToken ka matlab:

    // User ka password aur refresh token hide kar dena (security ke liye).
    const user = await User.findById(decodedToken?._id.toString()).select("-password -refreshToken")
    console.log("user:", User)

    if (!user) {
      throw new ApiError(401, "Invalid Access Token")
    }

    //     Agar sab kuch sahi hai:

    // User object ko req.user mein attach kar diya jaata hai (taaki baaki controllers/middleware use kar sakein).

    // Aur request ko aage bhej diya jaata hai using next().
    req.user = user
    next()
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access Token")

  }
})

