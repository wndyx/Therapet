// Imports
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



// Sign Up Route with Email
app.post('/api/signup', async (req, res) => {
    const { email, username, password } = req.body;

    try {
        // Check if user already exists by email or username
        const userExists = await User.findOne({ $or: [{ username }, { email }] });
        if (userExists) {
            return res.json({ success: false, message: "Username or email already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user document with username as a separate field
        const user = new User({ username, email, password: hashedPassword, chat_history: [] });
        await user.save();

        res.json({ success: true, message: "Sign-up successful! Please log in." });
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ success: false, message: "Error during signup" });
    }
});

// Login Route
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find the user by username
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

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
        res.status(500).json({ success: false, message: "Error during login" });
    }
});

// Helper function to create a dynamic prompt based on conditions
function getDynamicPrompt(userMessage, userConditions) {
    if (userConditions.length === 0) {
        return `Respond with empathy: "${userMessage}"`;
    }

    // Customize prompt based on conditions
    let conditionDescriptions = userConditions.map(condition => {
        return `Respond as a supportive counselor to someone dealing with ${condition}`;
    }).join(", ");

    return `${conditionDescriptions}. Their message: "${userMessage}"`;
}

// Helper function to call the Python script for generating responses
function getChatResponse(prompt) {
    return new Promise((resolve, reject) => {
        exec(`python3 generate_response.py "${prompt}"`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing Python script: ${stderr}`);
                reject("I'm having trouble understanding. Could you rephrase that?");
            } else {
                try {
                    const { response } = JSON.parse(stdout);
                    resolve(response);
                } catch (parseError) {
                    console.error(`Error parsing response: ${parseError}`);
                    reject("I'm having trouble understanding. Could you rephrase that?");
                }
            }
        });
    });
}

// Chat Message Route with Dynamic Prompt
app.post('/api/message', async (req, res) => {
    const { userId, message } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const userConditions = user.conditions;

    // Generate a dynamic prompt based on the user's conditions
    const prompt = getDynamicPrompt(message, userConditions);
    
    // Generate response using the model with the custom prompt
    try {
        const botResponse = await getChatResponse(prompt);

        // Update chat history
        user.chat_history.push({ message, is_user: true });
        user.chat_history.push({ message: botResponse, is_user: false });
        await user.save();

        res.json({ userMessage: message, botResponse });
    } catch (error) {
        res.status(500).json({ error: 'Failed to process message' });
    }
});

// Save Avatar Route
app.post('/api/user/avatar/save', async (req, res) => {
    const { userId, avatarConfig } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.avatarConfig = avatarConfig;
        await user.save();

        res.status(200).json({ message: "Avatar saved successfully", avatarConfig });
    } catch (error) {
        res.status(500).json({ message: "Error saving avatar", error });
    }
});

// Get Avatar Route
app.get('/api/user/:userId/avatar', async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ avatarConfig: user.avatarConfig });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving avatar", error });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
