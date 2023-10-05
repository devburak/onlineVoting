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

router.post('/', authenticateJWT, createElection);
router.get('/', authenticateJWT, getElections);
router.get('/:id', getElectionById);
router.put('/:id', authenticateJWT, updateElection);
router.delete('/:id', authenticateJWT, deleteElection);

module.exports = router;
