import express from 'express';
import transactionController from '../controllers/transactionController.js';

const router = express.Router();

router.get('/', transactionController.getTransactions);
router.post('/', transactionController.createTransaction);
router.put('/:IdOriginal', transactionController.updateTransaction);
router.delete('/:IdOriginal', transactionController.deleteTransaction);

export default router;
