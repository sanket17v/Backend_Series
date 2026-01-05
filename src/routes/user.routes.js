import { Router } from "express";   
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { RefreshAccesstoken } from "../controllers/user.controller.js";


const router = Router();

router.route('/register').post(
    upload.fields([

        {
            name:"avatar",
            maxCount: 1
        },
        {
            name:"coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)

router.route('/login').post(loginUser);

// Secured routes 
router.route('/logout').post(verifyJWT,logoutUser);

router.route('/refresh-token').post(RefreshAccesstoken);

router.route('/change-password').post(verifyJWT, changeCurrentPassword);

router.route('/get-current-user').get(verifyJWT, getcurrentUser);

router.route('/update-account-details').patch(verifyJWT, updateAccountDetails);

router.route('/avatar').patch(verifyJWT, upload.single("avatar"), updateUseravatar);

router.route('/cover-image').patch(verifyJWT, upload.single("coverImage"), updateCoverImage);

router.route('/channel/:username').get(verifyJWT, getUserChannelProfile);

router.route('/watch-history').get(verifyJWT, getWatchHistory);


export default router;
// Default export so we can import it by any name