import express from 'express';
//Import checkAuth middleware
import { checkAuth } from '../middleware/checkAuth.js';
//Import notificationController
import notificationsController from '../controllers/notificationsController.js';


const router = express.Router();

router.post('/', checkAuth, notificationsController.createNotification);

export default router;
