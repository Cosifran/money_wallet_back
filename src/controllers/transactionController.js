import sheetService from '../services/sheetService.js';

const getTransactions = async (req, res) => {
    try {
        const transactions = await sheetService.getAllTransactions(req.userId);
        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
};

const createTransaction = async (req, res) => {
    try {
        const newTransaction = await sheetService.createTransaction(req.userId, req.body);
        res.status(201).json(newTransaction);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create transaction' });
    }
};

const updateTransaction = async (req, res) => {
    try {
        const { IdOriginal } = req.params;
        const updatedTransaction = await sheetService.updateTransaction(IdOriginal, req);
        res.status(200).json(updatedTransaction);
    } catch (error) {
        if (error.message === 'Transaction not found') {
            res.status(404).json({ error: 'Transaction not found' });
        } else {
            res.status(500).json({ error: 'Failed to update transaction' });
        }
    }
};

const deleteTransaction = async (req, res) => {
    try {
        const { IdOriginal } = req.params;
        await sheetService.deleteTransaction(IdOriginal, req.userId);
        res.status(200).json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        if (error.message === 'Transaction not found') {
            res.status(404).json({ error: 'Transaction not found' });
        } else {
            res.status(500).json({ error: 'Failed to delete transaction' });
        }
    }
};

export default {
    getTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
};
