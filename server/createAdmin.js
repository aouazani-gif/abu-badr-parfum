
const dns = require('dns')
dns.setServers(['8.8.8.8', '1.1.1.1'])

const mongoose = require('mongoose')
const dotenv = require('dotenv')
const bcrypt = require('bcryptjs')
const Admin = require('./models/Admin')

dotenv.config()

const createAdmin = async () => {
  try {
    const { ADMIN_USERNAME, ADMIN_PASSWORD, MONGO_URI } = process.env

    if (!ADMIN_USERNAME || !ADMIN_PASSWORD || !MONGO_URI) {
      throw new Error('Missing required environment variables')
    }

    await mongoose.connect(MONGO_URI)

    const existingAdmin = await Admin.findOne({
      username: ADMIN_USERNAME
    })

    if (existingAdmin) {
      console.log('Admin already exists!')
      return
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12)

    await Admin.create({
      username: ADMIN_USERNAME,
      password: hashedPassword
    })

    console.log('Admin created successfully!')

  } catch (error) {
    console.error('Admin creation error:', error.message)
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect()
    }
  }
}

createAdmin()
