const express = require("express");
const router = express.Router();
const templateController = require("../controllers/templateController");
const { auth } = require('../middleware/auth');

router.post("/dropdown1", auth , templateController.dropdown1);   // dropdown1

router.post("/save", auth , templateController.save);          // Create
router.get("/list", auth , templateController.list);           // Read All
router.get("/:id", auth , templateController.getById);     // Read One
router.post("/update/:id", auth , templateController.update);      // Update
router.delete("/delete/:id", auth , templateController.delete);   // Delete


module.exports = router;