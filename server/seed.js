
const dns = require('dns')

dns.setServers(['8.8.8.8', '1.1.1.1'])

const mongoose = require('mongoose')
const dotenv = require('dotenv')
const Product = require('./models/Product')

dotenv.config()

const products = [
  {
    name: 'Azzaro Wanted',
    price: 8500,
    category: 'Woody & Spicy',
    description: 'A bold and energetic fragrance.',
    stock: 10
  },
  {
    name: 'Armani You',
    price: 9000,
    category: 'Fresh & Elegant',
    description: 'A modern and elegant fragrance.',
    stock: 8
  },
  {
    name: 'Lacoste Booster',
    price: 7000,
    category: 'Fresh & Sporty',
    description: 'A fresh fragrance for everyday use.',
    stock: 12
  },
  {
    name: 'Ultra Male',
    price: 9500,
    category: 'Sweet & Intense',
    description: 'A sweet and powerful fragrance.',
    stock: 6
  }
]

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI)

    await Product.deleteMany({})
    await Product.insertMany(products)

    console.log('Products inserted successfully!')

  } catch (error) {
    console.error('Seeding error:', error.message)

  } finally {
    await mongoose.disconnect()
  }
}

seedDatabase()
