
const express = require('express')
const mongoose = require('mongoose')
const router = express.Router()

const Product = require('../models/Product')
const protectAdmin = require('../middleware/authMiddleware')

// GET: Get all available products (Public)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ isAvailable: true })

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

// POST: Create a product (Admin only)
router.post('/', protectAdmin, async (req, res) => {
  try {
    const {
      name, description, price, category, image, stock, isAvailable
    } = req.body

    if (
      typeof name !== 'string' || !name.trim() ||
      typeof category !== 'string' || !category.trim() ||
      price === undefined
    ) {
      return res.status(400).json({
        message: 'Name, price and category are required'
      })
    }

    const numericPrice = Number(price)
    const numericStock = stock === undefined ? 0 : Number(stock)

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      return res.status(400).json({
        message: 'Price must be a valid non-negative number'
      })
    }

    if (!Number.isInteger(numericStock) || numericStock < 0) {
      return res.status(400).json({
        message: 'Stock must be a non-negative integer'
      })
    }

    const product = await Product.create({
      name: name.trim(),
      description,
      price: numericPrice,
      category: category.trim(),
      image,
      stock: numericStock,
      isAvailable: isAvailable === undefined ? true : isAvailable
    })

    res.status(201).json({
      message: 'Product created successfully',
      product
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to create product',
      error: error.message
    })
  }
})

// PUT: Update a product (Admin only)
router.put('/:id', protectAdmin, async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid product ID' })
    }

    const allowedFields = [
      'name', 'description', 'price',
      'category', 'image', 'stock', 'isAvailable'
    ]

    const updates = {}

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field]
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: 'No valid fields provided for update'
      })
    }

    if ('name' in updates) {
      if (typeof updates.name !== 'string' || !updates.name.trim()) {
        return res.status(400).json({ message: 'Invalid product name' })
      }
      updates.name = updates.name.trim()
    }

    if ('category' in updates) {
      if (typeof updates.category !== 'string' || !updates.category.trim()) {
        return res.status(400).json({ message: 'Invalid category' })
      }
      updates.category = updates.category.trim()
    }

    if ('price' in updates) {
      updates.price = Number(updates.price)
      if (!Number.isFinite(updates.price) || updates.price < 0) {
        return res.status(400).json({ message: 'Invalid price' })
      }
    }

    if ('stock' in updates) {
      updates.stock = Number(updates.stock)
      if (!Number.isInteger(updates.stock) || updates.stock < 0) {
        return res.status(400).json({ message: 'Invalid stock quantity' })
      }
    }

    if ('isAvailable' in updates && typeof updates.isAvailable !== 'boolean') {
      return res.status(400).json({ message: 'Invalid availability value' })
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    )

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    res.json({
      message: 'Product updated successfully',
      product
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update product',
      error: error.message
    })
  }
})

// DELETE: Delete a product (Admin only)
router.delete('/:id', protectAdmin, async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid product ID' })
    }

    const product = await Product.findByIdAndDelete(id)

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    res.json({
      message: 'Product deleted successfully',
      product
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete product',
      error: error.message
    })
  }
})

module.exports = router
