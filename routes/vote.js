const express = require('express');
const {voteRequestService ,castVote,getVoteById ,getVotes} =require('../services/voteService');
const {authenticateJWTOrVoter} = require('../services/authMiddleware')
const router = express.Router();


router.post('/request' , async (req,res)=>{
    try {
        const { identifier, electionId } = req.body; 

        // Kontroller
        if (!identifier || !electionId) {
            return res.status(400).json({ message: 'Identifier ve electionId zorunludur.' });
        }

        const response = await voteRequestService(identifier, electionId);

        return res.status(200).json(response);
        
    } catch (error) {
        console.error('Error in /vote-request:', error.message);
        return res.status(500).json({ message: error.message });
    }
})

router.post('/cast', castVote);

router.get('/:id',authenticateJWTOrVoter,  getVoteById); // Yeni eklenen route

router.get('/all/:electionId' ,authenticateJWTOrVoter , getVotes );

module.exports = router;