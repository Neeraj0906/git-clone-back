const User = require('../models/User');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs'); // Add this line at the top of your file

exports.registerUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("Request body:", req.body);

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        console.log("Existing user:", existingUser);

        if (existingUser) {
            return res.status(400).send({ error: 'User already exists' });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({
            email,
            password: hashedPassword,
        });

        await newUser.save();
        res.status(201).send({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
};
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).send({ error: 'Invalid credentials' });
        }

        // Check if the password is correct
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).send({ error: 'Invalid credentials' });
        }

        // Successful login (you can implement JWT here for token-based authentication)
        res.send({ message: 'Login successful', userId: user._id });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).send({ error: 'User not found' });

    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiry

    await user.save();

    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        to: user.email,
        subject: 'Password Reset',
        text: `Please click on the following link to reset your password: https://password-3-o.vercel.app/resetpassword/${token}`,
    };

    transporter.sendMail(mailOptions, (err) => {
        if (err) return res.status(500).send({ error: 'Error sending email' });
        res.send({ message: 'Reset link sent to your email' });
    });
};

exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) return res.status(400).send({ error: 'Invalid or expired token' });

        // Hash new password using bcrypt
        user.password = await bcrypt.hash(password, 10); // Ensure bcrypt is defined here
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();
        
        res.send({ message: 'Password has been reset successfully' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
};