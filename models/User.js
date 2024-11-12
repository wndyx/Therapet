// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true }, // Unique username field
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // Detailed chat history schema
    chat_history: [
        {
            message: { type: String, required: true },
            is_user: { type: Boolean, required: true },
            timestamp: { type: Date, default: Date.now }
        }
    ],

    // Array of conditions the user has selected
    conditions: { type: [String], default: [] },

    // User's avatar customization settings with renamed field
    avatarConfig: {
        animalType: { type: String, default: "dog" },  // Renamed from `type` to `animalType`
        color: { type: String, default: "brown" },
        eyeColor: { type: String, default: "brown" },
        accessory: { type: String, default: "" }
    }
});

module.exports = mongoose.model('User', userSchema);
