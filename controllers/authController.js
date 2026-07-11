const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

module.exports = {
  signup: async (req, res, next) => {
    try {
      const { fullName, email, password } = req.body;

      console.log("Signup request body:", req.body);

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "User already exists with this email",
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user - password will be automatically hashed by pre-save hook
      const user = new User({
        fullName,
        email,
        password: hashedPassword,
      });

      await user.save();

      // Generate token for immediate login
      const token = user.generateAuthToken();

      res.status(201).json({
        success: true,
        message: "User created successfully",
        data: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
        },
        token: token, // Optional: return token so user is logged in immediately
      });
    } catch (error) {
      next(error);
    }
  },

  signin: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      console.log("Signin request body:", req.body);

      // Find user with password field included
      const user = await User.findOne({ email }).select("+password");
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: "Account is deactivated. Please contact support.",
        });
      }

      // Check password using the compare method
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // Update last login
      await User.updateLastLogin(user._id);

      // Generate token
      const token = user.generateAuthToken();

      res.json({
        success: true,
        token: token,
        user: {
          fullName: user.fullName,
          email: user.email,
          role: user.role
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // In authController.js
  signout: async (req, res, next) => {
    try {
      // If you're using JWT stored in cookies
      res.clearCookie("token");

      // If using session-based auth
      // req.session.destroy();

      res.json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  // Get current user profile
  getCurrentUser: async (req, res, next) => {
    try {
      // req.user is set by the auth middleware
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      // Get fresh user data from database
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.json({
        success: true,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Get app password for a user
  getAppPassword: async (req, res, next) => {
    try {

      // Find user by email
      const user = await User.findOne({ email: req.user.email });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Return app password if exists, otherwise null
      return res.status(200).json({
        success: true,
        data: {
          email: user.email,
          appPassword: user.appPassword || null,
          hasPassword: !!user.appPassword,
        },
      });
    } catch (error) {
      console.error("Error fetching app password:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching app password",
        error: error.message,
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
          message: "App password is required",
        });
      }

      // Find and update user's app password
      const user = await User.findOneAndUpdate(
        { email: req.user.email },
        { appPassword: appPassword },
        { new: true, upsert: false }, // Don't create new user if not exists
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "App password saved successfully",
        data: {
          email: user.email,
          appPassword: user.appPassword,
        },
      });
    } catch (error) {
      console.error("Error saving app password:", error);
      return res.status(500).json({
        success: false,
        message: "Error saving app password",
        error: error.message,
      });
    }
  },
};
