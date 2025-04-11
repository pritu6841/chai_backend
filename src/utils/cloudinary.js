import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';//helps in file read, write, delete etc

    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });

// Upload function
const uploadOnCloudinary = async (filePath) => {
  try{
    if(!filePath) return null
    const response = await cloudinary.uploader.upload(filePath, {
      resource_type:"auto"
    });
    // file is uploaded successfully
    // console.log("File uploaded successfully", response.url)
    fs.unlinkSync(filePath)//delete the file from local storage
    
    return response
  }catch(err){
    fs.unlinkSync(filePath)//delete the file from local storage
    console.log(err)
    return null
  }
}

export { uploadOnCloudinary }