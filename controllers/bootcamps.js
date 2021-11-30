const Bootcamp = require('../models/Bootcamp')

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = async (req, res, next) => {
  try {
    const bootcamps = await Bootcamp.find()
    res
      .status(200)
      .json({ success: true, count: bootcamps.length, data: bootcamps })
  } catch (err) {
    res.status(400).json({ success: false })
  }
}

// @desc    Get single bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findById(req.params.id)

    // for correctly formatted but doesn't exist
    if (!bootcamp) {
      return res.status(400).json({
        success: false,
        msg: `Bootcamp of id: ${req.params.id} not found`,
      })
    }

    res.status(200).json({ success: true, data: bootcamp })
  } catch (err) {
    // incorrectly formatted
    res.status(400).json({ success: false })
  }
}

// @desc    Create new bootcamps
// @route   POST /api/v1/bootcamps
// @access  Private
exports.createBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.create(req.body)
    res.status(201).json({ success: true, data: bootcamp })
  } catch (err) {
    res.status(400).json({ success: false })
  }
}

// @desc    Update bootcamp
// @route   PUT /api/v1/bootcamp/:id
// @access  Private
exports.updateBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    if (!bootcamp) {
      return res.status(400).json({ success: false })
    }

    res.status(200).json({ success: true, data: bootcamp })
  } catch (err) {
    res.status(400).json({ success: false })
  }
}

// @desc    Delete bootcamp
// @route   DELETE /api/v1/bootcamp/:id
// @access  Private
exports.deleteBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id)

    if (!bootcamp) {
      return res.status(400).json({ success: false })
    }

    res.status(200).json({ success: true, data: {} })
  } catch (error) {
    res.status(400).json({ success: false })
  }
}

// ** NOTES **
// 23.1. mongoose functions[find(), findById(), etc] are async -> await
// 23.2. try catch to handel erros e.g. bootcamps have the same name
// 23.3. must handle issues for both *correctly formatted _id* but doesn't exist and *just incorrectly formatted _id*
// 23.3.1. Error: Cannot set headers after they are sent to the client if no *return* for *correctly formatted _id* but doesn't exist
// 24.1. findByIdAndUpdate(id, update, options{new: true, runValidators: true })
