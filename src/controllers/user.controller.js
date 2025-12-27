import { asynchandler } from '../utils/asynchandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import { UploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save();

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Error generating tokens")
    }
}

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
    console.log("Email: ", email);

    if (!username || !email || !password) {
        throw new ApiError(400, "All fields are required");
    }

    const UserExisted = User.findOne(
        {
            $or: [{ username }, { email }]
        }
    )

    if (UserExisted) {
        throw new ApiError(409, "User with same Username or Email is already exist")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverimageLocalpath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(409, "Avatar file is required!!")
    }

    const avatar = await UploadOnCloudinary(avatarLocalPath);
    const coverImage = await UploadOnCloudinary(coverimageLocalpath);

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required!!")
    }



    const user = await User.create({
        username: username.toLowerCase(),
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )
}
);

const loginUser = asynchandler(async (req, res) => {
    // get email and Password from req.body
    // validate it 
    // Check  user exist with given email
    // Compare Password
    // generate access token and refresh token
    // send cookies
    // return res with user details and token

    const { email, password, username } = req.body;
    if ((!username && !email)) {
        throw new ApiError(400, "Email and Password are required")
    }
    const user = await User.findOne({
        $or: [{ email }, { username }]
    });
    if (!user) {
        throw new ApiError(404, "User not found with given email")
    }
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials - password mismatch")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .cookie("refreshToken", refreshToken, options)
        .cookie("accessToken", accessToken, options)
        .json(
            new ApiResponse(200, {
                user: { loggedInUser, accessToken, refreshToken }


            }, "User logged in successfully"
            ))
})

const logoutUser = asynchandler(async (req, res) => {
    User.findByIdAndUpdate(req.user._id, { $set: { refreshToken: undefined } }, { new: true });

    const options = {
        httpOnly: true,
        secure: true
    }

    res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, null, "User logged out successfully")
        )

});


const RefreshAccesstoken = asynchandler(async (req, res) => {

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (incomingRefreshToken) {
        throw new ApiError(400, "Unauthorized request")
    }

   try {
     const decodetoken = jwt.verify(
         incomingRefreshToken,
         process.env.JWT_REFRESH_SECRET_KEY
     )
     const user = await User.findById(decodetoken?._id)
     if (!user || user.refreshToken !== incomingRefreshToken) {
         throw new ApiError(400, "Refresh token is Invalid or expired")
     }
 
     const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
 
     const options = {
         httpOnly: true,
         secure: true
     }
 
     return res.status(200)
         .cookie("refreshToken", refreshToken, options)
         .cookie("accessToken", accessToken, options)
         .json(
             new ApiResponse(200, {
                 user: { accessToken, refreshToken }
             }, "Access token refreshed successfully")
         )
   } catch (error) {
        throw new ApiError(400, "Invalid refresh token")
    
   }
})

export { registerUser, loginUser, logoutUser , RefreshAccesstoken};