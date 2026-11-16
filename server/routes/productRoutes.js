
const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const protectAdmin = require('../middleware/authMiddleware')

const Product = require('../models/Product')

const priceFields = ['price30ml', 'price50ml', 'price100ml']

// Validate prices and mixture stock
function validNumber(value) {
  return Number.isFinite(Number(value)) && Number(value) >= 0
}

function hasCompletePrices(product) {
  return priceFields.every(field =>
    Number.isFinite(Number(product[field])) &&
    Number(product[field]) > 0
  )
}

// GET all visible products (Public)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({
      isAvailable: true
    }).sort({ createdAt: -1 })

    res.json(products.map(product => ({
      id: product._id,
      name: product.name,
      description: product.description,
      price30ml: product.price30ml,
      price50ml: product.price50ml,
      price100ml: product.price100ml,
      category: product.category,
      image: product.image,
      stockMl: product.stockMl,
      isAvailable: product.isAvailable
    })))

  } catch (error) {
    console.error('Fetch Products Error:', error)

    res.status(500).json({
      message: 'Failed to fetch products'
    })
  }
})

// GET all products (Admin only)
router.get('/admin/all', protectAdmin, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 })

    res.json({
      count: products.length,
      products
    })

  } catch (error) {
    console.error('Admin Fetch Products Error:', error)

    res.status(500).json({
      message: 'Failed to fetch products'
    })
  }
})

// CREATE product (Admin only)
router.post('/', protectAdmin, async (req, res) => {
  try {
    const {
      name,
      description,
      price30ml,
      price50ml,
      price100ml,
      category,
      image,
      stockMl
    } = req.body

    if (!name?.trim() || !category?.trim()) {
      return res.status(400).json({
        message: 'Product name and category are required'
      })
    }

    if (
      !validNumber(price30ml) ||
      !validNumber(price50ml) ||
      !validNumber(price100ml) ||
      !validNumber(stockMl)
    ) {
      return res.status(400).json({
        message: 'Prices and mixture stock must be valid non-negative numbers'
      })
    }

    // New products are hidden until the admin activates them
    const product = await Product.create({
      name: name.trim(),
      description: description || '',
      price30ml: Number(price30ml),
      price50ml: Number(price50ml),
      price100ml: Number(price100ml),
      category: category.trim(),
      image: image || '',
      stockMl: Number(stockMl),
      isAvailable: false
    })

    res.status(201).json({
      message: 'Product created successfully',
      product
    })

  } catch (error) {
    console.error('Create Product Error:', error)

    res.status(400).json({
      message: error.message || 'Failed to create product'
    })
  }
})

// UPDATE product (Admin only)
router.put('/:id', protectAdmin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: 'Invalid product ID'
      })
    }

    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({
        message: 'Product not found'
      })
    }

    const body = req.body

    const numericFields = [
      'price30ml',
      'price50ml',
      'price100ml',
      'stockMl'
    ]

    for (const field of numericFields) {
      if (body[field] !== undefined) {
        if (!validNumber(body[field])) {
          return res.status(400).json({
            message: `${field} must be a valid non-negative number`
          })
        }

        product[field] = Number(body[field])
      }
    }

    if (body.name !== undefined) {
      if (!body.name.trim()) {
        return res.status(400).json({
          message: 'Product name cannot be empty'
        })
      }

      product.name = body.name.trim()
    }

    if (body.category !== undefined) {
      if (!body.category.trim()) {
        return res.status(400).json({
          message: 'Category cannot be empty'
        })
      }

      product.category = body.category.trim()
    }

    if (body.description !== undefined) {
      product.description = body.description
    }

    if (body.image !== undefined) {
      product.image = body.image
    }

    // Check before activating a hidden product
    if (body.isAvailable === true && !product.isAvailable) {
      if (!hasCompletePrices(product) || Number(product.stockMl) <= 0) {
        return res.status(400).json({
          message: 'Configure all three prices and add mixture stock before listing this product'
        })
      }
    }

    // Do not allow an already listed product to have invalid prices
    if (product.isAvailable && !hasCompletePrices(product)) {
      return res.status(400).json({
        message: 'A listed product must have all three prices configured'
      })
    }

    if (body.isAvailable !== undefined) {
      product.isAvailable = Boolean(body.isAvailable)
    }

    await product.save()

    res.json({
      message: 'Product updated successfully',
      product
    })

  } catch (error) {
    console.error('Update Product Error:', error)

    res.status(400).json({
      message: error.message || 'Failed to update product'
    })
  }
})

// DELETE product (Admin only)
router.delete('/:id', protectAdmin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: 'Invalid product ID'
      })
    }

    const product = await Product.findByIdAndDelete(req.params.id)

    if (!product) {
      return res.status(404).json({
        message: 'Product not found'
      })
    }

    res.json({
      message: 'Product deleted successfully'
    })

  } catch (error) {
    console.error('Delete Product Error:', error)

    res.status(500).json({
      message: 'Failed to delete product'
    })
  }
})

module.exports = router
