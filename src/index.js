// require("dotenv").config({path: "./env"});

import dotenv from "dotenv";
import mongoose, { connect } from "mongoose";
import { DB_NAME } from "./constants.js";
import connectDB from "./db/index.js";


dotenv.config({ path: "./.env" });


connectDB()

.then(() =>{
    app.listen(process.env.PORT || 8000 ,() =>{
        console.log(`Server is running on port ${process.env.PORT || 8000}`);   
    })
})
    .catch((err) => {
        console.log(" MONGO DATABASE CONNECTION FAILED !!!", err);
    });



/*
import express from "express";
const app = express();

( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        console.log("MongoDB connected successfully");
        app.on("error", (error) => {
            console.error("Error in server setup:", error);
            throw error;
        });

        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }   
})()*/