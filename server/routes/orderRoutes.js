
const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const protectAdmin = require('../middleware/authMiddleware')

const Order = require('../models/Order')
const Product = require('../models/Product')

const allowedSizes = [30, 50, 100]

// Create a new order and deduct mixture stock
router.post('/', async (req, res) => {
  const { customer, products } = req.body

  // Validate customer information
  if (
    !customer?.fullName?.trim() ||
    !customer?.phone?.trim() ||
    !customer?.wilaya?.trim() ||
    !customer?.address?.trim()
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

  // Validate every cart item
  for (const item of products) {
    const sizeMl = Number(item.sizeMl)

    if (
      !mongoose.Types.ObjectId.isValid(item.productId) ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      !allowedSizes.includes(sizeMl)
    ) {
      return res.status(400).json({
        message: 'Invalid product, size, or quantity'
      })
    }
  }

  let session

  try {
    session = await mongoose.startSession()

    let savedOrder

    await session.withTransaction(async () => {
      let total = 0
      const orderProducts = []

      for (const item of products) {
        const sizeMl = Number(item.sizeMl)
        const requiredMl = sizeMl * item.quantity

        const product = await Product.findOne({
          _id: item.productId,
          isAvailable: true
        }).session(session)

        if (!product) {
          throw new Error('Product not found or unavailable')
        }

        // Get the correct price from the database
        const price = Number(product[`price${sizeMl}ml`])

        if (!Number.isFinite(price) || price < 0) {
          throw new Error(
            `Invalid price for ${product.name} (${sizeMl} ml)`
          )
        }

        // Deduct the exact mixture quantity atomically
        const updatedProduct = await Product.findOneAndUpdate(
          {
            _id: item.productId,
            isAvailable: true,
            stockMl: { $gte: requiredMl }
          },
          {
            $inc: { stockMl: -requiredMl }
          },
          {
            new: true,
            session
          }
        )

        if (!updatedProduct) {
          throw new Error(
            `Not enough mixture available for ${product.name}`
          )
        }

        const lineTotal = price * item.quantity

        total += lineTotal

        orderProducts.push({
          product: product._id,
          name: product.name,
          sizeMl,
          price,
          quantity: item.quantity,
          lineTotal
        })
      }

      const [order] = await Order.create(
        [{
          customer: {
            fullName: customer.fullName.trim(),
            phone: customer.phone.trim(),
            wilaya: customer.wilaya.trim(),
            address: customer.address.trim()
          },
          products: orderProducts,
          total,
          paymentMethod: 'Cash on Delivery',
          status: 'Pending',
          stockRestored: false
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
    if (session) {
      await session.endSession()
    }
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
    console.error('Fetch Orders Error:', error)

    res.status(500).json({
      message: 'Failed to fetch orders',
      error: error.message
    })
  }
})

// Update order status (Admin only)
// Restore mixture stock when an order is cancelled
router.patch('/:id/status', protectAdmin, async (req, res) => {
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

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({
      message: 'Invalid order ID'
    })
  }

  let session

  try {
    session = await mongoose.startSession()

    let updatedOrder

    await session.withTransaction(async () => {
      const order = await Order.findById(req.params.id).session(session)

      if (!order) {
        throw new Error('ORDER_NOT_FOUND')
      }

      // Do not allow a cancelled order to be reactivated
      if (order.status === 'Cancelled' && status !== 'Cancelled') {
        throw new Error(
          'A cancelled order cannot be reactivated'
        )
      }

      // Already cancelled: do not restore stock again
      if (order.status === 'Cancelled' && status === 'Cancelled') {
        updatedOrder = order
        return
      }

      // Restore mixture when cancelling
      if (status === 'Cancelled' && !order.stockRestored) {
        for (const item of order.products) {
          if (
            !item.sizeMl ||
            !allowedSizes.includes(Number(item.sizeMl))
          ) {
            throw new Error(
              'This is a legacy order without bottle-size information. Its stock cannot be restored automatically.'
            )
          }

          const restoredMl = Number(item.sizeMl) * Number(item.quantity)

          const result = await Product.updateOne(
            { _id: item.product },
            { $inc: { stockMl: restoredMl } },
            { session }
          )

          if (result.matchedCount === 0) {
            throw new Error(
              `Cannot restore stock: product "${item.name}" no longer exists`
            )
          }
        }

        order.stockRestored = true
      }

      order.status = status

      await order.save({ session })

      updatedOrder = order
    })

    res.json({
      message: 'Order status updated successfully',
      order: updatedOrder
    })

  } catch (error) {
    console.error('Update Order Status Error:', error)

    if (error.message === 'ORDER_NOT_FOUND') {
      return res.status(404).json({
        message: 'Order not found'
      })
    }

    res.status(400).json({
      message: error.message || 'Failed to update order status'
    })

  } finally {
    if (session) {
      await session.endSession()
    }
  }
})

module.exports = router
