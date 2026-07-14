const User = require('../models/User');

// Role limits configuration
const ROLE_LIMITS = {
  'user': 25,
  'admin': 35,
  'superAdmin': 50
};

const validateDomainLimit = async (req, res, next) => {
  try {
    const websites = req.body.domains;
    
    // Validate input
    if (!websites) {
      return res.status(400).json({
        success: false,
        message: "Please provide domains array.",
      });
    }

    if (!Array.isArray(websites)) {
      return res.status(400).json({
        success: false,
        message: "Domains must be an array.",
      });
    }

    if (websites.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one domain.",
      });
    }

    // Get user from database (already attached by auth middleware)
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Get user role and max limit
    const userRole = user.role || 'user';
    const maxDomains = ROLE_LIMITS[userRole] || 25;

    // Validate domain count
    if (websites.length > maxDomains) {
      return res.status(403).json({
        success: false,
        message: `Your role (${userRole}) allows a maximum of ${maxDomains} domains per request. You attempted to process ${websites.length} domains.`,
        limit: maxDomains,
        role: userRole,
        attempted: websites.length,
        allowed: false,
      });
    }

    // Attach limit info to request for later use
    req.maxDomains = maxDomains;
    req.userRole = userRole;
    req.validDomainCount = websites.length;
    
    next();
  } catch (error) {
    console.error('Domain Limit Validation Error:', error);
    res.status(500).json({
      success: false,
      message: "Error validating domain limit",
      error: error.message,
    });
  }
};

// Helper function to get user's domain limit
const getUserDomainLimit = (role) => {
  return ROLE_LIMITS[role] || 25;
};

// Helper function to get all role limits
const getRoleLimits = () => {
  return ROLE_LIMITS;
};

module.exports = {
  validateDomainLimit,
  getUserDomainLimit,
  getRoleLimits,
  ROLE_LIMITS
};