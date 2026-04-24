import { Router } from 'express';
import {
    signup,
    login,
    logout,
    getMe,
    refreshToken,
    resetPassword,
    updatePassword,
} from '../controllers/authController.js';

const router = Router();

// Email/Password Authentication
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', getMe);
router.post('/refresh', refreshToken);
router.post('/reset-password', resetPassword);
router.post('/update-password', updatePassword);

export default router;