const express = require ("express");
const emailController = require ("../controllers/emailController");
const router = express.Router();
const { auth } = require('../middleware/auth');

router.post("/getEmails", auth , emailController.getEmails);   
router.post("/sendEmail", auth , emailController.sendEmail);   

module.exports = router;