const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    _id: { type: String },  // Explicitly define _id as a String type
    password: String,
    chat_history: [
        {
            message: String,
            is_user: Boolean
        }
    ],
    conditions: [String],  // Array for user's mental health conditions

    // Avatar customization settings
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
