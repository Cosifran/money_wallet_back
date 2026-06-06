import { Router } from 'express';
//Import checkAuth middleware
import { checkAuth } from '../middleware/checkAuth.js';

const router = Router();

router.get('/perfil', checkAuth, (req, res) => {
    res.status(200).json({
        success: true,
        message: "Acceso concedido",
        userId: req.userId // El ID que extrajimos del token
    });
});

export default router;
