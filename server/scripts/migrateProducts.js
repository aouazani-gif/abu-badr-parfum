
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const dns = require('dns')

dns.setServers(['8.8.8.8', '1.1.1.1'])

const Product = require('../models/Product')

dotenv.config()

async function migrateProducts() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is missing from your .env file')
    }

    await mongoose.connect(process.env.MONGO_URI)

    console.log('Connected to MongoDB')

    // Read raw database documents to avoid Mongoose defaults
    const products = await Product.collection.find({}).toArray()

    let migratedCount = 0

    for (const product of products) {
      const updates = {}

      const hasField = field =>
        Object.prototype.hasOwnProperty.call(product, field) &&
        product[field] !== null

      // Preserve the old price as the 30 ml price
      if (!hasField('price30ml')) {
        const oldPrice = Number(product.price)
        updates.price30ml =
          Number.isFinite(oldPrice) && oldPrice >= 0
            ? oldPrice
            : 0
      }

      // New prices must be configured manually
      if (!hasField('price50ml')) {
        updates.price50ml = 0
      }

      if (!hasField('price100ml')) {
        updates.price100ml = 0
      }

      // Never assume old bottle stock equals mixture volume
      if (!hasField('stockMl')) {
        updates.stockMl = 0
      }

      const needsMigration = Object.keys(updates).length > 0

      if (needsMigration) {
        // Hide the product until its new inventory is configured
        updates.isAvailable = false

        await Product.collection.updateOne(
          { _id: product._id },
          { $set: updates }
        )

        migratedCount++

        console.log(`Migrated: ${product.name}`)
      }
    }

    console.log('------------------------------')
    console.log('Migration completed!')
    console.log(`Products found: ${products.length}`)
    console.log(`Products migrated: ${migratedCount}`)
    console.log('Old price and stock fields were preserved.')
    console.log('Migrated products are hidden until configured.')
    console.log('------------------------------')

  } catch (error) {
    console.error('Migration failed:', error.message)
    process.exitCode = 1

  } finally {
    await mongoose.disconnect()
  }
}

migrateProducts()
