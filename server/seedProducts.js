
const mongoose = require('mongoose')
const dns = require('dns')

dns.setServers(['8.8.8.8', '1.1.1.1'])

const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env') })

const Product = require('./models/Product')

const nicheProducts = [
  'Eden Juicy Apple | 01',
  'Althaïr',
  'Summer Hammer',
  'Vibrato',
  'Hacivat',
  'Hundred Silent Ways',
  'Urba Pura',
  'Almaz',
  'أمواج البحر',
  'Qissa',
  'إحساس العربية',
  'Soft',
  'Ameer Al Oudh',
  'Imperial Valley'
]

const productNames = [
  'Stronger With You',
  'Ultra Male',
  'The Most Wanted',
  'Eden Juicy Apple | 01',
  'Le Male Elixir',
  'Taj Sunset',
  'Althaïr',
  'Bleu de Chanel',
  'أمواج البحر',
  'Summer Hammer',
  'Vibrato',
  'K',
  'Sauvage',
  'Scandal Absolu',
  'Stronger With You Intensely',
  'Hacivat',
  'Whisky Silver',
  'Hundred Silent Ways',
  'Urba Pura',
  'Qissa',
  'إحساس العربية',
  'Soft',
  'Le Beau Paradise Garden',
  'L.12.12 Noir',
  'L.12.12 Blanc',
  'Ameer Al Oudh',
  'Pineapple',
  'Scandal',
  'Booster',
  'Hugo Boss',
  'Almaz',
  'Boss Bottled Unlimited',
  'Imperial Valley'
]

async function seedProducts() {
  try {
    const mongoUri =
      process.env.MONGO_URI ||
      process.env.MONGODB_URI ||
      process.env.MONGO_URL

    if (!mongoUri) {
      throw new Error('MongoDB connection string was not found in server/.env')
    }

    await mongoose.connect(mongoUri)
    console.log('Connected to MongoDB')

    const existingProducts = await Product.find({}, 'name')

    const existingNames = new Set(
      existingProducts.map(product =>
        product.name.trim().toLowerCase()
      )
    )

    const newProducts = productNames
      .filter(name => !existingNames.has(name.trim().toLowerCase()))
      .map(name => {
        const isNiche = nicheProducts.includes(name)

        return {
          name,
          description: '',
          descriptionAr: '',
          price30ml: 600,
          price50ml: 900,
          price100ml: 1500,
          category: isNiche ? 'Niche' : 'Designer',
          categoryAr: isNiche ? 'نيش' : 'مصمم',
          image: '',
          stockMl: 1000,
          isAvailable: true
        }
      })

    if (newProducts.length === 0) {
      console.log('All products already exist. Nothing was added.')
      return
    }

    await Product.insertMany(newProducts)

    console.log(`${newProducts.length} products added successfully.`)
    console.log(`${productNames.length - newProducts.length} existing products skipped.`)

  } catch (error) {
    console.error('Seed Error:', error.message)
  } finally {
    await mongoose.disconnect()
    console.log('MongoDB disconnected')
  }
}

seedProducts()
