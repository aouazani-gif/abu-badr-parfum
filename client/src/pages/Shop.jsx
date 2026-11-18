
import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Checkout from '../components/Checkout'
import ProductDetails from '../components/ProductDetails'

const API_URL = 'https://abu-badr-parfum-2.onrender.com/api'
const allowedSizes = [30, 50, 100]

const translations = {
  en: {
    heroEyebrow: 'THE ART OF ELEGANCE',
    heroTitle: 'YOUR SCENT.',
    heroTitle2: 'YOUR IDENTITY.',
    heroDescription: 'Discover exclusive fragrances crafted for men who leave a lasting impression.',
    explore: 'EXPLORE COLLECTION',
    premium: 'PREMIUM QUALITY',
    secure: 'SECURE SHOPPING',
    delivery: 'FAST DELIVERY',
    selection: 'OUR SELECTION',
    featured: 'Featured Fragrances',
    search: 'Search for a fragrance...',
    clear: 'Clear',
    sortBy: 'Sort by:',
    default: 'Default',
    lowHigh: 'Price: Low to High',
    highLow: 'Price: High to Low',
    nameSort: 'Name: A to Z',
    loading: 'Loading products...',
    noMatch: 'No fragrances match your search.',
    unavailable: 'No fragrances are currently available.',
    startingPrice: 'Starting price — 30 ml',
    chooseSize: 'Choose bottle size:',
    priceUnavailable: 'Price unavailable',
    viewDetails: 'VIEW DETAILS',
    outOfStock: 'OUT OF STOCK',
    available: 'Available mixture:',
    notEnough: 'NOT ENOUGH MIXTURE',
    addToCart: 'ADD TO CART',
    yourSelection: 'YOUR SELECTION',
    cart: 'Shopping Cart',
    emptyCart: 'Your cart is empty.',
    size: 'Size:',
    each: 'each',
    subtotal: 'Subtotal:',
    remove: 'Remove',
    total: 'Total:',
    thankYou: 'Thank you for your order!',
    orderSaved: 'Your order has been successfully saved.',
  },

  ar: {
    heroEyebrow: 'فن الأناقة',
    heroTitle: 'عطرك.',
    heroTitle2: 'هويتك.',
    heroDescription: 'اكتشف عطوراً مميزة صُممت للرجل الذي يترك انطباعاً لا يُنسى.',
    explore: 'اكتشف مجموعتنا',
    premium: 'جودة عالية',
    secure: 'تسوق آمن',
    delivery: 'توصيل سريع',
    selection: 'اختياراتنا',
    featured: 'عطور مميزة',
    search: 'ابحث عن عطر...',
    clear: 'مسح',
    sortBy: 'ترتيب حسب:',
    default: 'الافتراضي',
    lowHigh: 'السعر: من الأقل إلى الأعلى',
    highLow: 'السعر: من الأعلى إلى الأقل',
    nameSort: 'الاسم: أ إلى ي',
    loading: 'جاري تحميل العطور...',
    noMatch: 'لا توجد عطور تطابق بحثك.',
    unavailable: 'لا توجد عطور متاحة حالياً.',
    startingPrice: 'السعر يبدأ من — 30 مل',
    chooseSize: 'اختر حجم القارورة:',
    priceUnavailable: 'السعر غير متاح',
    viewDetails: 'عرض التفاصيل',
    outOfStock: 'نفد المخزون',
    available: 'الكمية المتبقية من المزيج:',
    notEnough: 'الكمية غير كافية',
    addToCart: 'أضف إلى السلة',
    yourSelection: 'اختياراتك',
    cart: 'سلة التسوق',
    emptyCart: 'سلة التسوق فارغة.',
    size: 'الحجم:',
    each: 'للوحدة',
    subtotal: 'المجموع الفرعي:',
    remove: 'حذف',
    total: 'المجموع:',
    thankYou: 'شكراً لطلبك!',
    orderSaved: 'تم تسجيل طلبك بنجاح.',
  },
}

