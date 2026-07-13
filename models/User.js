const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'superAdmin'],
        default: 'user'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    appPassword: {
        type: String,
        default: ''
    },
    domains:{
        type: Number,
        default: 0
    },
    emails:{
        type: Number,
        default: 0
    },
    sendEmails:{
        type: Number,
        default: 0
    },
    lastLogin: {
        type: Date
    }
}, {
    timestamps: true
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function() {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
        { id: this._id, email: this.email, role: this.role },
        process.env.JWT_SECRET || 'default_secret_key',
        { expiresIn: '7d' }
    );
};

// Update last login
userSchema.statics.updateLastLogin = async function(userId) {
    return await this.findByIdAndUpdate(userId, { lastLogin: new Date() });
};

// Static method to create user with hashed password
userSchema.statics.createUser = async function(userData) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    
    const user = new this({
        ...userData,
        password: hashedPassword
    });
    
    return await user.save();
};

const User = mongoose.model('User', userSchema);
module.exports = User;