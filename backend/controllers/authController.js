const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { username, email, password, healthProfile, sensitivity } = req.body;

    // Validation
    if (!username || !email || !password || !healthProfile || !sensitivity) {
      return res.status(400).json({
        message: 'Please provide all required fields',
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        message: 'User already exists with this email',
      });
    }

    // Check if username exists
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({
        message: 'Username already taken',
      });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      healthProfile,
      sensitivity,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        healthProfile: user.healthProfile,
        sensitivity: user.sensitivity,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({
        message: 'Invalid user data',
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Server error during registration',
    });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        message: 'Please provide email and password',
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        healthProfile: user.healthProfile,
        sensitivity: user.sensitivity,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({
        message: 'Invalid email or password',
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Server error during login',
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      healthProfile: user.healthProfile,
      sensitivity: user.sensitivity,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Server error',
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
};