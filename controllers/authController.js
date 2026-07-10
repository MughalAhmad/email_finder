const User = require('../models/User');
const jwt = require('jsonwebtoken');

module.exports = {
  signup: async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;

    console.log('Signup request body:', req.body); // Log the request body for debugging

    // Check if user exists
    const existingUser = await User.findOne({email});
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // // Create user
    const user = new User({
      fullName,
      email,
      password
    });

    await user.save();

    res.status(201).json({
        hasError: false,
        msg: ['User created successfull'],
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

signin: async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log('Signin request body:', req.body); // Log the request body for debugging

    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // // Check password
    // const isMatch = await user.comparePassword(password);
    if(user.password !== password){
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    // if (!isMatch) {
    //   return res.status(401).json({
    //     success: false,
    //     message: 'Invalid credentials'
    //   });
    // }

    // // Update last login
    // await User.updateLastLogin(user._id);

    // // Generate token
    // const token = user.generateAuthToken();

    res.json({
      success: true,
      token:'hello token',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });
    // res.send({
    //   success: true,
    //   message: 'User registered successfully'
    // });

  } catch (error) {
    next(error);
  }
},

getCurrentUser: async (req, res, next) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
},

logout: async (req, res) => {
  // Client-side logout (clear token on client)
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
},

// Get app password for a user
getAppPassword: async (req, res, next) => {
  try {
    

    // Find user by email
    const user = await User.findOne({ email: 'ahmad@gmail.com' });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Return app password if exists, otherwise null
    return res.status(200).json({
      success: true,
      data: {
        email: user.email,
        appPassword: user.appPassword || null,
        hasPassword: !!user.appPassword
      }
    });

  } catch (error) {
    console.error('Error fetching app password:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching app password',
      error: error.message
    });
  }
},

// Save/Update app password for a user
saveAppPassword: async (req, res, next) => {
  try {
    const { appPassword } = req.body;

    if (!appPassword) {
      return res.status(400).json({
        success: false,
        message: 'App password is required'
      });
    }

    // Find and update user's app password
    const user = await User.findOneAndUpdate(
      { email: 'ahmad@gmail.com' },
      { appPassword: appPassword },
      { new: true, upsert: false } // Don't create new user if not exists
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'App password saved successfully',
      data: {
        email: user.email,
        appPassword: user.appPassword
      }
    });

  } catch (error) {
    console.error('Error saving app password:', error);
    return res.status(500).json({
      success: false,
      message: 'Error saving app password',
      error: error.message
    });
  }
},

// Delete app password (optional)
deleteAppPassword: async (req, res, next) => {
  try {
    const { email } = req.params;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOneAndUpdate(
      { email: email },
      { appPassword: null },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'App password removed successfully'
    });

  } catch (error) {
    console.error('Error deleting app password:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting app password',
      error: error.message
    });
  }
}
};