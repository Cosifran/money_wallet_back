import dbService from '../services/dbService.js';

const createNotification = async (req, res) => {
    try {
        const newNotification = await dbService.createNotification(req.userId, req.body);
        res.status(201).json(newNotification);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create notification' });
    }
};

export default {
    createNotification
}