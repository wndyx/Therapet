// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    _id: String,
    password: String,
    chat_history: [
        {
            message: String,
            is_user: Boolean
        }
    ],
    conditions: [String],
    avatarConfig: {
        type: Object,
        default: {
            type: "dog",
            color: "white",
            eyeColor: "blue",
            accessory: null,
        },
    },
});

module.exports = mongoose.model('User', userSchema);
