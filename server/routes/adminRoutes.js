
const express = require('express')
const router = express.Router()

const { loginAdmin } = require('../controllers/adminController')
const protectAdmin = require('../middleware/authMiddleware')

// Public route: Admin login
router.post('/login', loginAdmin)

// Protected route: Admin dashboard test
router.get('/dashboard', protectAdmin, (req, res) => {
  res.json({
    message: 'Welcome to the admin dashboard!',
    adminId: req.adminId
  })
})

module.exports = router
