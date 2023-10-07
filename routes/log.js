const express = require('express');
const router = express.Router();
const logService = require('../services/logService');
const {authenticateJWTOrVoter} =require('../services/authMiddleware')
router.get('/', authenticateJWTOrVoter,logService.getLogs);

module.exports = router;