const express = require('express')
const {
  getCourses,
  getCourse,
  addCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/courses')

const router = express.Router({ mergeParams: true })

// app.use('/api/v1/courses')
// router.use('/:bootcampId/courses', courseRouter)
router.route('/').get(getCourses).post(addCourse)
router.route('/:id').get(getCourse).put(updateCourse).delete(deleteCourse)

module.exports = router

// 38.1. mergeParamas: true for re-route from bootcamps.js
// @route   GET /api/v1/courses
// @route   GET /api/v1/bootcamp/:bootcampId/courses
// router.use('/:bootcampId/courses', courseRouter)
