// import {v2 as cloudinary} from 'cloudinary'
// import fs, { unlinkSync } from 'fs'



// const uploadOnCloudinary=async (localFilePath)=>{
//     try {
//         if(!localFilePath) return null;
//         //upload the file on cloudinary
//       const response= await cloudinary.uploader.upload(localFilePath,{
//             resource_type:"auto"
//         })
//         //file has been uploaded successfully
//         console.log("file uploaded on cloudinary",response.url)
//         return response;
//     } catch (error) {
//         fs.unlinkSync(localFilePath) //remove the locally saved temporary file as the upload operation failed
//         return null;
//     }
// }

// export {uploadOnCloudinary}
// // cloudinary.config({ 
// //     cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
// //     api_key: process.env.CLOUDINARY_API_KEY, 
// //     api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
// // });



import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Cloudinary configuration (uncomment and use this)
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // Upload the file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // File uploaded successfully
  //  console.log("File uploaded on Cloudinary:", response.url);
  fs.unlinkSync(localFilePath)

    // Remove the temporary local file after successful upload
    fs.unlink(localFilePath, (err) => {
      if (err) console.error("Error removing local file:", err);
    });

    return response;
  } catch (error) {
    console.error("Error uploading file to Cloudinary:", error);

    // Remove the local file if the upload operation failed
    fs.unlink(localFilePath, (err) => {
      if (err) console.error("Error removing local file:", err);
    });

    return null;
  }
};

export { uploadOnCloudinary };
