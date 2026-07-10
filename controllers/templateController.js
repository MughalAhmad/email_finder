const Template = require('../models/Template');

module.exports = {
  save: async (req, res, next) => {
  try {
    const { title, subject, body, status } = req.body;

    console.log('template request body:', req.body); // Log the request body for debugging

    // Check if template exists
    const existingTitle= await Template.findOne({title});
    if (existingTitle) {
      return res.status(409).json({
        success: false,
        message: 'Title already exists'
      });
    }

    // // Create template
    const template = new Template({
      userId:null,
      title,
      subject,
      body,
      status
    });

    await template.save();

    res.status(201).json({
        hasError: false,
        msg: ['Template created successfull'],
        data: null
    });

    // res.send({
    //   success: true,
    //   message: 'User registered successfully'
    // });

  } catch (error) {
    next(error);
  }
},

list: async (req, res, next) => {
  try {

    // // Check if template exists
    // const existingTitle= await Template.findOne({title});
    // if (existingTitle) {
    //   return res.status(409).json({
    //     success: false,
    //     message: 'Title already exists'
    //   });
    // }

    const templates = await Template.find();

     if (!templates) {
      return res.status(409).json({
        success: false,
        message: 'No template found'
      });
    }

    res.status(201).json({
        hasError: false,
        msg: ['Template find successfull'],
        data: templates
    });

    // res.send({
    //   success: true,
    //   message: 'User registered successfully'
    // });

  } catch (error) {
    next(error);
  }
},

edit: async (req, res, next) => {
  try {

    const {id} = req.body;

    const template = await Template.findOne({_id:id});

     if (!template) {
      return res.status(409).json({
        success: false,
        message: 'No template found'
      });
    }

    res.status(201).json({
        hasError: false,
        msg: ['Template find successfull'],
        data: template
    });

    // res.send({
    //   success: true,
    //   message: 'User registered successfully'
    // });

  } catch (error) {
    next(error);
  }
}
};