const path = require('path')
const express = require('express')
const dotenv = require('dotenv')
const colors = require('colors')
const morgan = require('morgan')
const fileupload = require('express-fileupload')
const cookieParser = require('cookie-parser')
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')
const xss = require('xss-clean')
const rateLimit = require('express-rate-limit')
const hpp = require('hpp')
const cors = require('cors')
const errorHandler = require('./middleware/errorHandler')
const connectDB = require('./config/db')
// Load env vars
dotenv.config({ path: './config/config.env' })

connectDB()

// Route files
const bootcamps = require('./routes/bootcamps')
const courses = require('./routes/courses')
const auth = require('./routes/auth')
const users = require('./routes/users')
const reviews = require('./routes/reviews')

const app = express()

// Body parser
app.use(express.json())

// Cookie parser
app.use(cookieParser())

// Logging request
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

app.use(express.static(path.join(__dirname, 'public')))

// File uploading
app.use(fileupload())

// Sanitize Data
app.use(mongoSanitize())

// Set security headers
app.use(helmet())

// Prevent XSS attacks
app.use(xss())

// Limit requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
})

app.use(limiter)

// Prevent http parameter pollution
app.use(hpp())

// Enable CORS
app.use(cors())

// Mount routers
app.use('/api/v1/bootcamps', bootcamps)
app.use('/api/v1/courses', courses)
app.use('/api/v1/auth', auth)
app.use('/api/v1/users', users)
app.use('/api/v1/reviews', reviews)

app.use(errorHandler)

const PORT = process.env.PORT || 5000
const nodeEnvironment = process.env.NODE_ENV.yellow.bold

const server = app.listen(
  PORT,
  console.log(`Server running in ${nodeEnvironment} mode on PORT ${PORT}`)
)

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red)
  // Close server & exit process
  server.close(() => process.exit(1))
})
