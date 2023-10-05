// logService.js

const Log = require('../db/models/log');

exports.logAction = async ({ action, status, userId, details }) => {
    try {
        const log = new Log({
            action,
            status,
            userId,
            details
        });
        await log.save();
    } catch (error) {
        console.error('Failed to log action:', error);
    }
};

exports.getLogs = async (req, res) => {
    try {
        // Kullanıcıdan gelecek filtre parametrelerini alın
        const { action, status, details, page = 1, limit = 30 } = req.query;
        
        // Filtreleme koşullarını oluşturun
        const filterConditions = {};
        if (action) filterConditions.action = action;
        if (status) filterConditions.status = status;
        if (details) filterConditions.details = { $regex: details, $options: 'i' }; // case-insensitive arama yapmak için
        
        // Paginate fonksiyonu ile logları getirin
        const logs = await Log.paginate(filterConditions, {
            page, 
            limit,
            sort: { timestamp: -1 } // -1 for DESC and 1 for ASC
        });
        
        // Logları response olarak gönderin
        res.status(200).json(logs);
    } catch (error) {
        console.error('Failed to get logs:', error);
        res.status(500).send('Internal Server Error');
    }
};