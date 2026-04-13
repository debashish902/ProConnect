import { Router } from "express";
import { addComment, getCommentsByPost, deleteComment } from "../controllers/comments.controller.js";
import auth from "../middleware/auth.middleware.js";

const router = Router();

router.route('/api/posts/:postId/comments').post(auth, addComment);
router.route('/api/posts/:postId/comments').get(getCommentsByPost);
router.route('/api/comments/:id').delete(auth, deleteComment);

export default router;
