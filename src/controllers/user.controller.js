import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from '../utils/ApiError.js'
import {User} from '../models/user.model.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from 'jsonwebtoken'



const generateAccessAndRefreshTokens=async(userId)=>{
    try{
        const user=await User.findById(userId);
        const accessToken=user.generateAccessToken();
        const refreshToken=user.generateRefreshToken();
        user.refreshToken=refreshToken;
       await user.save({validateBeforeSave:false})
      return {accessToken,refreshToken}

    }catch(error){
      throw new ApiError(500,'something went wrong while accessing and refreshing tokems')
    }
}


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
    const existedUser= await User.findOne({
      $or:[{username},{email}]
    })
    if(existedUser){
      throw new ApiError(409,"user already exists..")
    }
    const avatarLocalPath=req.files?.avatar[0]?.path;
   // const coverImageLocalPath=req.files?.coverImage[0]?.path;

   let coverImageLocalPath;
   if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
      coverImageLocalPath=req.files.coverImage[0].path
   }

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


const loginUser=asyncHandler(async(req,res)=>{
        // data from req.body
        //username or email
        //find the user
        //Passord check
        // access and refresh token
        //send cookie
        const {email,username,password}=req.body;
      if(!username && !email){
          throw new ApiError(400,"username or password any one is  required")
      }

      const user=await User.findOne({email});
      if(!user){
        throw new ApiError(404,"No user found with this email please register first")
      }

     const isPasswordValid= await user.isPasswordCorrect(password);
     if(!isPasswordValid){
      throw new ApiError(404,"wrong password")
    }

   const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id)
    const loggedInUser=await User.findById(user._id).select("-password -refreshToken")

    const options={httpOnly:true,secure:true}
    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
      new ApiResponse(200,{
        user:loggedInUser,accessToken,refreshToken
      },
      "user logged in successfully..."
    )
    )
})


const logoutUser=asyncHandler(async(req,res)=>{
    User.findByIdAndUpdate(
      req.user._id,
    {
      $set:{refreshToken:undefined}
    },
   {
      new:true
   })

   const options={httpOnly:true,secure:true}
   return res
   .status(200)
   .clearCookie("accessToken",options)
   .clearCookie("refreshToken",options)
   .json(new ApiResponse(200,{},"user logged out successfully"))
})

const refreshAccessToken=asyncHandler(async(req,res)=>{
  const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken
  if(!incomingRefreshToken){
    throw new ApiError(401,"unauthorized request")
  }

 try {
  const decodedToken= jwt.verify(
     refreshAccessToken,process.env.REFRESH_TOKEN_SECRET
   )
 
   const user=await User.findById(decodedToken?._id)
   if(!user){
     throw new ApiError(401,"Invalid Refresh Token")
   }
 
   if(incomingRefreshToken!==user?.refreshToken){
     throw new ApiError(401,"Refresh token is expired or used")
   }
 
   const options={
     httpOnly:true,
     secure:true
   }
 
   const {accessToken,newRefreshToken}=await generateAccessAndRefreshTokens(user._id);
 
   return res
   .status(200)
   .cookie("accessToken",accessToken,options)
   .cookie("refreshToken",newRefreshToken,options)
   .json(
     new ApiResponse(
       200,
       {accessToken,refreshToken:newRefreshToken},
       "access token refreshed successfully"
     )
   )
 } catch (error) {
    throw new ApiError(401,error?.message || "invalid refresh token")
 }

})

export {registerUser,loginUser,logoutUser,refreshAccessToken}