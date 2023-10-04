const express = require('express');
const userService = require('../services/userService');
const router = express.Router();

router.post('/', userService.createUser);
router.get('/', userService.getUsers);
router.get('/:id', userService.getUserById);
router.put('/:id', userService.updateUser);
router.delete('/:id', userService.deleteUser);

module.exports = router;
