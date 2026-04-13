import Comment from "../models/comments.model.js";
import Post from "../models/posts.model.js";

export const addComment = async (req, res) => {
    try {
        const { body } = req.body;
        const { postId } = req.params;

        if (!body) {
            return res.status(400).json({ message: "Comment body is required" });
        }

        const post = await Post.findById(postId);
        if (!post || !post.active) {
            return res.status(404).json({ message: "Post not found" });
        }

        const comment = new Comment({
            userId: req.userId,
            postId: postId,
            body
        });

        await comment.save();

        const populated = await Comment.findById(comment._id)
            .populate('userId', 'name username profilePicture');

        return res.status(201).json({ message: "Comment added", comment: populated });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const getCommentsByPost = async (req, res) => {
    try {
        const comments = await Comment.find({ postId: req.params.postId })
            .populate('userId', 'name username profilePicture')
            .sort({ _id: -1 });

        return res.status(200).json({ comments });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        if (String(comment.userId) !== String(req.userId)) {
            return res.status(403).json({ message: "Not authorized to delete this comment" });
        }

        await Comment.findByIdAndDelete(req.params.id);

        return res.status(200).json({ message: "Comment deleted" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
