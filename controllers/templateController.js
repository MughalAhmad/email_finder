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
        userId: '6a50dc3355fef12f3304a4a5',
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
      const templates = await Template.find().sort({ createdAt: -1 });

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

      const templates = await Template.find({}, { title: 1 });

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


// // Get all templates with ID and title only
// const getTemplatesList = async (req, res, next) => {
//   try {
//     // Fetch all templates from database
//     const templates = await Template.find(
//       {}, // No filter - get all
//       { _id: 1, title: 1 } // Only return _id and title fields
//     ).sort({ title: 1 }); // Sort alphabetically by title

//     if (!templates || templates.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'No templates found'
//       });
//     }

//     // Format the response
//     const templateList = templates.map(template => ({
//       id: template._id,
//       title: template.title
//     }));

//     return res.status(200).json({
//       success: true,
//       count: templateList.length,
//       templates: templateList
//     });

//   } catch (error) {
//     console.error('Error fetching templates list:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Error fetching templates from database',
//       error: error.message
//     });
//   }
// };

// // Get templates with pagination
// const getTemplatesListPaginated = async (req, res, next) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 50;
//     const search = req.query.search || '';
    
//     const skip = (page - 1) * limit;
    
//     // Build search query
//     let query = {};
//     if (search) {
//       query = {
//         title: { $regex: search, $options: 'i' } // Case-insensitive search
//       };
//     }

//     // Get total count for pagination
//     const totalCount = await Template.countDocuments(query);
    
//     // Fetch templates with pagination
//     const templates = await Template.find(
//       query,
//       { _id: 1, title: 1, createdAt: 1 } // Include createdAt for sorting
//     )
//     .sort({ createdAt: -1 }) // Most recent first
//     .skip(skip)
//     .limit(limit);

//     if (!templates || templates.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'No templates found'
//       });
//     }

//     // Format the response
//     const templateList = templates.map(template => ({
//       id: template._id,
//       title: template.title
//     }));

//     return res.status(200).json({
//       success: true,
//       count: templateList.length,
//       total: totalCount,
//       page: page,
//       totalPages: Math.ceil(totalCount / limit),
//       templates: templateList
//     });

//   } catch (error) {
//     console.error('Error fetching templates list:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Error fetching templates from database',
//       error: error.message
//     });
//   }
// };

// // Get template by ID with full details (for preview/editing)
// const getTemplateDetails = async (req, res, next) => {
//   try {
//     const { id } = req.params;
    
//     // Validate ID format
//     if (!id || id.length !== 24) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid template ID format'
//       });
//     }
    
//     const template = await Template.findById(id);
    
//     if (!template) {
//       return res.status(404).json({
//         success: false,
//         message: 'Template not found'
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       template: {
//         id: template._id,
//         title: template.title,
//         content: template.content || template.body,
//         createdAt: template.createdAt,
//         updatedAt: template.updatedAt
//       }
//     });

//   } catch (error) {
//     console.error('Error fetching template details:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Error fetching template details',
//       error: error.message
//     });
//   }
// };

// // Get templates by IDs (for the email sender)
// const getTemplatesByIds = async (req, res, next) => {
//   try {
//     const { ids } = req.body;
    
//     if (!ids || !Array.isArray(ids) || ids.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please provide an array of template IDs'
//       });
//     }
    
//     // Fetch templates with the given IDs
//     const templates = await Template.find(
//       { _id: { $in: ids } },
//       { _id: 1, title: 1, content: 1 } // Include content if needed
//     );
    
//     if (!templates || templates.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'No templates found with the provided IDs'
//       });
//     }
    
//     // Check if all requested templates were found
//     const foundIds = templates.map(t => t._id.toString());
//     const missingIds = ids.filter(id => !foundIds.includes(id.toString()));
    
//     // Format the response
//     const templateList = templates.map(template => ({
//       id: template._id,
//       title: template.title,
//       content: template.content || template.body
//     }));
    
//     return res.status(200).json({
//       success: true,
//       count: templateList.length,
//       templates: templateList,
//       missingIds: missingIds.length > 0 ? missingIds : undefined
//     });

//   } catch (error) {
//     console.error('Error fetching templates by IDs:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Error fetching templates from database',
//       error: error.message
//     });
//   }
// };

// module.exports = {
//   getTemplatesList,
//   getTemplatesListPaginated,
//   getTemplateDetails,
//   getTemplatesByIds,
//   // ... other exports
// };