const express = require('express');
const router = express.Router();
const logService = require('../services/logService');

router.get('/', logService.getLogs);

module.exports = router;