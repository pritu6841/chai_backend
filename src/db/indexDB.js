import mongoose from "mongoose";
import { DB_NAME } from '../constants.js';

const connectDb = async () => {
  try {
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    console.log(`\nMongoDB connected! DB host: ${connectionInstance.connection.host}`);
  } catch (err) {
    console.log("Error connecting to MongoDB:", err);
  }
};

export default connectDb;