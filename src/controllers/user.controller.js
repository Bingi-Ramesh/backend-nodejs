import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from '../utils/ApiError.js'
import {User} from '../models/user.model.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import { ApiResponse } from "../utils/ApiResponse.js"
const registerUser=asyncHandler( async(req,res)=>{
     //get user details from frontend or postman 
     //check user model for the fields
     //validation ->currently check fields should not empty
     //check user if already exists-with email
     // check for images and avatar a they are required
     //upload them to cloudinary,avatar
     //create user object-create entry in db
     //remove password and refresh token field from responde
     //check fro user creation
     //return res
     const {fullName,email,password,username,}=req.body;
     console.log("email",email)
    if([fullName,email,username,password].some( (field)=> field?.trim()==="" ) ){
         throw new ApiError(400,"All inputs are required")
    }
    const existedUser=User.findOne({
      $or:[{username},{email}]
    })
    if(existingUser){
      throw new ApiError(409,"user already exists..")
    }

    const avatarLocalPath=req.files?.avatar[0]?.path;
    const coverImageLocalPath=req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
      throw new ApiError(400,"avatar image is required...")
    }

  const avatar= await uploadOnCloudinary(avatarLocalPath);
  const coverImage= await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
      throw new ApiError(400,"failed to upload avatar")
    }

    //pushing into db
  const user= await User.create({
      fullName,
      avatar:avatar.url,
      coverImage:coverImage?.url || "",
      email,
      password,
      username:username.toLowerCase()
    })

const createdUser=await User.findById(user._id).select(
   "-password -refreshToken"
)

if(!createdUser){
   throw new ApiError(500,"something went wrong while registering")
}

return res.status(200).json(new ApiResponse(200),createdUser,"user registered successfully")

})
export {registerUser}