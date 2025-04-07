const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).
      catch((err) => next(err))
  }
}


export { asyncHandler }


{/*second opttion of creating a asynchandler */ }

// const asyncHandler= (requestHandler) => async(req, res, next)=> {
//   try{
//     await requestHandler(req, res, next)
//     next()
//   }catch(err){
//     res.status(err.code || 5000).json({
//       success: false,
//       message: err.message || "Internal Server Error",
//     })
//   }
// }