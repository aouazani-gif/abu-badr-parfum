
const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const protectAdmin = require('../middleware/authMiddleware')

const Order = require('../models/Order')
const Product = require('../models/Product')

// Create a new order and update stock
router.post('/', async (req, res) => {
  const { customer, products } = req.body

  // Validate customer information
  if (
    !customer?.fullName ||
    !customer?.phone ||
    !customer?.wilaya ||
    !customer?.address
  ) {
    return res.status(400).json({
      message: 'All customer fields are required'
    })
  }

  // Validate cart
  if (!Array.isArray(products) || products.length === 0) {
    return res.status(400).json({
      message: 'Your cart is empty'
    })
  }

  for (const item of products) {
    if (
      !mongoose.Types.ObjectId.isValid(item.productId) ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1
    ) {
      return res.status(400).json({
        message: 'Invalid product or quantity'
      })
    }
  }

  const session = await mongoose.startSession()

  try {
    let savedOrder

    // Keep stock updates and order creation together
    await session.withTransaction(async () => {
      let total = 0
      const orderProducts = []

      for (const item of products) {
        const product = await Product.findOne({
          _id: item.productId,
          isAvailable: true
        }).session(session)

        if (!product) {
          throw new Error('Product not found or unavailable')
        }

        if (item.quantity > product.stock) {
          throw new Error(`Not enough stock for ${product.name}`)
        }

        // Decrease stock safely
        const updatedProduct = await Product.findOneAndUpdate(
          {
            _id: item.productId,
            isAvailable: true,
            stock: { $gte: item.quantity }
          },
          {
            $inc: { stock: -item.quantity }
          },
          {
            new: true,
            session
          }
        )

        if (!updatedProduct) {
          throw new Error(`Not enough stock for ${product.name}`)
        }

        total += product.price * item.quantity

        orderProducts.push({
          product: product._id,
          name: product.name,
          price: product.price,
          quantity: item.quantity
        })
      }

      const [order] = await Order.create(
        [{
          customer,
          products: orderProducts,
          total,
          paymentMethod: 'Cash on Delivery'
        }],
        { session }
      )

      savedOrder = order
    })

    res.status(201).json({
      message: 'Order placed successfully!',
      order: savedOrder
    })

  } catch (error) {
    console.error('Order Error:', error)

    res.status(400).json({
      message: error.message || 'Failed to place order'
    })

  } finally {
    await session.endSession()
  }
})

// Get all orders (Admin only)
router.get('/', protectAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })

    res.json({
      count: orders.length,
      orders
    })

  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch orders',
      error: error.message
    })
  }
})

// Update order status (Admin only)
router.patch('/:id/status', protectAdmin, async (req, res) => {
  try {
    const { status } = req.body

    const allowedStatuses = [
      'Pending',
      'Confirmed',
      'Shipped',
      'Delivered',
      'Cancelled'
    ]

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid order status'
      })
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )

    if (!order) {
      return res.status(404).json({
        message: 'Order not found'
      })
    }

    res.json({
      message: 'Order status updated successfully',
      order
    })

  } catch (error) {
    res.status(500).json({
      message: 'Failed to update order status',
      error: error.message
    })
  }
})

module.exports = router
