import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { User } from '../models/user.models.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import {ApiResponse} from '../utils/apiResponse.js'
const registerUser = asyncHandler(async (req, res) => {
  // steps to register user
  // 1. get user details from frontend(req.body)
  // 2.validate user details
  // 3. check if user already exists:email, username
  // 4.check for images, aavatar
  // 5. upload images to cloudinary
  // 6. create user object in database
  // 7. remove password and referesh token from resposnse of user object
  //  check for user creation
  // 8. send response to frontend

  const { fullname, email, username, password } = req.body;

  if ([fullname, email, username, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required")
  }

  const existedUser = User.findOne({
    $or: [{ username }, { email }]
  })

  if (existedUser) {
    throw new ApiError(400, "User already exist")
  }

  const avatarLocalPath = req.files?.avatar[0]?.path
  const coverImageLocalPath = req.files?.coverImage[0]?.path

  if (!avatarLocalPath) {
    throw new ApiError(403, "avatar is required")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if(avatar){
    throw new ApiError(403, "avatar is required")
  }
  if(coverImage){
    throw new ApiError(403, "coverImage is required")
  }

  const user = await User.create({
    fullname,
    email,
    password,
    avatar: avatar?.url||"",
    coverImage: coverImage?.url||"",
    username: username.toLowerCase(),
  })

  const createdUser = await User.findById(user._id).select("-password -refreshToken")
  if (!createdUser) {
    throw new ApiError(400, "User not created while registering")
  }

  return res.status(201).json(new ApiResponse(200, createdUser, "User created successfully"))
})

export { registerUser };