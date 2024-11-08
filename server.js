const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
require('dotenv').config(); // Load environment variables from .env file

const app = express();
app.get('/', (req, res) => {
    res.send('Server is running');
  });
// Middleware to set Content Security Policy (CSP)
app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', "default-src 'none'; font-src 'self' http://localhost:5000;");
    next();
});

app.use(cors({origin:["http://localhost:5173","https://password-3-o.vercel.app"]}));
app.use(express.json());
app.use('/api/auth', authRoutes);

// MongoDB connection
const uri = process.env.MONGO_URI; // Ensure you have this in your .env file

mongoose.connect(uri)
    .then(() => {
        console.log('MongoDB connected successfully');
        app.listen(process.env.PORT || 5000, () => {
            console.log('Server running at port 5000...');
        });
    })
    .catch(err => console.error('MongoDB connection error:', err));
