// models/Character.js
const mongoose = require('mongoose');

const characterSchema = new mongoose.Schema({
    _id: String,
    name: String,
    personality: String,
    image_url: String,
    responses: [String]
});

module.exports = mongoose.model('Character', characterSchema);
