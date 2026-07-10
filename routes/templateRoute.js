const express = require("express");
const router = express.Router();
const templateController = require("../controllers/templateController");

router.post("/dropdown1", templateController.dropdown1);   // dropdown1

router.post("/save", templateController.save);          // Create
router.get("/list", templateController.list);           // Read All
router.get("/:id", templateController.getById);     // Read One
router.post("/update/:id", templateController.update);      // Update
router.delete("/delete/:id", templateController.delete);   // Delete


module.exports = router;


// const express = require('express');
// const router = express.Router();
// const templateController = require('../controllers/templateController');

// // Get all templates (ID and Title only)
// router.get('/templates', templateController.getTemplatesList);

// // Get templates with pagination and search
// router.get('/templates/paginated', templateController.getTemplatesListPaginated);

// // Get template details by ID
// router.get('/templates/:id', templateController.getTemplateDetails);

// // Get templates by IDs (POST)
// router.post('/templates/batch', templateController.getTemplatesByIds);

// module.exports = router;