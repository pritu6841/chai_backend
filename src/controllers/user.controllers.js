import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.models.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import ApiResponse from '../utils/ApiResponse.js'


const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId)
    const accessToken = user.getAccessToken()
    const refreshToken = user.getRefreshToken()
    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })
    return { accessToken, refreshToken }

  } catch (error) {
    throw new ApiError(500, "Internal server error")
  }
}

const registerUser = asyncHandler(async (req, res) => {
  console.log("registerUser called");
  // 1. Get user details from frontend (req.body)
  const { fullName, email, username, password } = req.body;

  // Debug the request body
  console.log("Request Body:", req.body);

  // 2. Validate user details
  if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  // 3. Check if user already exists: email, username
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(400, "User already exists");
  }

  // 4. Check for images, avatar
  const avatarLocalPath = req.files?.avatar[0]?.path;
  let coverImageLocalPath;
  if (req.files?.coverImage && Array.isArray(req.files.coverImage)) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }
  if (!avatarLocalPath) {
    throw new ApiError(403, "Avatar is required");
  }

  // 5. Upload images to Cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(403, "Avatar upload failed");
  }
  if (!coverImage) {
    throw new ApiError(403, "Cover image upload failed");
  }

  // 6. Create user object in database
  const user = await User.create({
    fullName,
    email,
    password,
    avatar: avatar?.url || "",
    coverImage: coverImage?.url || "",
    username: username.toLowerCase(),
  });

  // 7. Remove password and refresh token from response of user object
  const createdUser = await User.findById(user._id).select("-password -refreshToken");
  if (!createdUser) {
    throw new ApiError(400, "User not created while registering");
  }

  // 8. Send response to frontend
  return res.status(201).json(new ApiResponse(200, createdUser, "User created successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  //1. req.body->details (username/email, password)
  //2. validate details
  //3. check if user exists (username/email)
  // 4. if user exists, check password
  //5. if password is correct, create access token and refresh token
  // send cookies to browser (access token, refresh token)

  const { username, email, password } = req.body;
  console.log("Request Body:", req.body);

  const identifier = username || email;
  if (!password || !identifier) {
    throw new ApiError(400, "Either username or email, and password are required");
  }

  // yha pr iska refresh token empty hai 
  const user = await User.findOne({
    $or: [{ username }, { email }]
  })
  if (!user) {
    throw new ApiError(400, "User not found")
  }

  const isPasswordValid = await user.isPasswordMatched(password)
  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid password")
  }


  const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id)

  // yha firse user ko database me call krege taki uska refresh token update ho jaye
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

  const isProduction = process.env.NODE_ENV === "production";

  const options = {
    httpOnly: true,
    secure: isProduction,      // only true in production
    sameSite: isProduction ? "none" : "lax" // needed for cross-origin cookies
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken
        },
        "User logged in successfully")
    )


})

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $unset: {
      refreshToken: 1 //1 is used to delete the field from the db
    },
  }, {
    new: true
  })

  const isProduction = process.env.NODE_ENV === "production";

  const options = {
    httpOnly: true,
    secure: isProduction,      // only true in production
    sameSite: isProduction ? "none" : "lax" // needed for cross-origin cookies
  };


  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken 

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request")
  }
  try {
    const decodeToken = JsonWebTokenError.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
  
    const user = await User.findById(decodeToken?._id)
  
    if(!user){
      throw new ApiError(401, "Unauthorized request, user not found")
    }
  
    if(user.refreshToken !== incomingRefreshToken){
      throw new ApiError(401, "Refresh token not matched")
    }
  
    const options = {
      httpOnly: true,
      secure: true
    }
  
    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id)
  
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(new ApiResponse(200, {
        accessToken,
        refreshToken
      }, "Access token refreshed successfully"))
  } catch (error) {
    throw new ApiError(401, error?.message || "error while refreshing access token")
    
  }
})


export { registerUser, loginUser, logoutUser, refreshAccessToken };