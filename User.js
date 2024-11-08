// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    character: String,
    chat_history: [
        {
            message: String,
            is_user: Boolean,
            timestamp: { type: Date, default: Date.now }
        }
    ]
});

module.exports = mongoose.model('User', userSchema);
