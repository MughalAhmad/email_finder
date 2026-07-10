const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// App password routes
router.get('/app-password', authController.getAppPassword);
router.post('/app-password', authController.saveAppPassword);

// Public routes
router.post('/signup', authController.signup);
router.post('/signin', authController.signin);

module.exports = router;