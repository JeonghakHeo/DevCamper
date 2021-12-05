const express = require('express')
const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsInRadius,
} = require('../controllers/bootcamps')
const router = express.Router()

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius)

router.route('/').get(getBootcamps).post(createBootcamp)

router.route('/:id').get(getBootcamp).put(updateBootcamp).delete(deleteBootcamp)

module.exports = router

/*
  router.get('/', (req, res) => {
    res.status(200).json({ success: true, msg: 'Show all bootcamps'})
  })
*/
