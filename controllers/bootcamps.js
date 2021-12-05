const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/asyncHandler')
const geocoder = require('../utils/geocoder')
const Bootcamp = require('../models/Bootcamp')

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  // console.log('req.qeury: ', req.query)
  let query

  // Copry req.query
  const reqQuery = { ...req.query }
  // console.log('reqQuery: ', reqQuery)

  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit']

  // Loop over removeFields and delete from reqQuery
  removeFields.forEach((param) => delete reqQuery[param])

  // Create query string
  let queryString = JSON.stringify(req.query)

  // Create operators
  queryString = queryString.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  )

  // Finding resoruce
  query = Bootcamp.find(JSON.parse(queryString))
  // console.log('queryString: ', queryString)

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ')
    // console.log(fields)
    query = query.select(fields)
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ')
    query = query.sort(sortBy)
  } else {
    query = query.sort('-createdAt')
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1
  const limit = parseInt(req.query.limit, 10) || 2 // 2 items per page
  const startIndex = (page - 1) * limit
  const endIndex = page * limit
  const total = await Bootcamp.countDocuments()

  query = query.skip(startIndex).limit(limit)

  // EXECUTE QUERY
  const bootcamps = await query

  // Pagination result
  const pagination = {}

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    }
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    }
  }
  res.status(200).json({
    success: true,
    count: bootcamps.length,
    pagination,
    data: bootcamps,
  })
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
// 23.2. try catch to handle erros e.g. bootcamps have the same name
// 23.3. must handle issues for both *correctly formatted _id* but doesn't exist and *just incorrectly formatted _id*
// 23.3.1. Error: Cannot set headers after they are sent to the client if no *return* for *correctly formatted _id* but doesn't exist
// 24.1. findByIdAndUpdate(id, update, options{new: true, runValidators: true })

// 25.1. pass error to next() for error handling

// 34.1. MongoDB operators $gt https://docs.mongodb.com/manual/reference/operator/query/gt/
// 34.2. manipulate query to match $gt
// 34.3. queryString to JSON.stringfy(req.query) and JSON.parse(queryString)
// 34.4. ?careers[in]=Data Science = ?careers[in]=Data%20Science

// 35.1. select & sort -> query.select(fields) query.sort(sortBy)
// 35.1.1. query.select('name occupation'); white-space sperated
// 35.1.2. mongoose look at select as a field from model
// 35.1.3. have to remove from fields
// 35.1.4. query.select(fields) -> if(req.qeury.select) {}

// 36.1. pagination
// 36.1.1. need page, limit, startIndex, endIndex, total = await Bootcamp.countDocuments()
// 36.1.2. page, limit comes from url (string) -> parseInt(page, radix) || default value
// 36.1.3. ㅁㅁㅁㅁㅁ/ㅁㅁㅁㅁㅁ/{ㅁ}ㅁㅁㅁ{ㅁ}/ㅁㅁㅁㅁㅁ/ㅁㅁ {ㅁ}startIndex {ㅁ}endIndex
// 36.1.4. const startIndex = (page - 1) * limit const endIndex = page * limit
// 36.1.5. construct pagination result
