import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            index: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        FullName: {
            type: String,
            required: true,
            index: true,
            trim: true,
        },
        avatar: {
            type: String, // Cloudinary URL
            required: true
        },
        CoverImage: {
            type: String, // Cloudinary URL

        },
        watchHistory: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Video",
            }
        ],
        password: {
            type: String,
            required: [true, "Password is required"]
        },
        refreshToken: {
            type: String,
        },
    }, { timestamps: true }
);

userSchema.pre("save", async function (next) {
    if (!this.modified("password")) return next();
    this.password = bcrypt.hash(this.password, 10)
    next();
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
}

// By using this syntax of .methods we can create as many of methods we required

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email,
            FullName: this.FullName,
        },
        process.env.ACESS_TOKEN_SECRET,
        { expiresIn: process.env.ACESS_TOKEN_EXPIRY }
    );
}
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email,
            FullName: this.FullName,
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
}

export const User = mongoose.model("User", userSchema);