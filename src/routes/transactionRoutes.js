import express from 'express';
//Import checkAuth middleware
import { checkAuth } from '../middleware/checkAuth.js';
//Import transactionController
import transactionController from '../controllers/transactionController.js';


const router = express.Router();

router.get('/', checkAuth, transactionController.getTransactions);
router.post('/', checkAuth, transactionController.createTransaction);
router.put('/:IdOriginal', checkAuth, transactionController.updateTransaction);
router.delete('/:IdOriginal', checkAuth, transactionController.deleteTransaction);

export default router;
