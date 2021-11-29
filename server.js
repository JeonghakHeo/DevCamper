const express = require('express')
const dotenv = require('dotenv')
const colors = require('colors')
const morgan = require('morgan')
const connectDB = require('./config/db')

// Load env vars
dotenv.config({ path: './config/config.env' })

connectDB()

// Route files
const bootcamps = require('./routes/bootcamps')

const app = express()

// Logging request
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// Mount routers
app.use('/api/v1/bootcamps', bootcamps)
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
