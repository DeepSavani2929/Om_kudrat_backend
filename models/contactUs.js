const mongoose = require("mongoose");

const contactUsSchema = new mongoose.Schema({
    customerName: {
        type: String,
        required: true
    },

    customerEmail:{
        type: String, 
        required: true,
        unique: true
    },

    question: {
        type: String,
        required: true
    }

}, { timestamps: true})

const contactUs = mongoose.model("contactUs", contactUsSchema)
module.exports = contactUs;