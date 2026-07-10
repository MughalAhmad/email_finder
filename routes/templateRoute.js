const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');
const { auth } = require('../middleware/auth');

// Public routes
router.post('/save', templateController.save);
router.get('/list', templateController.list);
router.get('/edit/:id', templateController.edit);

module.exports = router;