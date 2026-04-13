import ConnectionRequest from "../models/connection.model.js";

export const sendConnectionRequest = async (req, res) => {
    try {
        const { connectionId } = req.body;

        if (!connectionId) {
            return res.status(400).json({ message: "Connection ID is required" });
        }

        if (connectionId === req.userId) {
            return res.status(400).json({ message: "Cannot connect with yourself" });
        }

        
        const existing = await ConnectionRequest.findOne({
            $or: [
                { userId: req.userId, connectionId: connectionId },
                { userId: connectionId, connectionId: req.userId }
            ]
        });

        if (existing) {
            return res.status(400).json({ message: "Connection request already exists" });
        }

        const request = new ConnectionRequest({
            userId: req.userId,
            connectionId: connectionId,
            status_accepted: null
        });

        await request.save();

        return res.status(201).json({ message: "Connection request sent", request });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const acceptConnectionRequest = async (req, res) => {
    try {
        const request = await ConnectionRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }

        if (String(request.connectionId) !== String(req.userId)) {
            return res.status(403).json({ message: "Not authorized" });
        }

        request.status_accepted = true;
        await request.save();

        return res.status(200).json({ message: "Connection accepted", request });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const rejectConnectionRequest = async (req, res) => {
    try {
        const request = await ConnectionRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }

        if (String(request.connectionId) !== String(req.userId)) {
            return res.status(403).json({ message: "Not authorized" });
        }

        request.status_accepted = false;
        await request.save();

        return res.status(200).json({ message: "Connection rejected", request });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const getMyConnections = async (req, res) => {
    try {
        const connections = await ConnectionRequest.find({
            $or: [
                { userId: req.userId, status_accepted: true },
                { connectionId: req.userId, status_accepted: true }
            ]
        })
        .populate('userId', 'name username email profilePicture')
        .populate('connectionId', 'name username email profilePicture');

        return res.status(200).json({ connections });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const getPendingRequests = async (req, res) => {
    try {
        const pending = await ConnectionRequest.find({
            connectionId: req.userId,
            status_accepted: null
        })
        .populate('userId', 'name username email profilePicture');

        return res.status(200).json({ requests: pending });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const getSentRequests = async (req, res) => {
    try {
        const sent = await ConnectionRequest.find({
            userId: req.userId,
            status_accepted: null
        })
        .populate('connectionId', 'name username email profilePicture');

        return res.status(200).json({ requests: sent });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
