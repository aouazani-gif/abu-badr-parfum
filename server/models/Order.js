
const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({

  customer: {
    fullName: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    wilaya: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    }
  },

  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      name: {
        type: String,
        required: true
      },
      price: {
        type: Number,
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      }
    }
  ],

  total: {
    type: Number,
    required: true
  },

  paymentMethod: {
    type: String,
    default: 'Cash on Delivery'
  },

  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  }

}, { timestamps: true })

module.exports = mongoose.model('Order', orderSchema)
