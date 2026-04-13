import Profile from "../models/profile.model.js";
import User from "../models/user.model.js";
import ConnectionRequest from "../models/connection.model.js";
import Post from "../models/posts.model.js";
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import PDFDocument from 'pdfkit';

const convertUserDataTOPDF = (userData) => {
    const doc = new PDFDocument();
    const outputPath = crypto.randomBytes(32).toString("hex") + ".pdf";
}


export const register = async (req, res) => {
    try {
        const { name, email, username, password } = req.body;

        if (!name || !email || !username || !password) return res.status(400).json({ message: "All fields are required" });


        if (/\d/.test(name)) {
            return res.status(400).json({ message: "Name must not contain numbers" });
        }


        if (!/^[a-zA-Z_.]{3,}$/.test(username)) {
            return res.status(400).json({ message: "Username must be at least 3 characters and contain only letters, underscores, or dots (no numbers)" });
        }


        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Please enter a valid email address" });
        }


        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const user = await User.findOne({ email });

        if (user) return res.status(400).json({ message: "User already exists" });

        const existingUsername = await User.findOne({ username });
        if (existingUsername) return res.status(400).json({ message: "Username already taken" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            username,
            password: hashedPassword
        });

        await newUser.save();

        const profile = new Profile({ userId: newUser._id });
        await profile.save();

        return res.status(201).json({ message: "User registered successfully" });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }

}


export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User does not exist" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                username: user.username
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


