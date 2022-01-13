const express = require('express')
const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsInRadius,
  bootcampPhotoUpload,
} = require('../controllers/bootcamps')

const Bootcamp = require('../models/Bootcamp')

// Include other resource routers
const courseRouter = require('./courses')

const advancedResults = require('../middleware/advancedResults')
const { protect, authorize } = require('../middleware/auth')

const router = express.Router()

// Re-route into other resource routers

// @route   GET /api/v1/courses
// @route   GET /api/v1/bootcamps/:bootcampId/courses
router.use('/:bootcampId/courses', courseRouter)

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius)

router
  .route('/:id/photo')
  .put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload)

router
  .route('/')
  .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
  .post(protect, authorize('publisher', 'admin'), createBootcamp)

router
  .route('/:id')
  .get(getBootcamp)
  .put(protect, authorize('publisher', 'admin'), updateBootcamp)
  .delete(protect, authorize('publisher', 'admin'), deleteBootcamp)

module.exports = router

/*
  router.get('/', (req, res) => {
    res.status(200).json({ success: true, msg: 'Show all bootcamps'})
  })
*/
