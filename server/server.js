
const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const mongoose = require('mongoose')
const dns = require('dns')

dns.setServers(['8.8.8.8', '1.1.1.1'])

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

// Import routes
const productRoutes = require('./routes/productRoutes')
const orderRoutes = require('./routes/orderRoutes')

// Main route
app.get('/', (req, res) => {
  res.send('Abu Badr Parfum API is running!')
})

// API routes
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)

const PORT = process.env.PORT || 5000

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected Successfully!')

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch(error => {
    console.error('MongoDB Connection Error:', error.message)
  })
