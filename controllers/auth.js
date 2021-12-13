const asyncHandler = require('../middleware/asyncHandler')
const ErrorResponse = require('../utils/errorResponse')
const User = require('../models/User')

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body

  const user = await User.create({ name, email, password, role })

  const token = user.getSignedJwtToken()

  res.status(200).json({ success: true, token })
})

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400))
  }

  const user = await User.findOne({ email }).select('+password')

  // Check for user
  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401))
  }

  const isMatch = await user.isMatch(password)

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401))
  }

  // Create token
  const token = user.getSignedJwtToken()

  res.status(200).json({
    success: true,
    token,
  })
})

// ** NOTES **
// 48.1 User Login
// 48.1.1. .select('+password') <- to compare password
