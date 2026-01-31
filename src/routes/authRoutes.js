import { Router } from 'express';
import {
  initiateAuth,
  handleCallback,
  authSuccess,
  authError,
  authStatus,
} from '../controllers/authController.js';

const router = Router();

router.get('/google', initiateAuth);
router.get('/google/callback', handleCallback);
router.get('/success', authSuccess);
router.get('/error', authError);
router.get('/status', authStatus);

export default router;
