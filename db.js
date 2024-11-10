const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Replace "<database-name>" with the actual database you want to connect to
mongoose.connect("mongodb+srv://kareenamehta:Pohkee123@firstcluster.wmuhn.mongodb.net/<UsersDatabase>?retryWrites=true&w=majority")
    .then(() => {
        console.log("Connected to MongoDB!");
    })
    .catch(err => {
        console.error("MongoDB connection error:", err);
    });

module.exports = mongoose;
