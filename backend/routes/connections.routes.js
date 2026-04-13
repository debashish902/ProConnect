import { Router } from "express";
import { sendConnectionRequest, acceptConnectionRequest, rejectConnectionRequest, getMyConnections, getPendingRequests, getSentRequests } from "../controllers/connections.controller.js";
import auth from "../middleware/auth.middleware.js";

const router = Router();

router.route('/api/connections/request').post(auth, sendConnectionRequest);
router.route('/api/connections/:id/accept').put(auth, acceptConnectionRequest);
router.route('/api/connections/:id/reject').put(auth, rejectConnectionRequest);
router.route('/api/connections').get(auth, getMyConnections);
router.route('/api/connections/pending').get(auth, getPendingRequests);
router.route('/api/connections/sent').get(auth, getSentRequests);

export default router;
