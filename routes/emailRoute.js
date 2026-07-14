const express = require ("express");
const emailController = require ("../controllers/emailController");
const router = express.Router();
const { auth } = require('../middleware/auth');
const { validateDomainLimit } = require('../middleware/domainLimit');
const { dynamicRateLimiter } = require('../middleware/rateLimiter');

router.post("/getEmails", auth , dynamicRateLimiter, validateDomainLimit , emailController.getEmails);   
router.post("/sendEmail", auth , emailController.sendEmail);   

module.exports = router;