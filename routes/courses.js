const express = require('express')
const { getCourses } = require('../controllers/courses')

const router = express.Router({ mergeParams: true })

// app.use('/api/v1/courses')
// router.use('/:bootcampId/courses', courseRouter)
router.route('/').get(getCourses)

module.exports = router

// 38.1. mergeParamas: true for re-route from bootcamps.js
// @route   GET /api/v1/courses
// @route   GET /api/v1/bootcamp/:bootcampId/courses
// router.use('/:bootcampId/courses', courseRouter)
