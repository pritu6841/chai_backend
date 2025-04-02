// require('dotenv').config()
import dotenv from "dotenv";
import connectDb from "./db/indexDB.js";
import express from "express";

const app = express()
dotenv.config()

connectDb()
  .then(() => {
    app.on("error", (err) => {
      console.log("Error : ", err)
    })
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running on port ${process.env.PORT}`)
    })
  })
  .catch((err) => {
    console.log(err)
  })



// const app = express()
// ; (async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGO_URI}` / `${DB_NAME}`)
//     app.on("error", (err) => {
//       console.log("Error : ",err)
//     })

//     app.listen(process.env.PORT, () => {
//       console.log(`Server is running on port ${process.env.PORT}`)
//     })
//   }
//   catch (err) {
//     console.log(err)
//   }
// })()