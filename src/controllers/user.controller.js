import { asynchandler } from '../utils/asynchandler.js';
import {ApiError} from '../utils/ApiError.js';
import {User} from '../models/user.model.js';
import {UploadOnCloudinary} from '../utils/cloudinary.js'
import {ApiResponse} from '../utils/ApiResponse.js';        

const registerUser = asynchandler(async (req, res) => {

    // get user details from frontend
    // Validate it . It should not empty
    // Check if user is already exist : username , email ,....
    // check for images and check for avatar ,
    // Upload on cloudniary , avatar
    // create user object - create entry in db,
    // remove password and refresh tokens from response 
    // check for user creation 
    // return res


    const { username, email, password } = req.body;
    console.log("Email: " , email);

    if (!username || !email || !password) {
        throw new ApiError(400, "All fields are required");
    }

    const UserExisted =  User.findOne(
        {
            $or : [{username} , {email}]
        }
    )

    if(UserExisted){
        throw new ApiError(409,"User with same Username or Email is already exist") 
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverimageLocalpath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(409,"Avatar file is required!!")
    }

    const avatar = await UploadOnCloudinary(avatarLocalPath);
    const coverImage = await UploadOnCloudinary(coverimageLocalpath);

    if(!avatar){
        throw new ApiError(400,"Avatar file is required!!")
    }



    const user = await User.create({
        username : username.toLowerCase(),
        email,
        password,
        avatar : avatar.url,
        coverImage : coverImage?.url || ""
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered Successfully")
    )
}
);
export { registerUser };