import { Router } from "express";
import { activeCheck, createPost, getAllPosts, getPostById, deletePost, toggleLike, uploadProfilePic, deleteProfilePic } from "../controllers/posts.controller.js";
import auth from "../middleware/auth.middleware.js";
import multer from "multer";
import crypto from "crypto";
import path from "path";

const router = Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const unique = crypto.randomBytes(8).toString('hex');
        cb(null, unique + path.extname(file.originalname));
    }
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB

router.route('/').get(activeCheck);

// Posts API
router.route('/api/posts').post(auth, upload.single('media'), createPost);
router.route('/api/posts').get(getAllPosts);
router.route('/api/posts/:id').get(getPostById);
router.route('/api/posts/:id').delete(auth, deletePost);
router.route('/api/posts/:id/like').post(auth, toggleLike);

// Profile picture
router.route('/api/profile/picture').post(auth, upload.single('profilePicture'), uploadProfilePic);
router.route('/api/profile/picture').delete(auth, deleteProfilePic);

export default router;