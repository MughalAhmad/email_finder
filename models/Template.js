const mongoose = require("mongoose");

const templateSchema = new mongoose.Schema({
    userId:{
        type: Object,
        required: false,
    },
    title: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    body: {
        type: String,
        default: false
    },
    status:{
        type: String,
        default:true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: null
    },
});

module.exports = new mongoose.model("template", templateSchema);