
const express = require('express')
const router = express.Router()

const Product = require('../models/Product')

// Get all available products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({
      isAvailable: true
    })

    res.json(products.map(product => ({
      id: product._id,
      name: product.name,
      price: product.price,
      category: product.category,
      description: product.description,
      image: product.image,
      stock: product.stock
    })))

  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch products',
      error: error.message
    })
  }
})

module.exports = router
