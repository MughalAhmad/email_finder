const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  domain: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  source: {
    type: String,
    enum: ['scraped', 'api', 'manual', 'imported'],
    default: 'scraped'
  },
  searchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SearchHistory'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for unique emails per user/domain
emailSchema.index({ userId: 1, email: 1 }, { unique: true });
emailSchema.index({ domain: 1 });
emailSchema.index({ verified: 1 });

// Static methods
emailSchema.statics = {
  // Find emails by user
  findByUser: function(userId) {
    return this.find({ userId }).sort({ createdAt: -1 });
  },

  // Find emails by domain
  findByDomain: function(userId, domain) {
    return this.find({ userId, domain });
  },

  // Count emails by user
  countByUser: function(userId) {
    return this.countDocuments({ userId });
  },

  // Count verified emails by user
  countVerifiedByUser: function(userId) {
    return this.countDocuments({ userId, verified: true });
  },

  // Bulk insert emails
  bulkInsert: async function(userId, emails) {
    const bulkOps = emails.map(email => ({
      updateOne: {
        filter: { userId, email: email.email },
        update: { 
          $set: { 
            ...email,
            userId,
            domain: email.domain || email.email.split('@')[1]
          }
        },
        upsert: true
      }
    }));
    return this.bulkWrite(bulkOps);
  }
};

const Email = mongoose.model('Email', emailSchema);

module.exports = Email;