export const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({ message: "Email and new password are required" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "No account found with this email" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({ message: "Password reset successfully" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


export const uploadProfilePicture = async (req, res) => {
    const { token } = req.body;

    try {
        const user = await User.findOne({ token: token });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.profilePicture = req.file.filename;

        await user.save();

        return res.json({ message: "Profile Picture is Updated" })

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const updateUserProfile = async (req, res) => {
    try {
        const { token, ...newUserData } = req.body;

        const user = await User.findOne({ token: token });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const { username, email } = newUserData;

        const existingUser = await User.findOne({ $or: [{ username }, { email }] });

        if (existingUser) {
            if (existingUser && String(existingUser._id) !== String(user._id)) {
                return res.status(400).json({ message: "User already exists" });
            }
        }

        Object.assign(user, newUserData);
        await user.save();
        return res.json({ message: "User profile updated successfully" });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}


export const getUserAndProfile = async (req, res) => {
    try {
        const token = req.body.token;

        if (!token) {
            return res.status(400).json({ message: "Token required" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const profile = await Profile.findOne({ userId: decoded.id });


        const connectionCount = await ConnectionRequest.countDocuments({
            $or: [
                { userId: decoded.id, status_accepted: true },
                { connectionId: decoded.id, status_accepted: true }
            ]
        });


        const postCount = await Post.countDocuments({ userId: decoded.id, active: true });

        return res.json({
            user,
            profile,
            connectionCount,
            postCount
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};



export const getMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const profile = await Profile.findOne({ userId: req.userId });

        const connectionCount = await ConnectionRequest.countDocuments({
            $or: [
                { userId: req.userId, status_accepted: true },
                { connectionId: req.userId, status_accepted: true }
            ]
        });

        const postCount = await Post.countDocuments({ userId: req.userId, active: true });


        if (profile) {
            profile.profileViews = (profile.profileViews || 0) + 1;
            await profile.save();
        }

        return res.json({
            user,
            profile,
            connectionCount,
            postCount
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};



export const updateMyProfile = async (req, res) => {
    try {
        const { headline, location, bio, about, currentPost, skills, website, pastWork, education } = req.body;

        let profile = await Profile.findOne({ userId: req.userId });

        if (!profile) {
            profile = new Profile({ userId: req.userId });
        }

        if (headline !== undefined) profile.headline = headline;
        if (location !== undefined) profile.location = location;
        if (bio !== undefined) profile.bio = bio;
        if (about !== undefined) profile.about = about;
        if (currentPost !== undefined) profile.currentPost = currentPost;
        if (skills !== undefined) profile.skills = skills;
        if (website !== undefined) profile.website = website;
        if (pastWork !== undefined) profile.pastWork = pastWork;
        if (education !== undefined) profile.education = education;

        await profile.save();

        return res.json({ message: "Profile updated successfully", profile });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};



export const getUserProfile = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const profile = await Profile.findOne({ userId });

        const connectionCount = await ConnectionRequest.countDocuments({
            $or: [
                { userId: userId, status_accepted: true },
                { connectionId: userId, status_accepted: true }
            ]
        });

        const postCount = await Post.countDocuments({ userId: userId, active: true });


        if (profile) {
            profile.profileViews = (profile.profileViews || 0) + 1;
            await profile.save();
        }

        return res.json({ user, profile, connectionCount, postCount });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};



export const getSuggestedUsers = async (req, res) => {
    try {

        const connections = await ConnectionRequest.find({
            $or: [
                { userId: req.userId },
                { connectionId: req.userId }
            ]
        });

        const connectedIds = connections.map(c => {
            return String(c.userId) === String(req.userId) ? c.connectionId : c.userId;
        });
        connectedIds.push(req.userId);


        const suggestions = await User.find({
            _id: { $nin: connectedIds },
            active: true
        })
            .select('name username email profilePicture')
            .limit(6);


        const profiles = await Profile.find({
            userId: { $in: suggestions.map(s => s._id) }
        });

        const profileMap = {};
        profiles.forEach(p => {
            profileMap[String(p.userId)] = p;
        });

        const result = suggestions.map(user => ({
            _id: user._id,
            name: user.name,
            username: user.username,
            profilePicture: user.profilePicture,
            headline: profileMap[String(user._id)]?.headline || '',
            currentPost: profileMap[String(user._id)]?.currentPost || ''
        }));

        return res.json({ suggestions: result });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


export const updateProfileData = async (req, res) => {
    try {
        const { token, bio, currentPost, pastWork, education } = req.body;

        if (!token) {
            return res.status(400).json({ message: "Token required" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }


        let profile = await Profile.findOne({ userId: decoded.id });
        if (!profile) profile = new Profile({ userId: decoded.id });

        if (bio !== undefined) profile.bio = bio;
        if (currentPost !== undefined) profile.currentPost = currentPost;
        if (pastWork !== undefined) profile.pastWork = pastWork;
        if (education !== undefined) profile.education = education;

        await profile.save();

        return res.json({ message: "Profile updated successfully", profile });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getAllUserProfile = async (req, res) => {
    try {
        const profile = await Profile.find().populate('userId', 'name username email profilePicture');
        return res.json({ profiles: profile })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}


export const searchUsers = async (req, res) => {
    try {
        const q = req.query.q;
        if (!q || q.trim().length === 0) {
            return res.json({ users: [] });
        }

        const regex = new RegExp(q.trim(), 'i');

        const users = await User.find({
            _id: { $ne: req.userId },
            active: true,
            $or: [
                { name: { $regex: regex } },
                { username: { $regex: regex } }
            ]
        })
            .select('name username profilePicture')
            .limit(10);


        const profiles = await Profile.find({
            userId: { $in: users.map(u => u._id) }
        });

        const profileMap = {};
        profiles.forEach(p => {
            profileMap[String(p.userId)] = p;
        });

        const results = users.map(user => ({
            _id: user._id,
            name: user.name,
            username: user.username,
            profilePicture: user.profilePicture,
            headline: profileMap[String(user._id)]?.headline || profileMap[String(user._id)]?.currentPost || ''
        }));

        return res.json({ users: results });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const downloadProfile = async (req, res) => {
    const user_id = req.query.id;

    const userProfile = await Profile.findOne({ userId: user_id })
        .populate('userId', 'name username email profilePicture');
}
