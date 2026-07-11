const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// App password routes
router.get('/app-password', auth, authController.getAppPassword);
router.post('/app-password', auth, authController.saveAppPassword);

// Public routes
router.post('/signup', authController.signup);
router.post('/signin', authController.signin);
router.post('/signout', authController.signout);
router.get('/getCurrentUser', auth, authController.getCurrentUser);

module.exports = router;