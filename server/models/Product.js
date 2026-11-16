
const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    default: ''
  },

  price30ml: {
    type: Number,
    required: true,
    min: 0
  },

  price50ml: {
    type: Number,
    required: true,
    min: 0
  },

  price100ml: {
    type: Number,
    required: true,
    min: 0
  },

  category: {
    type: String,
    required: true
  },

  image: {
    type: String,
    default: ''
  },

  stockMl: {
    type: Number,
    default: 0,
    min: 0
  },

  isAvailable: {
    type: Boolean,
    default: true
  }

}, { timestamps: true })

module.exports = mongoose.model('Product', productSchema)
