const Admin = require('../models/Admin')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// Admin Login
const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body

    // Check if admin exists
    const admin = await Admin.findOne({ username })

    if (!admin) {
      return res.status(401).json({
        message: 'Invalid username or password'
      })
    }

    // Compare password with hashed password
    const isMatch = await bcrypt.compare(
      password,
      admin.password
    )

    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid username or password'
      })
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    )

    res.json({
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        username: admin.username
      }
    })

  } catch (error) {
    res.status(500).json({
      message: 'Login failed',
      error: error.message
    })
  }
}

module.exports = { loginAdmin }