function Shop({ language, setLanguage }) {
  const t = translations[language] || translations.en
  const isArabic = language === 'ar'

  const [products, setProducts] = useState([])

  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('abuBadrCart')
      const parsedCart = savedCart ? JSON.parse(savedCart) : []

      if (!Array.isArray(parsedCart)) return []

      return parsedCart.filter(item =>
        item.id &&
        allowedSizes.includes(Number(item.sizeMl)) &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0
      )
    } catch {
      return []
    }
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [sortOption, setSortOption] = useState('default')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedSizes, setSelectedSizes] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderError, setOrderError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem('abuBadrCart', JSON.stringify(cart))
    } catch (error) {
      console.error('Could not save cart:', error)
    }
  }, [cart])

  useEffect(() => {
    fetch(`${API_URL}/products`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch products')
        }

        return response.json()
      })
      .then(data => {
        setProducts(data)
        setLoading(false)
      })
      .catch(error => {
        setError(error.message)
        setLoading(false)
      })
  }, [])

  const filteredProducts = products.filter(product =>
    `${product.name} ${product.category}`
      .toLowerCase()
      .includes(searchTerm.trim().toLowerCase())
  )

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOption) {
      case 'price-low':
        return Number(a.price30ml) - Number(b.price30ml)

      case 'price-high':
        return Number(b.price30ml) - Number(a.price30ml)

      case 'name':
        return a.name.localeCompare(b.name)

      default:
        return 0
    }
  })

  function getUsedMl(productId, excludedSize = null) {
    return cart.reduce((total, item) => {
      if (item.id !== productId) return total

      if (excludedSize !== null && item.sizeMl === excludedSize) {
        return total
      }

      return total + item.sizeMl * item.quantity
    }, 0)
  }

  function addToCart(product, sizeMl = 30) {
    sizeMl = Number(sizeMl)

    if (!allowedSizes.includes(sizeMl)) return false

    const stockMl = Number(product.stockMl) || 0
    const usedMl = getUsedMl(product.id)
    const remainingMl = stockMl - usedMl

    if (remainingMl < sizeMl) return false

    const price = Number(product[`price${sizeMl}ml`])

    if (!Number.isFinite(price) || price < 0) return false

    const existingItem = cart.find(
      item => item.id === product.id && item.sizeMl === sizeMl
    )

    const cartItem = {
      id: product.id,
      name: product.name,
      category: product.category,
      image: product.image,
      sizeMl,
      price,
      stockMl,
      quantity: 1
    }

    if (existingItem) {
      setCart(currentCart =>
        currentCart.map(item =>
          item.id === product.id && item.sizeMl === sizeMl
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      )
    } else {
      setCart(currentCart => [...currentCart, cartItem])
    }

    return true
  }

  function updateQuantity(id, sizeMl, amount) {
    const item = cart.find(
      cartItem => cartItem.id === id && cartItem.sizeMl === sizeMl
    )

    if (!item) return

    const otherSizesUsed = getUsedMl(id, sizeMl)

    const availableForThisSize = Math.max(
      0,
      Number(item.stockMl) - otherSizesUsed
    )

    const maxQuantity = Math.floor(availableForThisSize / sizeMl)

    setCart(currentCart =>
      currentCart
        .map(cartItem => {
          if (cartItem.id !== id || cartItem.sizeMl !== sizeMl) {
            return cartItem
          }

          const newQuantity = cartItem.quantity + amount

          return {
            ...cartItem,
            quantity: Math.min(newQuantity, maxQuantity)
          }
        })
        .filter(cartItem => cartItem.quantity > 0)
    )
  }

  function removeFromCart(id, sizeMl) {
    setCart(currentCart =>
      currentCart.filter(
        item => !(item.id === id && item.sizeMl === sizeMl)
      )
    )
  }

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  )

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  async function handlePlaceOrder(orderData) {
    setIsSubmitting(true)
    setOrderError('')

    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customer: orderData.customer,
          products: orderData.products.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            sizeMl: item.sizeMl
          }))
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to place order')
      }

      setOrderPlaced(true)
      setCart([])
      localStorage.removeItem('abuBadrCart')
    } catch (error) {
      setOrderError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  function exploreCollection() {
    document.getElementById('products')?.scrollIntoView({
      behavior: 'smooth'
    })
  }

  return (
    <div dir={isArabic ? 'rtl' : 'ltr'}>

      <Navbar
        cartCount={cartCount}
        language={language}
        setLanguage={setLanguage}
      />

      {/* HERO */}
            {/* HERO */}
      <section
        className={`luxury-hero ${isArabic ? 'hero-arabic' : 'hero-english'}`}
        dir="ltr"
      >
        {/* TEXT — ALWAYS ON THE LEFT */}
        <div
          className="hero-content"
          dir={isArabic ? 'rtl' : 'ltr'}
          style={{
            position: 'relative',
            zIndex: 2,
            width: '58%',
            maxWidth: '720px',
            marginLeft: 0,
            marginRight: 'auto',
            textAlign: isArabic ? 'right' : 'left'
          }}
        >
          <p className="hero-eyebrow">
            <span></span>
            {t.heroEyebrow}
            <span></span>
          </p>

          <h1>
            {t.heroTitle}
            <br />
            <span>{t.heroTitle2}</span>
          </h1>

          <p className="hero-description">
            {t.heroDescription}
          </p>

          <button
            className="hero-cta"
            onClick={exploreCollection}
          >
            {t.explore}
            <span>{isArabic ? '←' : '→'}</span>
          </button>
        </div>

        {/* IMAGE — ALWAYS ON THE RIGHT */}
        <div className="hero-visual">
          <img
            src="/images/abu-badr-hero-perfume.jpg"
            alt="Abu Badr luxury perfume bottle"
          />
        </div>

        <div className="hero-bottom-glow"></div>
      </section>

      {/* BENEFITS */}
      <section className="hero-benefits">

        <div className="benefit-item">
          <span className="benefit-icon">◇</span>
          <span>{t.premium}</span>
        </div>

        <div className="benefit-divider"></div>

        <div className="benefit-item">
          <span className="benefit-icon">♢</span>
          <span>{t.secure}</span>
        </div>

        <div className="benefit-divider"></div>

        <div className="benefit-item">
          <span className="benefit-icon">⇢</span>
          <span>{t.delivery}</span>
        </div>

      </section>

      {/* PRODUCTS */}
      <section className="products-section" id="products">

        <p className="subtitle">{t.selection}</p>
        <h2>{t.featured}</h2>

        <div className="product-search">

          <input
            type="text"
            placeholder={t.search}
            value={searchTerm}
            onChange={event => setSearchTerm(event.target.value)}
          />

          {searchTerm && (
            <button onClick={() => setSearchTerm('')}>
              {t.clear}
            </button>
          )}

        </div>

        <div className="product-sorting">

          <label htmlFor="sort-products">
            {t.sortBy}
          </label>

          <select
            id="sort-products"
            value={sortOption}
            onChange={event => setSortOption(event.target.value)}
          >
            <option value="default">{t.default}</option>
            <option value="price-low">{t.lowHigh}</option>
            <option value="price-high">{t.highLow}</option>
            <option value="name">{t.nameSort}</option>
          </select>

        </div>

        {loading && <p>{t.loading}</p>}

        {error && <p className="error-message">{error}</p>}

        {!loading && !error && (
          sortedProducts.length === 0 ? (

            <p className="empty-cart">
              {searchTerm ? t.noMatch : t.unavailable}
            </p>

          ) : (

            <div className="products-grid">

              {sortedProducts.map((product, index) => {

                const selectedSize = Number(
                  selectedSizes[product.id] || 30
                )

                const price = Number(
                  product[`price${selectedSize}ml`]
                )

                const stockMl = Number(product.stockMl) || 0
                const usedMl = getUsedMl(product.id)
                const remainingMl = Math.max(0, stockMl - usedMl)

                const outOfStock = stockMl <= 0
                const cannotAdd = remainingMl < selectedSize

                return (

                  <div className="product-card" key={product.id}>

                    <div className={`product-image bottle-${(index % 4) + 1}`}>

                      {product.image ? (
                        <>
                          <img
                            className="product-photo"
                            src={product.image}
                            alt={product.name}
                            onError={event => {
                              event.currentTarget.style.display = 'none'
                              event.currentTarget.nextElementSibling.style.display = 'flex'
                            }}
                          />

                          <div
                            className="bottle-shape product-image-fallback"
                            style={{ display: 'none' }}
                          >
                            <span>AB</span>
                          </div>
                        </>
                      ) : (
                        <div className="bottle-shape">
                          <span>AB</span>
                        </div>
                      )}

                    </div>

                    <div className="product-info">

                      <p>{isArabic ? (product.categoryAr || product.category) : product.category}</p>
                      <h3>{product.name}</h3>

                      <span className="price">
                        {Number(product.price30ml).toLocaleString()} DZD
                      </span>

                      <p>{t.startingPrice}</p>

                      <label>{t.chooseSize}</label>

                      <div
                        className="size-picker"
                        role="group"
                        aria-label={`Choose size for ${product.name}`}
                        style={{
                          display: 'flex',
                          gap: '8px',
                          margin: '12px 0',
                          flexWrap: 'wrap'
                        }}
                      >

                        {allowedSizes.map(size => {

                          const isSelected = selectedSize === size

                          const sizePrice = Number(
                            product[`price${size}ml`]
                          )

                          return (

                            <button
                              key={size}
                              type="button"
                              className={`size-option ${isSelected ? 'active' : ''}`}
                              onClick={() =>
                                setSelectedSizes(current => ({
                                  ...current,
                                  [product.id]: size
                                }))
                              }
                              aria-pressed={isSelected}
                              style={{
                                flex: '1',
                                minWidth: '75px',
                                padding: '10px 6px',
                                borderRadius: '7px',
                                border: isSelected
                                  ? '1px solid #c9a45c'
                                  : '1px solid #51452f',
                                background: isSelected
                                  ? 'linear-gradient(145deg, #c9a45c, #a9843e)'
                                  : '#151515',
                                color: isSelected ? '#080808' : '#e8e0d2',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                fontWeight: isSelected ? '700' : '500'
                              }}
                            >

                              <span style={{ display: 'block' }}>
                                {size} ml
                              </span>

                              <span
                                style={{
                                  display: 'block',
                                  fontSize: '11px',
                                  marginTop: '4px',
                                  opacity: 0.9
                                }}
                              >
                                {Number.isFinite(sizePrice)
                                  ? `${sizePrice.toLocaleString()} DA`
                                  : 'N/A'}
                              </span>

                            </button>
                          )
                        })}

                      </div>

                      <p className="price">
                        {Number.isFinite(price)
                          ? `${price.toLocaleString()} DZD`
                          : t.priceUnavailable}
                      </p>

                      <button
                        className="details-button"
                        onClick={() => setSelectedProduct(product)}
                      >
                        {t.viewDetails}
                      </button>

                      {outOfStock && <p>{t.outOfStock}</p>}

                      {!outOfStock && (
                        <p>
                          {t.available} {remainingMl} ml
                        </p>
                      )}

                      <button
                        className="add-button"
                        onClick={() => addToCart(product, selectedSize)}
                        disabled={
                          outOfStock ||
                          cannotAdd ||
                          !Number.isFinite(price)
                        }
                      >
                        {outOfStock
                          ? t.outOfStock
                          : cannotAdd
                            ? t.notEnough
                            : t.addToCart}
                      </button>

                    </div>
                  </div>
                )
              })}

            </div>
          )
        )}

      </section>

      {/* PRODUCT DETAILS */}
      <ProductDetails
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={addToCart}
        cart={cart}
        language={language}
      />

      {/* CART */}
      <section className="cart-section" id="cart">

        <p className="subtitle">{t.yourSelection}</p>
        <h2>{t.cart}</h2>

        {cart.length === 0 ? (

          <p className="empty-cart">{t.emptyCart}</p>

        ) : (

          <>

            {cart.map(item => {

              const otherSizesUsed = getUsedMl(item.id, item.sizeMl)

              const maxQuantity = Math.floor(
                Math.max(0, Number(item.stockMl) - otherSizesUsed) /
                item.sizeMl
              )

              return (

                <div
                  className="cart-item"
                  key={`${item.id}-${item.sizeMl}`}
                >

                  <div>
                    <h3>{item.name}</h3>

                    <p>
                      {t.size} {item.sizeMl} ml
                    </p>

                    <p>
                      {Number(item.price).toLocaleString()} DZD {t.each}
                    </p>

                    <p>
                      {t.subtotal} {(item.price * item.quantity).toLocaleString()} DZD
                    </p>
                  </div>

                  <div className="quantity-controls">

                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.sizeMl, -1)
                      }
                    >
                      -
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.sizeMl, 1)
                      }
                      disabled={item.quantity >= maxQuantity}
                    >
                      +
                    </button>

                  </div>

                  <button
                    className="remove-button"
                    onClick={() =>
                      removeFromCart(item.id, item.sizeMl)
                    }
                  >
                    {t.remove}
                  </button>

                </div>
              )
            })}

            <div className="cart-total">
              <h3>
                {t.total} {total.toLocaleString()} DZD
              </h3>
            </div>

          </>
        )}

      </section>

      {/* CHECKOUT */}
      {orderPlaced ? (

        <section className="order-success">
          <h2>{t.thankYou}</h2>
          <p>{t.orderSaved}</p>
        </section>

      ) : (

        <>
          {orderError && (
            <p className="error-message">{orderError}</p>
          )}

         <Checkout
  cart={cart}
  total={total}
  onPlaceOrder={handlePlaceOrder}
  isSubmitting={isSubmitting}
  language={language}
/>    
        </>

      )}

    </div>
  )
}

export default Shop
