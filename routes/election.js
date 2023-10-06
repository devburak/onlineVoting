const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../services/authMiddleware');
const {
    createElection,
    getElections,
    getElectionById,
    updateElection,
    deleteElection
} = require('../services/electionService');
const Election =require('../db/models/election')

router.get('/active', async (req, res) => {
    try {
        // Şu anda aktif olan ilk seçimi bul
        const activeElection = await Election.findOne({ isActive: true }).sort({ electionDate: 1, startTime: 1 });
        
        if (!activeElection) {
            return res.status(404).send({ message: 'No active election found.' });
        }

        res.status(200).send(activeElection);
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'An error occurred while retrieving the active election.' });
    }
});

router.post('/', authenticateJWT, createElection);
router.get('/', authenticateJWT, getElections);
router.get('/:id', getElectionById);
router.put('/:id', authenticateJWT, updateElection);
router.delete('/:id', authenticateJWT, deleteElection);

module.exports = router;
