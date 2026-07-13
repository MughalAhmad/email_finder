const express = require ("express");
const dashboardController = require ("../controllers/dashboardController");
const router = express.Router();
const { auth } = require('../middleware/auth');

router.get("/cards", auth , dashboardController.cardsDashboard);   

module.exports = router;