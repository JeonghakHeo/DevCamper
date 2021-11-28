const express = require('express')
const dotenv = require('dotenv')
const colors = require('colors')

// Load env vars
dotenv.config({ path: './config/config.env' })

const app = express()

const PORT = process.env.PORT.green.bold || 5000
const server = process.env.NODE_ENV.yellow.bold

app.listen(PORT, console.log(`Server running in ${server} on PORT ${PORT}`))
