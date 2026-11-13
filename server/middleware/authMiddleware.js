
const jwt = require('jsonwebtoken')

const protectAdmin = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Access denied. No token provided.'
      })
    }

    const token = authHeader.split(' ')[1]

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Attach admin ID to request
    req.adminId = decoded.id

    next()

  } catch (error) {
    return res.status(401).json({
      message: 'Invalid or expired token.'
    })
  }
}

module.exports = protectAdmin
