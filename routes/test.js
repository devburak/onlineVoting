const express = require('express');
const router = express.Router();
const {sendSMST} = require('../services/sms'); 
const {generateVoteToken} =require('../utils/code')
router.post('/smst', async (req, res) => {
    try {
        const phoneNumber = req.body.phoneNumber; 
        const code = generateVoteToken(); // Your code generating function
        const message = `TEST code: ${code}`;
       const result= await sendSMST(phoneNumber, message);
        res.status(200).send({ status: 'success', message: 'Verification code sent!' ,result});
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).send({ status: 'error', message: 'Could not send SMS' });
    }
});

module.exports = router;