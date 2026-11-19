
const dns = require('dns')
dns.setServers(['8.8.8.8', '1.1.1.1'])

const mongoose = require('mongoose')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env') })

const Product = require('./models/Product')

const images = {
  'Stronger With You':
    'https://perfumes.ec/cdn/shop/files/EmporioArmaniStrongerWithYou100ml.png?v=1713289268',

  'Ultra Male':
    'https://image-optimizer-reg.production.sephora-asia.net/images/product_images/1_Product_8435415011990-JEAN-PAUL-GAULTIER-Ultra-Male-Eau-De_0cfa870e80a485aa5da45f19204ec6b572d2afec_1728475201.png',

  'The Most Wanted':
    'https://media.falabella.com/falabellaPE/18381638_1/w%3D1500%2Ch%3D1500%2Cfit%3Dcover',

  'Eden Juicy Apple | 01':
    'https://cdn.mos.cms.futurecdn.net/3UQHMj3eiB6yyQD7aV2Zze.jpg',

  'Le Male Elixir':
    'https://hollywoodperfumeria.com/cdn/shop/files/PORTADA_09bbb4ea-ec69-4dd1-8eda-a82fd8cdc3ec.jpg?v=1694044815',

  'Taj Sunset':
    'https://images.matas.dk/encode/3616302023868_20251029141200.jpg',

  'Althaïr':
    'https://parfums-de-marly.com/cdn/shop/files/ALTHAIR-PERFUME-75-PACK3-1X1jpeg.jpg?v=1751875139&width=1445',

  'Bleu de Chanel':
    'https://cdn.prod.website-files.com/67434f39b39a3123f573054a/69f8733741d300047ed34ada_bleu%20de%20chanel%20800%20px.png',

  'Summer Hammer':
    'https://casaflores.pe/cdn/shop/files/lorenzo-pazzaglia-summer-hammer-peru-decant.png?v=1779298627',

  'Vibrato':
    'https://sospirointernational.com/cdn/shop/products/VIBRATO_2_1346x.jpg?v=1648579706',

  'K':
    'https://www.news-parfums.com/58817-tm_thickbox_default/k-by-dolce-gabbana-parfum.jpg',

  'Sauvage':
    'https://image-optimizer-reg.production.sephora-asia.net/images/product_images/zoom_1_Product_209882-Dior-Sauvage-Eau-De-Parfum-200ml_ab47580b613eb4c255a08e0d39c078781c29b9ed_1555309411.png',

  'Scandal Absolu':
    'https://media.marionnaud.sk/medias/sys_master/prd-images/ha4/ha7/12409296977950/prd-front-72825_2000x2000/prd-front-72825-2000x2000.jpg',

  'Stronger With You Intensely':
    'https://f.fcdn.app/imgs/9ed5e7/www.sanroque.com.uy/sanruy/e21e/original/catalogo/122565_122565_4/1500-1500/perfume-emporio-armani-stronger-with-you-intensely-edp-100ml-perfume-emporio-armani-stronger-with-you-intensely-edp-100ml.jpg',

  'Hacivat':
    'https://www.libertineparfumerie.com.au/cdn/shop/files/Libertine-Packshot-7--4_1200x1200.png?v=1716531283',

  'Whisky Silver':
    'https://api.eleganciacompany.com/storage/products/170322_1.png',

  'Hundred Silent Ways':
    'https://noseparis.com/media/catalog/product/cache/347e24147afc53942168a65937a6a684/n/o/nose_paris_0041_nishane_hundred_silent_ways.png',

  'Urba Pura':
    'https://izapachy.pl/img/products/11/43/90/1_max.jpg',

  'Soft':
    'https://www.dsfragrances.com/cdn/shop/files/rn-image_picker_lib_temp_5272cf23-011e-4b71-af5d-fdb695a50e68.png?v=1772812257&width=720',

  'Le Beau Paradise Garden':
    'https://saludglobal.vtexassets.com/arquivos/ids/169453/8435415091244.jpg?v=638537298268670000',

  'L.12.12 Noir':
    'https://image1.lacoste.com/dw/image/v2/AAQM_PRD/on/demandware.static/Sites-FR-Site/Sites-master/fr/dwa14e0557/LC005A01_000_24.jpg',

  'L.12.12 Blanc':
    'https://samawa.ae/cdn/shop/files/3386460149082-2.jpg?v=1748427543',

  'Ameer Al Oudh':
    'https://mediahub.coastfashion.com/m6291107458571_clear_xl_1.jpeg',

  'Pineapple':
    'https://static.thcdn.com/productimg/original/12779635-6534862417297190.jpg',

  'Scandal':
    'https://bogart-april-storage.omn.proximis.com/Imagestorage/imagesSynchro/600/600/7f1330e9e986c2021827189e6dbf43ca68b8b4c1_b3346915-4b08-427e-92e8-front.jpeg',

  'Booster':
    'https://image1.lacoste.com/dw/image/v2/AAQM_PRD/on/demandware.static/Sites-BE-Site/Sites-master/fr_BE/dwd86263a7/LC010A01_000_24.jpg',

  'Almaz':
    'https://fragrancerevolutionboutique.co.uk/cdn/shop/files/IMG_5313.jpg?v=1726494131&width=1445',

  'Boss Bottled Unlimited':
    'https://emiratesfragrance.com/cdn/shop/files/Hugo-Boss-Boss-Bottled-Unlimited-Eau-de-Toilette-100ML-For-Men-1_c2cd555c-4541-4202-bdd8-84938a0f644d.jpg?v=1729351323&width=1080'
}

async function updateProductImages() {
  try {
    const mongoUri =
      process.env.MONGO_URI ||
      process.env.MONGODB_URI ||
      process.env.MONGO_URL

    if (!mongoUri) {
      throw new Error('MongoDB connection string not found')
    }

    await mongoose.connect(mongoUri)
    console.log('Connected to MongoDB')

    let updated = 0
    let skipped = 0
    let missing = 0

    for (const [name, image] of Object.entries(images)) {
      const result = await Product.updateOne(
        {
          name,
          $or: [
            { image: '' },
            { image: null },
            { image: { $exists: false } }
          ]
        },
        {
          $set: { image }
        }
      )

      if (result.modifiedCount > 0) {
        updated++
        console.log('Image added:', name)
      } else {
        const exists = await Product.exists({ name })

        if (exists) {
          skipped++
          console.log('Already has an image:', name)
        } else {
          missing++
          console.log('Product not found:', name)
        }
      }
    }

    console.log('\nImage update completed!')
    console.log('Updated:', updated)
    console.log('Skipped:', skipped)
    console.log('Not found:', missing)

  } catch (error) {
    console.error('Image Update Error:', error.message)
  } finally {
    await mongoose.disconnect()
    console.log('MongoDB disconnected')
  }
}

updateProductImages()

