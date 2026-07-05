const express = require ("express");
const findEmailsController = require ("../controllers/findEmailController");
const router = express.Router();

router.post("/getEmails", findEmailsController.getEmails);   

module.exports = router;