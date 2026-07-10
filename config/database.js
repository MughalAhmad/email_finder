// const mongoose = require("mongoose");
// const User = require('../models/User')


// const dataBaseConfig = async () => {

//     let mongoUrl = process.env.MONGODB_URI;
//     // if (process.env.NODE_ENV === 'production') {
//     //     mongoUrl = process.env.MONGO_CLOUD_URL;
//     // }

//     return await new Promise(resolve => {
//         mongoose.connect(mongoUrl)
//             .then(async (data) => {
//                 if (process.env.NODE_ENV === 'production') {
//                     console.log(`Production Database connected on port: ${data.connection.port}`);
//                 } else {
//                     console.log(`Development Database connected on port: ${data.connection.port}`);
//                 }
//                 await createDefaultUser();
//                 resolve({ err: null })
//             }).catch((err) => {
//                 resolve({ err: err })
//             });

//     })
// }
// module.exports = dataBaseConfig;


// async function createDefaultUser() {
//     const defaultUser = {
//         fullName: "Admin Admin",
//         email: "Contact@conqueror.ae",
//         password: "Conq@2023",
//         isActive: true,
//         updatedAt: new Date(),
//         createdAt: new Date(),
//     };
//     const existingUser = await User.find();

//     if (existingUser.length === 0) {
//         await User.create(defaultUser);
//         console.log('Default User created.');
//     } else {
//         console.log('User already exists.');
//     }
// }


// const mongoose = require("mongoose");
// const User = require('../models/User');

// const dataBaseConfig = async () => {
//     const mongoUrl = process.env.MONGODB_URI;

//     if (!mongoUrl) {
//         console.error('MONGODB_URI is not defined in environment variables');
//         return { err: new Error('MONGODB_URI is not defined') };
//     }

//     try {
//         // Add connection options for better reliability
//         const connectionOptions = {
//             useNewUrlParser: true,
//             useUnifiedTopology: true,
//             serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
//             socketTimeoutMS: 45000,
//         };

//         const data = await mongoose.connect(mongoUrl, connectionOptions);
        
//         console.log(`Database connected successfully`);
//         console.log(`Host: ${data.connection.host}`);
//         console.log(`Port: ${data.connection.port}`);
//         console.log(`Database: ${data.connection.name}`);
        
//         await createDefaultUser();
//         return { err: null };
        
//     } catch (err) {
//         console.error('Database connection error:', err.message);
        
//         // Provide helpful error messages
//         if (err.message.includes('ECONNREFUSED')) {
//             console.error('Connection refused. Check if:');
//             console.error('1. Your IP is whitelisted in MongoDB Atlas');
//             console.error('2. The connection string is correct');
//             console.error('3. Your network allows outbound connections to MongoDB Atlas');
//         } else if (err.message.includes('Authentication failed')) {
//             console.error('Authentication failed. Check username and password');
//         }
        
//         return { err };
//     }
// };

// module.exports = dataBaseConfig;

// async function createDefaultUser() {
//     try {
//         const defaultUser = {
//             fullName: "Admin Admin",
//             email: "Contact@conqueror.ae",
//             password: "Conq@2023", // You should hash this password!
//             isActive: true,
//             updatedAt: new Date(),
//             createdAt: new Date(),
//         };
        
//         const existingUser = await User.findOne({ email: defaultUser.email });
        
//         if (!existingUser) {
//             await User.create(defaultUser);
//             console.log('Default User created successfully.');
//         } else {
//             console.log('Default user already exists.');
//         }
//     } catch (error) {
//         console.error('Error creating default user:', error.message);
//     }
// }


// const mongoose = require("mongoose");
// const User = require('../models/User');

// const dataBaseConfig = async () => {
//     const mongoUrl = process.env.MONGODB_URI;

//     if (!mongoUrl) {
//         console.error('MONGODB_URI is not defined');
//         return { err: new Error('MONGODB_URI is not defined') };
//     }

//     try {
//         // Simple connection - no deprecated options
//         await mongoose.connect(mongoUrl);
        
//         console.log('✅ Database connected successfully');
//         console.log(`📊 Database: ${mongoose.connection.name}`);
        
//         await createDefaultUser();
//         return { err: null };
        
//     } catch (err) {
//         console.error('❌ Database connection error:', err.message);
//         return { err };
//     }
// };

// module.exports = dataBaseConfig;

// async function createDefaultUser() {
//     try {
//         const defaultUser = {
//             fullName: "Admin Admin",
//             email: "Contact@conqueror.ae",
//             password: "Conq@2023",
//             isActive: true,
//             updatedAt: new Date(),
//             createdAt: new Date(),
//         };
        
//         const existingUser = await User.findOne({ email: defaultUser.email });
        
//         if (!existingUser) {
//             await User.create(defaultUser);
//             console.log('✅ Default User created.');
//         } else {
//             console.log('ℹ️ Default user already exists.');
//         }
//     } catch (error) {
//         console.error('Error creating default user:', error.message);
//     }
// }



// database.js - Complete working version
const mongoose = require("mongoose");
const User = require('../models/User');

// Force IPv4 for DNS resolution - ADD THIS AT THE TOP
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const dataBaseConfig = async () => {
    // Use the exact same string that works in Compass
    const mongoUrl = process.env.MONGODB_URI;
    
    // Make sure it has the appName parameter
    // mongodb+srv://ahmadkhurshed311:nqXojhnp1d8gkzm6@cluster0.p4onj.mongodb.net/GP?retryWrites=true&w=majority&appName=Cluster0

    if (!mongoUrl) {
        console.error('❌ MONGODB_URI is not defined');
        return { err: new Error('MONGODB_URI is not defined') };
    }

    console.log('🔄 Connecting to MongoDB Atlas...');
    console.log(`📡 Using: ${mongoUrl.split('@')[0].substring(0, 30)}...@${mongoUrl.split('@')[1]}`);

    try {
        // Only use these options for Mongoose v7+
        const connectionOptions = {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            // Force IPv4 and other network settings
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
        
        // Enhanced error logging
        if (err.message.includes('querySrv ECONNREFUSED')) {
            console.error('\n🔧 FIX: DNS resolution failed. Try these solutions:');
            console.error('1️⃣ Add this to the TOP of server.js:');
            console.error('   const dns = require("dns");');
            console.error('   dns.setDefaultResultOrder("ipv4first");');
            console.error('2️⃣ Or try using the standard connection string (not SRV)');
            console.error('3️⃣ Check your internet connection and firewall');
        }
        
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
            updatedAt: new Date(),
            createdAt: new Date(),
        };
        
        const existingUser = await User.findOne({ email: defaultUser.email });
        
        if (!existingUser) {
            await User.create(defaultUser);
            console.log('✅ Default User created successfully.');
        } else {
            console.log('ℹ️ Default user already exists.');
        }
    } catch (error) {
        console.error('❌ Error creating default user:', error.message);
    }
}