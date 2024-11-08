const express = require('express');
const mongoose = require('./db');
const Character = require('./models/Character');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Predefined Responses for Different Emotions
const consolingResponses = {
    sad: [
        "I'm sorry you're feeling this way. I'm here to listen.",
        "It's okay to feel sad sometimes. Take all the time you need.",
        "Remember, you're not alone. I'm here to talk whenever you need."
    ],
    stressed: [
        "It sounds like you're feeling overwhelmed. Try taking a few deep breaths.",
        "Stress can be tough. Remember to take things one step at a time.",
        "Sometimes, it helps to take a break and do something relaxing."
    ],
    anxious: [
        "Anxiety can be overwhelming, but I'm here to help you through it.",
        "Try focusing on your breathing for a moment. I'm here with you.",
        "Remember, these feelings will pass. I'm here to support you."
    ],
    neutral: [
        "I'm here for you! Tell me what's on your mind.",
        "How are you feeling today?",
        "Let's talk about whatever is on your mind."
    ]
};

// Function to analyze the user's message and respond accordingly
function getConsolingResponse(message) {
    const loweredMessage = message.toLowerCase();
    if (loweredMessage.includes("sad") || loweredMessage.includes("upset") || loweredMessage.includes("depressed")) {
        return consolingResponses.sad[Math.floor(Math.random() * consolingResponses.sad.length)];
    } else if (loweredMessage.includes("stress") || loweredMessage.includes("overwhelmed")) {
        return consolingResponses.stressed[Math.floor(Math.random() * consolingResponses.stressed.length)];
    } else if (loweredMessage.includes("anxious") || loweredMessage.includes("nervous")) {
        return consolingResponses.anxious[Math.floor(Math.random() * consolingResponses.anxious.length)];
    } else {
        return consolingResponses.neutral[Math.floor(Math.random() * consolingResponses.neutral.length)];
    }
}

// Sign Up Route
app.post('/api/signup', async (req, res) => {
    const { username, password } = req.body;
    const userExists = await User.findById(username);
    if (userExists) return res.json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ _id: username, password: hashedPassword, chat_history: [] });
    await user.save();
    res.json({ message: "Sign-up successful! Please log in." });
});

// Login Route
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findById(username);
    if (!user) return res.json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (match) {
        res.json({ success: true, userId: user._id });
    } else {
        res.json({ success: false, message: "Incorrect password" });
    }
});

// Chat Message Route
app.post('/api/message', async (req, res) => {
    const { userId, message } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Use getConsolingResponse to analyze the user's message and respond
    const response = getConsolingResponse(message);

    // Update chat history
    user.chat_history.push({ message, is_user: true });
    user.chat_history.push({ message: response, is_user: false });
    await user.save();

    res.json({ userMessage: message, botResponse: response });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
