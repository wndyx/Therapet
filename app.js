// app.js
const express = require('express');
const mongoose = require('./db'); // Connects to MongoDB
const Character = require('./models/Character');
const User = require('./models/User');

const app = express();
app.use(express.json());

// Endpoint to start a new chat session
app.post('/api/start-session', async (req, res) => {
    const { username, character_id } = req.body;
    const user = new User({ username, character: character_id, chat_history: [] });
    await user.save();
    res.json(user);
});

// Endpoint for user messages
app.post('/api/message', async (req, res) => {
    const { userId, message } = req.body;
    const user = await User.findById(userId);
    const character = await Character.findById(user.character);

    // Respond based on the pet's responses (simple random selection for now)
    const response = character.responses[Math.floor(Math.random() * character.responses.length)];

    // Update chat history
    user.chat_history.push({ message, is_user: true });
    user.chat_history.push({ message: response, is_user: false });
    await user.save();

    res.json({ userMessage: message, botResponse: response });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
