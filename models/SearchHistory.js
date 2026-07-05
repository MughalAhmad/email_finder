const mongoose = require('mongoose');

const searchHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  domains: [{
    type: String,
    required: true
  }],
  totalDomains: {
    type: Number,
    required: true
  },
  totalEmailsFound: {
    type: Number,
    default: 0
  },
  successfulDomains: {
    type: Number,
    default: 0
  },
  failedDomains: {
    type: Number,
    default: 0
  },
  results: [{
    website: String,
    success: Boolean,
    totalEmails: Number,
    emails: [{
      email: String,
      verified: Boolean
    }],
    elapsed: Number
  }],
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  error: {
    type: String
  },
  processingTime: {
    type: Number // in seconds
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
searchHistorySchema.index({ userId: 1, createdAt: -1 });
searchHistorySchema.index({ status: 1 });
searchHistorySchema.index({ userId: 1, status: 1 });

// Static methods
searchHistorySchema.statics = {
  // Get recent searches for user
  getRecentSearches: function(userId, limit = 10) {
    return this.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'name email');
  },

  // Get search stats for user
  getStats: function(userId) {
    return this.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      { $group: {
        _id: null,
        totalSearches: { $sum: 1 },
        totalEmails: { $sum: '$totalEmailsFound' },
        totalDomains: { $sum: '$totalDomains' },
        avgProcessingTime: { $avg: '$processingTime' }
      }}
    ]);
  },

  // Get success rate
  getSuccessRate: function(userId) {
    return this.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      { $group: {
        _id: null,
        total: { $sum: 1 },
        successful: { 
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        }
      }},
      { $project: {
        successRate: { 
          $multiply: [{ $divide: ['$successful', '$total'] }, 100] 
        }
      }}
    ]);
  }
};

// Instance methods
searchHistorySchema.methods = {
  // Mark as completed
  markCompleted: function(results) {
    this.status = 'completed';
    this.results = results;
    this.completedAt = new Date();
    this.processingTime = (this.completedAt - this.createdAt) / 1000;
    
    // Update stats
    this.totalEmailsFound = results.reduce((sum, r) => sum + r.totalEmails, 0);
    this.successfulDomains = results.filter(r => r.success).length;
    this.failedDomains = results.filter(r => !r.success).length;
    
    return this.save();
  },

  // Mark as failed
  markFailed: function(error) {
    this.status = 'failed';
    this.error = error;
    this.completedAt = new Date();
    this.processingTime = (this.completedAt - this.createdAt) / 1000;
    return this.save();
  }
};

const SearchHistory = mongoose.model('SearchHistory', searchHistorySchema);

module.exports = SearchHistory;