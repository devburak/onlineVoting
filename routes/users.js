const express = require('express');
const userService = require('../services/userService');
const loginService = require('../services/loginService')
const router = express.Router();

router.post('/', userService.createUser);
router.get('/', userService.getUsers);
router.get('/:id', userService.getUserById);
router.put('/:id', userService.updateUser);
router.delete('/:id', userService.deleteUser);
router.post('/signin', loginService.signIn);

router.post('/regenerate', async (req, res) => {
    try {
        const { email, resetCode, newPassword } = req.body;
        await loginService.regeneratePassword(email, resetCode, newPassword);
        res.status(200).json({ message: 'Password successfully renewed and notification e-mail sent' });
    } catch (error) {
        console.error('Password renewal error:', error);
        res.status(500).json({ error: error.message || 'An error occurred' });
    }
});

router.post('/forget', async (req, res) => {
    try {
        const { email } = req.body;
        await loginService.createPasswordReset(email);
        res.status(200).json({ message: 'Password reset code has been generated' });
    } catch (error) {
        console.error('Password reset request error:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

module.exports = router;
