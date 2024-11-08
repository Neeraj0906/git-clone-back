const express = require('express');
const { registerUser,loginUser,forgotPassword, resetPassword } = require('../controllers/authController');
const router = express.Router();
const rateLimit = require('express-rate-limit');

// Apply rate limiting to registration and login routes
const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: 'Too many accounts created from this IP, please try again later.'
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: 'Too many login attempts from this IP, please try again later.'
});

router.post('/register', registerLimiter, registerUser); 
router.post('/login', loginLimiter, loginUser);
// router.post('/register', registerUser); // Registration route
// router.post('/login', loginUser); // Login route
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword); // Ensure this is defined as POST

module.exports = router;