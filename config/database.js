const mongoose = require("mongoose");
const User = require('../models/User')


const dataBaseConfig = async () => {

    let mongoUrl = process.env.MONGODB_URI;
    // if (process.env.NODE_ENV === 'production') {
    //     mongoUrl = process.env.MONGO_CLOUD_URL;
    // }

    return await new Promise(resolve => {
        mongoose.connect(mongoUrl)
            .then(async (data) => {
                if (process.env.NODE_ENV === 'production') {
                    console.log(`Production Database connected on port: ${data.connection.port}`);
                } else {
                    console.log(`Development Database connected on port: ${data.connection.port}`);
                }
                await createDefaultUser();
                resolve({ err: null })
            }).catch((err) => {
                resolve({ err: err })
            });

    })
}
module.exports = dataBaseConfig;


async function createDefaultUser() {
    const defaultUser = {
        fullName: "Admin Admin",
        email: "Contact@conqueror.ae",
        password: "Conq@2023",
        isActive: true,
        updatedAt: new Date(),
        createdAt: new Date(),
    };
    const existingUser = await User.find();

    if (existingUser.length === 0) {
        await User.create(defaultUser);
        console.log('Default User created.');
    } else {
        console.log('User already exists.');
    }
}