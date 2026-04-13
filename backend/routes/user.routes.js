import { Router } from "express";
import { getAllUserProfile, getMyProfile, getSuggestedUsers, getUserAndProfile, getUserProfile, login, register, resetPassword, searchUsers, updateMyProfile, updateProfileData, updateUserProfile, uploadProfilePicture } from "../controllers/user.controller.js";
import multer from "multer";
import auth from "../middleware/auth.middleware.js";

const router = Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({storage : storage});

router.route("/update_profile_picture")
    .post(upload.single('profile_picture'), uploadProfilePicture);

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/reset-password').post(resetPassword);

router.route("/user_update").post(updateUserProfile);
router.route("/get_user_and_profile").post(getUserAndProfile);
router.route("/update_profile_data").post(updateProfileData);
router.route("/user/get_all_users").get(getAllUserProfile);


router.route("/api/profile/me").get(auth, getMyProfile);
router.route("/api/profile/me").put(auth, updateMyProfile);
router.route("/api/profile/:id").get(getUserProfile);
router.route("/api/users/search").get(auth, searchUsers);
router.route("/api/users/suggestions").get(auth, getSuggestedUsers);

export default router;