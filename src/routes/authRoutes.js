const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/AuthController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Auth
router.post('/login', authCtrl.login);
router.post('/logout', authCtrl.logout);
router.post('/change-password', verifyToken, authCtrl.changePassword);
router.post('/forgot-password', authCtrl.forgotPassword);
router.post('/reset-password', authCtrl.resetPassword);

module.exports = router;