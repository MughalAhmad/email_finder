const express = require ("express");
const emailController = require ("../controllers/emailController");
const router = express.Router();

router.post("/getEmails", emailController.getEmails);   
router.post("/sendEmail", emailController.sendEmail);   

module.exports = router;