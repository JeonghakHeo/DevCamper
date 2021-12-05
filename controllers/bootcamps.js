const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/asyncHandler')
const geocoder = require('../utils/geocoder')
const Bootcamp = require('../models/Bootcamp')
// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  console.log(req.query)
  let query

  let queryString = JSON.stringify(req.query)

  queryString = queryString.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  )

  query = Bootcamp.find(JSON.parse(queryString))

  const bootcamps = await query
  res
    .status(200)
    .json({ success: true, count: bootcamps.length, data: bootcamps })
})

// @desc    Get single bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id)

  // for correctly formatted but doesn't exist
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    )
  }

  res.status(200).json({ success: true, data: bootcamp })
})

// @desc    Create new bootcamps
// @route   POST /api/v1/bootcamps
// @access  Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body)
  res.status(201).json({ success: true, data: bootcamp })
})

// @desc    Update bootcamp
// @route   PUT /api/v1/bootcamp/:id
// @access  Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    )
  }

  res.status(200).json({ success: true, data: bootcamp })
})

// @desc    Delete bootcamp
// @route   DELETE /api/v1/bootcamp/:id
// @access  Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id)

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    )
  }

  res.status(200).json({ success: true, data: {} })
})

// @desc    Get Bootcamps within Radius
// @route   GET /api/v1/bootcamp/radius/:zipcode/:distance
// @access  Private
exports.getBootcampsInRadius = async (req, res, next) => {
  const { zipcode, distance } = req.params

  const loc = await geocoder.geocode(zipcode)
  const latitude = loc[0].latitude
  const longitude = loc[0].longitude

  // Calculate radius using radians
  // Divide distance by radius of Earth
  // Earth radisu = 6,378km
  const radius = distance / 6378

  const bootcamps = await Bootcamp.find({
    location: {
      $geoWithin: { $centerSphere: [[longitude, latitude], radius] },
    },
  })

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  })
}

// ** NOTES **
// 23.1. mongoose functions[find(), findById(), etc] are async -> await
// 23.2. try catch to handel erros e.g. bootcamps have the same name
// 23.3. must handle issues for both *correctly formatted _id* but doesn't exist and *just incorrectly formatted _id*
// 23.3.1. Error: Cannot set headers after they are sent to the client if no *return* for *correctly formatted _id* but doesn't exist
// 24.1. findByIdAndUpdate(id, update, options{new: true, runValidators: true })

// 25.1. pass error to next() for error handling

// 34.1.1. MongoDB operators $gt https://docs.mongodb.com/manual/reference/operator/query/gt/
// 34.1.2. manipulate query to match $gt
// 34.1.3. queryString to JSON.stringfy(req.query) and JSON.parse(queryString)
// 34.1.4. ?careers[in]=Data Science = ?careers[in]=Data%20Science
