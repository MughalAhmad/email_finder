const User = require('../models/User');
const jwt = require('jsonwebtoken');

module.exports = {
  signup: async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;

    console.log('Signup request body:', req.body); // Log the request body for debugging

    // Check if user exists
    // const existingUser = await User.findByEmail(email);
    // if (existingUser) {
    //   return res.status(409).json({
    //     success: false,
    //     message: 'User already exists with this email'
    //   });
    // }

    // // Create user
    // const user = new User({
    //   fullName,
    //   email,
    //   password
    // });

    // await user.save();

    res.send({
      success: true,
      message: 'User registered successfully'
    });

  } catch (error) {
    next(error);
  }
},

signin: async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log('Signin request body:', req.body); // Log the request body for debugging

    // Find user
    // const user = await User.findOne({ email }).select('+password');
    // if (!user) {
    //   return res.status(401).json({
    //     success: false,
    //     message: 'Invalid credentials'
    //   });
    // }

    // // Check password
    // const isMatch = await user.comparePassword(password);
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

    // res.json({
    //   success: true,
    //   token,
    //   user: {
    //     id: user._id,
    //     fullName: user.fullName,
    //     email: user.email,
    //     role: user.role
    //   }
    // });
    res.send({
      success: true,
      message: 'User registered successfully'
    });

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
}
};