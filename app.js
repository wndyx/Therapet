// Imports
require('dotenv').config(); // Load environment variables
const express = require('express');
const mongoose = require('./db'); // Import database connection
const bcrypt = require('bcryptjs');
const session = require('express-session');
const { OpenAI } = require('openai'); // Updated Import for OpenAI SDK v4.x
const User = require('./models/User'); // Import User model
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from "public" folder

// Configure sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'yourSecretKey', // Use environment variable
    resave: false,
    saveUninitialized: false, // Only create a session if needed
    cookie: { secure: false }, // Use true only in production with HTTPS
  })
);

// Check if the API key is loaded
if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is not set. Please check your .env file.');
  process.exit(1); // Exit the application if the key is missing
}

// OpenAI API configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure your API key is set in the environment variables
});

// Define the system prompt for the therapist persona
const systemPrompt = `You are Therapets, a compassionate and empathetic virtual therapist. Your role is to provide emotional support, active listening, and gentle guidance to users seeking help with their feelings and challenges. Maintain a professional and respectful tone, avoid giving medical advice, and encourage users to seek professional help when necessary.`;

// Helper function to call OpenAI API
async function getChatbotResponse(userId, userMessage) {
  try {
    // Retrieve user's chat history
    const user = await User.findById(userId);
    const chatHistory = user.chat_history || [];

    // Prepare messages for OpenAI API with system prompt
    const messages = [
      { role: 'system', content: systemPrompt }, // System prompt to define AI behavior
      ...chatHistory.map((entry) => ({
        role: entry.is_user ? 'user' : 'assistant',
        content: entry.message,
      })),
      { role: 'user', content: userMessage }, // Latest user message
    ];


    // Add the new user message
    messages.push({ role: 'user', content: userMessage });

    // Make the API call using the updated SDK method
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Use 'gpt-4' if you have access
      messages: messages,
      max_tokens: 150,
      temperature: 0.7,
    });

    const botResponse = response.choices[0].message.content.trim();
    return botResponse;
  } catch (error) {
    console.error('Error generating response:', error.response?.data || error.message);
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
      return res.status(400).json({ success: false, message: 'Username or email already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user document with default values from the schema
    const user = new User({
      username,
      email,
      password: hashedPassword,
      chat_history: [],
      conditions: [],
      avatarConfig: {
        animalType: 'dog',
        color: 'brown',
        eyeColor: 'brown',
        accessory: '',
      },
    });
    await user.save();

    res.status(201).json({ success: true, message: 'Sign-up successful! Please log in.' });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ success: false, message: 'Error during signup' });
  }
});

// Login Route
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Compare the provided password with the stored hashed password
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      req.session.userId = user._id; // Set session userId on successful login
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ success: false, message: 'Error saving session' });
        }
        res.status(200).json({ success: true, message: 'Login successful' });
      });
    } else {
      res.status(401).json({ success: false, message: 'Incorrect password' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ success: false, message: 'Error during login' });
  }
});

// Route to retrieve avatar settings
app.get('/api/user/avatar', async (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized. Please log in.' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only send the avatarConfig
    const avatarConfig = user.avatarConfig || {};
    res.status(200).json(avatarConfig);
  } catch (error) {
    console.error('Error retrieving avatar config:', error);
    res.status(500).json({ message: 'Error retrieving avatar config' });
  }
});

// Route to save avatar settings
app.post('/api/user/avatar/save', async (req, res) => {
  const userId = req.session.userId;
  const { avatarConfig } = req.body; // Get avatarConfig from the request body

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized. Please log in.' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the user's avatar configuration
    user.avatarConfig = {
      animalType: avatarConfig.animalType || user.avatarConfig.animalType,
      color: avatarConfig.color || user.avatarConfig.color,
      eyeColor: avatarConfig.eyeColor || user.avatarConfig.eyeColor,
      accessory: avatarConfig.accessory || user.avatarConfig.accessory,
    };
    await user.save();

    res.status(200).json({ message: 'Avatar saved successfully', avatarConfig: user.avatarConfig });
  } catch (error) {
    console.error('Error saving avatar:', error);
    res.status(500).json({ message: 'Error saving avatar', error });
  }
});

// Route to get user conditions
app.get('/api/user/conditions', async (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized. Please log in.' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ conditions: user.conditions });
  } catch (error) {
    console.error('Error retrieving conditions:', error);
    res.status(500).json({ message: 'Error retrieving conditions' });
  }
});

// Route to save user conditions
app.post('/api/user/conditions/save', async (req, res) => {
  const userId = req.session.userId;
  const { conditions } = req.body; // Get conditions from the request body

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized. Please log in.' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the user's conditions
    user.conditions = conditions;
    await user.save();

    res.status(200).json({ message: 'Conditions saved successfully', conditions: user.conditions });
  } catch (error) {
    console.error('Error saving conditions:', error);
    res.status(500).json({ message: 'Error saving conditions', error });
  }
});

// Chat Message Route with OpenAI API integration
app.post('/api/message', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' });
  }

  const { message } = req.body;
  try {
    const user = await User.findById(req.session.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Get the bot's response from OpenAI API
    const botResponse = await getChatbotResponse(user._id, message);

    // Update chat history with timestamp
    user.chat_history.push({ message, is_user: true, timestamp: new Date() });
    user.chat_history.push({ message: botResponse, is_user: false, timestamp: new Date() });
    await user.save();

    res.status(200).json({ userMessage: message, botResponse });
  } catch (error) {
    console.error('Error handling message:', error);
    res.status(500).json({ error: 'Error processing message' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
