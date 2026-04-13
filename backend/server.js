import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import postRoutes from "./routes/posts.routes.js";
import userRoutes from "./routes/user.routes.js";
import commentRoutes from "./routes/comments.routes.js";
import connectionRoutes from "./routes/connections.routes.js";

dotenv.config();
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, '..', 'Frontend')));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use(postRoutes);
app.use(userRoutes);
app.use(commentRoutes);
app.use(connectionRoutes);

const start = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            console.error("MONGO_URI environment variable is required");
            process.exit(1);
        }
        await mongoose.connect(mongoUri, {
            family: 4,
        });
        console.log("MongoDB connected successfully");

        const PORT = process.env.PORT || 9090;
        app.listen(PORT, () => {
            console.log(`server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("MongoDB connection error:", error.message);
        process.exit(1);
    }
}

start();