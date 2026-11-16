
const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const mongoose = require('mongoose')
const dns = require('dns')

// DNS workaround for MongoDB Atlas SRV lookup
dns.setServers(['8.8.8.8', '1.1.1.1'])

dotenv.config()

const app = express()

const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_URL
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true)
    }

    return callback(new Error('Not allowed by CORS'))
  }
}))

app.use(express.json())

const productRoutes = require('./routes/productRoutes')
const orderRoutes = require('./routes/orderRoutes')
const adminRoutes = require('./routes/adminRoutes')

app.get('/', (req, res) => {
  res.status(200).send('Abu Badr Parfum API is running!')
})

app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/admin', adminRoutes)

app.use((err, req, res, next) => {
  console.error(err.message)

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      message: 'Origin not allowed by CORS'
    })
  }

  res.status(500).json({
    message: 'Internal server error'
  })
})

const PORT = process.env.PORT || 5000

const startServer = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is missing')
    }

    await mongoose.connect(process.env.MONGO_URI)

    console.log('MongoDB Connected Successfully!')

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Server startup error:', error.message)
    process.exit(1)
  }
}

startServer()
