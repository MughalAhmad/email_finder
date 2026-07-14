const rateLimit = require('express-rate-limit');
const { ROLE_LIMITS } = require('./domainLimit');

// Role-based rate limiting configuration
const RATE_LIMITS = {
  'user': {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 requests per hour
    message: 'Too many requests. User role allows 10 requests per hour.'
  },
  'admin': {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 25, // 25 requests per hour
    message: 'Too many requests. Admin role allows 25 requests per hour.'
  },
  'superAdmin': {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // 50 requests per hour
    message: 'Too many requests. Superadmin role allows 50 requests per hour.'
  }
};

const createRateLimiter = (role = 'user') => {
  const config = RATE_LIMITS[role] || RATE_LIMITS['user'];
  
  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    message: {
      success: false,
      message: config.message,
      role: role,
      limit: config.max,
      window: config.windowMs / 1000 / 60, // minutes
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    keyGenerator: (req) => {
      // Use user ID if available, otherwise IP
      return req.user?.id || req.ip;
    },
    skip: (req) => {
      // Skip rate limiting for superadmin if needed
      // return req.user?.role === 'superadmin';
      return false;
    }
  });
};

// Dynamic rate limiter middleware
const dynamicRateLimiter = (req, res, next) => {
  const role = req.user?.role || 'user';
  const limiter = createRateLimiter(role);
  return limiter(req, res, next);
};

module.exports = {
  createRateLimiter,
  dynamicRateLimiter,
  RATE_LIMITS
};