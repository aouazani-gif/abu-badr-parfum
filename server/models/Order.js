
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
      sizeMl: {
        type: Number,
        enum: [30, 50, 100],
        required: true
      },
      price: {
        type: Number,
        required: true,
        min: 0
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      },
      lineTotal: {
        type: Number,
        required: true,
        min: 0
      }
    }
  ],

  total: {
    type: Number,
    required: true,
    min: 0
  },

  paymentMethod: {
    type: String,
    default: 'Cash on Delivery'
  },

  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },

  // Prevent restoring mixture stock more than once
  stockRestored: {
    type: Boolean,
    default: false
  }

}, { timestamps: true })

module.exports = mongoose.model('Order', orderSchema)
