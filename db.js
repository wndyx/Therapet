//CONNECTING TO DATABASE

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Connected to MongoDB!");
    })
    .catch(err => {
        console.error("MongoDB connection error:", err);
    });

module.exports = mongoose;
