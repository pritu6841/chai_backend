import { asyncHandler } from '../utils/asyncHandler.js';

const registerUser = asyncHandler(async (req, res) => {
  console.log("registered user called", req.body);
  res.status(200).json({
    message: "okay"
  })
})

export { registerUser };