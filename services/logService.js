// logService.js
const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
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
        let { page = 1, limit = 20, ...filters } = req.query;
        
        // // Filtreleme koşullarını oluşturun
        // const filterConditions = {};
        // if (action) filterConditions.action = action;
        // if (status) filterConditions.status = status;
        // if (details) filterConditions.details = { $regex: details, $options: 'i' }; // case-insensitive arama yapmak için
        
         page = parseInt(page);
         limit = parseInt(limit);
         if (isNaN(page) || isNaN(limit)) {
             return res.status(400).send({ message: "Invalid page or limit value" });
         }
         // Güvenli sorgu oluşturma
        const query = {};
        if(filters.action){
            query.action = { $regex: filters.action, $options: 'i' };  // isimde case-insensitive arama yapar
        }
        if(filters.status){
            query.status = { $regex: filters.status, $options: 'i' };  
        }
        if(filters.details){
            query.details = { $regex: filters.details, $options: 'i' };  
        }
        if(filters.userId && mongoose.isValidObjectId(filters.userId)){
            query.userId = new ObjectId(filters.userId);
        }
       

        // Paginate fonksiyonu ile logları getirin
        const logs = await Log.paginate(query, {
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