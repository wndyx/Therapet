// app.js
const express = require('express');
const session = require('express-session');
const mongoose = require('./db');
const path = require('path');
const User = require('./models/User'); // Import models as needed
const Character = require('./models/Character'); // Import models as needed
const userRoutes = require('./routes/user'); // Route file

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve frontend files

// Configure sessions
app.use(session({
    secret: process.env.SESSION_SECRET || 'yourSecretKey',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// API Routes
app.use('/api/user', userRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
