// routes/user.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/avatar/save', async (req, res) => {
    const { userId, avatarConfig } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });
        user.avatarConfig = avatarConfig;
        await user.save();
        res.status(200).json({ message: "Avatar saved successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to save avatar", error });
    }
});

router.get('/:userId/avatar', async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json({ avatarConfig: user.avatarConfig });
    } catch (error) {
        res.status(500).json({ message: "Failed to retrieve avatar", error });
    }
});

module.exports = router;
