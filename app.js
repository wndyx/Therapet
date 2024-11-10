const express = require('express');
const mongoose = require('./db'); // Import database connection
const bcrypt = require('bcryptjs');
const session = require('express-session');
const User = require('./models/User'); // Import User model

const app = express();
app.use(express.json());
app.use(express.static('public')); // Serve static files from "public" folder

// Configure sessions
app.use(session({
    secret: 'yourSecretKey', // Replace with a secure secret in production
    resave: false,
    saveUninitialized: false, // Only create a session if needed
    cookie: { secure: false } // Use true only in production with HTTPS
}));

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

// Sign Up Route with Email
app.post('/api/signup', async (req, res) => {
    const { email, username, password } = req.body;

    // Check if user already exists by email or username
    const userExists = await User.findOne({ $or: [{ username }, { email }] });
    if (userExists) return res.json({ message: "Username or email already exists" });

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user document with username as a separate field
    const user = new User({ username, email, password: hashedPassword, chat_history: [] });
    await user.save();

    res.json({ message: "Sign-up successful! Please log in." });
});


// Login Route
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find the user by username
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: "User not found" });

        // Compare the provided password with the stored hashed password
        const match = await bcrypt.compare(password, user.password);
        if (match) {
            req.session.userId = user._id; // Set session userId on successful login
            res.status(200).json({ success: true, message: "Login successful", userId: user._id });
        } else {
            res.status(401).json({ success: false, message: "Incorrect password" });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: "Error during login" });
    }
});


// Protected Chat Message Route
app.post('/api/message', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    const { message } = req.body;
    try {
        const user = await User.findById(req.session.userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        // Use getConsolingResponse to analyze the user's message and respond
        const response = getConsolingResponse(message);

        // Update chat history
        user.chat_history.push({ message, is_user: true });
        user.chat_history.push({ message: response, is_user: false });
        await user.save();

        res.status(200).json({ userMessage: message, botResponse: response });
    } catch (error) {
        console.error('Error handling message:', error);
        res.status(500).json({ message: "Error processing message" });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
