const Template = require("../models/Template");

module.exports = {
  // ==========================
  // Create Template
  // ==========================
  save: async (req, res, next) => {
    try {
      const { title, subject, body, status } = req.body;

      const existingTitle = await Template.findOne({ title });

      if (existingTitle) {
        return res.status(200).json({
          hasError: true,
          msg: ["Title already exists"],
          data: null,
        });
      }

      const template = await Template.create({
        userId: req.user.id,
        title,
        subject,
        body,
        status,
      });

      res.status(201).json({
        hasError: false,
        msg: ["Template created successfully"],
        data: template,
      });
    } catch (error) {
      next(error);
    }
  },

  // ==========================
  // Get All Templates
  // ==========================
  list: async (req, res, next) => {
    try {
      const templates = await Template.find({userId: req.user.id}).sort({ createdAt: -1 });

      res.status(200).json({
        hasError: false,
        msg: ["Templates fetched successfully"],
        data: templates,
      });
    } catch (error) {
      next(error);
    }
  },

  // ==========================
  // Get Single Template
  // ==========================
  getById: async (req, res, next) => {
    try {
      const { id } = req.params;

      const template = await Template.findById(id);

      if (!template) {
        return res.status(404).json({
          hasError: true,
          msg: ["Template not found"],
          data: null,
        });
      }

      res.status(200).json({
        hasError: false,
        msg: ["Template fetched successfully"],
        data: template,
      });
    } catch (error) {
      next(error);
    }
  },

  // ==========================
  // Update Template
  // ==========================
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { title, subject, body, status } = req.body;

      // Check duplicate title
      const existingTitle = await Template.findOne({
        title,
        _id: { $ne: id },
      });

      if (existingTitle) {
        return res.status(409).json({
          hasError: true,
          msg: ["Title already exists"],
          data: null,
        });
      }

      const template = await Template.findByIdAndUpdate(
        id,
        {
          title,
          subject,
          body,
          status,
          updatedAt: new Date(),
        },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!template) {
        return res.status(404).json({
          hasError: true,
          msg: ["Template not found"],
          data: null,
        });
      }

      res.status(200).json({
        hasError: false,
        msg: ["Template updated successfully"],
        data: template,
      });
    } catch (error) {
      next(error);
    }
  },

  // ==========================
  // Delete Template
  // ==========================
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;

      const template = await Template.findByIdAndDelete(id);

      if (!template) {
        return res.status(404).json({
          hasError: true,
          msg: ["Template not found"],
          data: null,
        });
      }

      res.status(200).json({
        hasError: false,
        msg: ["Template deleted successfully"],
        data: null,
      });
    } catch (error) {
      next(error);
    }
  },

  // ==========================
  // Dropdown 1 (get _id and Title)
  // ==========================
  dropdown1: async (req, res, next) => {
    try {

      const templates = await Template.find({userId: req.user.id}, { title: 1 });

      if (!templates) {
        return res.status(404).json({
          hasError: true,
          msg: ["Template not found"],
          data: null,
        });
      }

      res.status(200).json({
        hasError: false,
        msg: ["Templates Found successfully"],
        data: templates,
      });
    } catch (error) {
      next(error);
    }
  },
};