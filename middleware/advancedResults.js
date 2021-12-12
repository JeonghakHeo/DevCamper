const advancedResults = (model, populate) => async (req, res, next) => {
  // console.log('req.qeury: ', req.query)
  let query

  // Copy req.query
  const reqQuery = { ...req.query }
  // console.log('reqQuery: ', reqQuery)

  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit']

  // Loop over removeFields and delete from reqQuery
  removeFields.forEach((param) => delete reqQuery[param])

  // Create query string
  let queryString = JSON.stringify(reqQuery)

  // Create operators
  queryString = queryString.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  )

  // Finding resoruce
  query = model.find(JSON.parse(queryString))
  // console.log('queryString: ', queryString)

  if (populate) {
    query = query.populate(populate)
  }

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
  const limit = parseInt(req.query.limit, 10) || 20 // 20 items per page
  const startIndex = (page - 1) * limit
  const endIndex = page * limit
  const total = await model.countDocuments()

  query = query.skip(startIndex).limit(limit)

  // EXECUTE QUERY
  const results = await query

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

  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results,
  }

  next()
}

module.exports = advancedResults
