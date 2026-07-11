const mongoose = require("mongoose");
const User = require('../models/User');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const dataBaseConfig = async () => {
    const mongoUrl = process.env.MONGODB_URI;

    if (!mongoUrl) {
        console.error('❌ MONGODB_URI is not defined');
        return { err: new Error('MONGODB_URI is not defined') };
    }

    console.log('🔄 Connecting to MongoDB Atlas...');
    
    try {
        const connectionOptions = {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            family: 4,
        };

        const data = await mongoose.connect(mongoUrl, connectionOptions);
        
        console.log('✅ Database connected successfully');
        console.log(`📊 Database: ${data.connection.name}`);
        console.log(`📍 Host: ${data.connection.host}`);
        
        await createDefaultUser();
        return { err: null };
        
    } catch (err) {
        console.error('❌ Database connection error:', err.message);
        return { err };
    }
};

module.exports = dataBaseConfig;

async function createDefaultUser() {
    try {
        const defaultUser = {
            fullName: "Admin Admin",
            email: "ahmad@gmail.com",
            password: "Ics.43719",
            isActive: true,
            role: 'superAdmin',
            appPassword: '',
        };
        
        // Check if user exists
        const existingUser = await User.findOne({ email: defaultUser.email });
        
        if (!existingUser) {
            // Method 1: Using new User() and save()
            const user = new User(defaultUser);
            // await user.save;
            
            // Method 2: Using create() - also works
            await User.create(defaultUser);
            
            console.log('✅ Default Super Admin created successfully.');
            console.log(`📧 Email: ${defaultUser.email}`);
            console.log(`🔑 Password: ${defaultUser.password}`);
        } else {
            console.log('ℹ️ Default user already exists.');
        }
    } catch (error) {
        console.error('❌ Error creating default user:', error.message);
        console.error('Stack:', error.stack);
    }
}