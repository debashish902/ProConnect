import Post from "../models/posts.model.js";
import User from "../models/user.model.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const activeCheck = async (req, res) => {
    return res.status(200).json({ message: "RUNNING" });
};

export const createPost = async (req, res) => {
    try {
        const { body } = req.body;
        if (!body && !req.file) {
            return res.status(400).json({ message: "Post body or media is required" });
        }

        const postData = {
            userId: req.userId,
            body: body || '',
        };

        if (req.file) {
            postData.media = '/uploads/' + req.file.filename;
            const ext = req.file.originalname.split('.').pop().toLowerCase();
            if (['jpg','jpeg','png','gif','webp','svg','bmp'].includes(ext)) postData.fileType = 'image';
            else if (['mp4','webm','ogg','mov','avi'].includes(ext)) postData.fileType = 'video';
            else postData.fileType = 'file';
        }

        const newPost = new Post(postData);
        await newPost.save();

        const populated = await Post.findById(newPost._id)
            .populate('userId', 'name username email profilePicture');

        return res.status(201).json({ message: "Post created successfully", post: populated });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find({ active: true })
            .populate('userId', 'name username email profilePicture')
            .sort({ createdAt: -1 });
        return res.status(200).json({ posts });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('userId', 'name username email profilePicture');
        if (!post || !post.active) return res.status(404).json({ message: "Post not found" });
        return res.status(200).json({ post });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });
        if (String(post.userId) !== String(req.userId)) return res.status(403).json({ message: "Not authorized" });

        
        if (post.media) {
            const mediaPath = path.join(__dirname, '..', post.media);
            if (fs.existsSync(mediaPath)) {
                fs.unlinkSync(mediaPath);
            }
        }

        
        await Post.findByIdAndDelete(req.params.id);
        return res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const toggleLike = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post || !post.active) return res.status(404).json({ message: "Post not found" });
        const userIndex = post.likedBy.indexOf(req.userId);
        if (userIndex === -1) post.likedBy.push(req.userId);
        else post.likedBy.splice(userIndex, 1);
        await post.save();
        return res.status(200).json({ message: userIndex === -1 ? "Post liked" : "Post unliked", liked: userIndex === -1, likeCount: post.likedBy.length });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


export const uploadProfilePic = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: "User not found" });
        user.profilePicture = '/uploads/' + req.file.filename;
        await user.save();
        return res.json({ message: "Profile picture updated", profilePicture: user.profilePicture });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


export const deleteProfilePic = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

      
        if (user.profilePicture && user.profilePicture !== 'default.jpg') {
            const oldPath = path.join(__dirname, '..', user.profilePicture);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        user.profilePicture = 'default.jpg';
        await user.save();

        return res.json({ message: "Profile picture removed" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
