// Imports
const express = require('express');
const mongoose = require('./db'); // Import database connection
const bcrypt = require('bcryptjs');
const session = require('express-session');
const axios = require('axios'); // Add axios for API requests
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

// Hugging Face API configuration
const HUGGING_FACE_API_KEY = ''; // Replace with your Hugging Face API key
const MODEL_NAME = 'gpt2';


// Helper function to call Hugging Face API
async function getChatbotResponse(prompt) {
    try {
        const response = await axios({
            method: 'post',
            url: `https://api-inference.huggingface.co/models/${MODEL_NAME}`,
            headers: {
                'Authorization': `Bearer ${HUGGING_FACE_API_KEY}`,
                'Content-Type': 'application/json'
            },
            data: { inputs: prompt, parameters: { max_length: 100 } }
        });
        const generatedText = response.data.generated_text || response.data[0]?.generated_text;
        return generatedText || "I'm having trouble generating a response. Could you try rephrasing?";
    } catch (error) {
        console.error("Error generating response:", error.response?.data || error.message);
        return "I'm having trouble generating a response. Could you try rephrasing?";
    }
}

// Sign Up Route with Email
app.post('/api/signup', async (req, res) => {
    const { email, username, password } = req.body;

    try {
        // Check if user already exists by email or username
        const userExists = await User.findOne({ $or: [{ username }, { email }] });
        if (userExists) {
            return res.status(400).json({ success: false, message: "Username or email already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user document with chat_history initialized as an empty array
        const user = new User({ username, email, password: hashedPassword, chat_history: [] });
        await user.save();

        res.status(201).json({ success: true, message: "Sign-up successful! Please log in." });
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ success: false, message: "Error during signup" });
    }
});

// Login Route
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Compare provided password with stored hashed password
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ success: false, message: "Incorrect password" });
        }

        // Set session userId on successful login
        req.session.userId = user._id;
        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                return res.status(500).json({ success: false, message: "Error saving session" });
            }
            res.status(200).json({ success: true, message: "Login successful" });
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ success: false, message: "Error during login" });
    }
});

// Chat Message Route with Hugging Face API integration
app.post('/api/message', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    const { message } = req.body;
    try {
        const user = await User.findById(req.session.userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        const botResponse = await getChatbotResponse(message);
        user.chat_history.push({ message, is_user: true });
        user.chat_history.push({ message: botResponse, is_user: false });
        await user.save();

        res.status(200).json({ userMessage: message, botResponse });
    } catch (error) {
        console.error('Error handling message:', error);
        res.status(500).json({ error: "Error processing message" });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
