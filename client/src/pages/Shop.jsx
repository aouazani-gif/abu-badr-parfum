
import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Checkout from '../components/Checkout'
import ProductDetails from '../components/ProductDetails'

const allowedSizes = [30, 50, 100]

function Shop() {
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
    
    fetch('https://abu-badr-parfum-2.onrender.com/api/products')
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
const response = await fetch('https://abu-badr-parfum-2.onrender.com/api/orders', {
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
    <>
      <Navbar cartCount={cartCount} />

      {/* LUXURY HERO */}
      <section className="luxury-hero">
        <div className="hero-content">
          <p className="hero-eyebrow">
            <span></span>
            THE ART OF ELEGANCE
            <span></span>
          </p>

          <h1>
            YOUR SCENT.
            <br />
            <span>YOUR IDENTITY.</span>
          </h1>

          <p className="hero-description">
            Discover exclusive fragrances crafted
            <br className="desktop-break" />
            for men who leave a lasting impression.
          </p>

          <button
            className="hero-cta"
            onClick={exploreCollection}
          >
            EXPLORE COLLECTION
            <span>→</span>
          </button>
        </div>

        <div className="hero-visual">
          <img
            src="/images/abu-badr-hero-perfume.jpg"
            alt="Abu Badr luxury perfume bottle surrounded by golden smoke"
          />
        </div>

        <div className="hero-bottom-glow"></div>
      </section>

      {/* BENEFITS STRIP */}
      <section className="hero-benefits">
        <div className="benefit-item">
          <span className="benefit-icon">◇</span>
          <span>PREMIUM QUALITY</span>
        </div>

        <div className="benefit-divider"></div>

        <div className="benefit-item">
          <span className="benefit-icon">♢</span>
          <span>SECURE SHOPPING</span>
        </div>

        <div className="benefit-divider"></div>

        <div className="benefit-item">
          <span className="benefit-icon">⇢</span>
          <span>FAST DELIVERY</span>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="products-section" id="products">
        <p className="subtitle">OUR SELECTION</p>
        <h2>Featured Fragrances</h2>

        <div className="product-search">
          <input
            type="text"
            placeholder="Search for a fragrance..."
            value={searchTerm}
            onChange={event => setSearchTerm(event.target.value)}
          />

          {searchTerm && (
            <button onClick={() => setSearchTerm('')}>
              Clear
            </button>
          )}
        </div>

        <div className="product-sorting">
          <label htmlFor="sort-products">Sort by:</label>

          <select
            id="sort-products"
            value={sortOption}
            onChange={event => setSortOption(event.target.value)}
          >
            <option value="default">Default</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Name: A to Z</option>
          </select>
        </div>

        {loading && <p>Loading products...</p>}

        {error && <p className="error-message">{error}</p>}

        {!loading && !error && (
          sortedProducts.length === 0 ? (
            <p className="empty-cart">
              {searchTerm
                ? 'No fragrances match your search.'
                : 'No fragrances are currently available.'}
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
                      <p>{product.category}</p>
                      <h3>{product.name}</h3>

                      <span className="price">
                        {Number(product.price30ml).toLocaleString()} DZD
                      </span>
                      <p>Starting price — 30 ml</p>

                      <label>Choose bottle size:</label>

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
                          : 'Price unavailable'}
                      </p>

                      <button
                        className="details-button"
                        onClick={() => setSelectedProduct(product)}
                      >
                        VIEW DETAILS
                      </button>

                      {outOfStock && <p>OUT OF STOCK</p>}

                      {!outOfStock && (
                        <p>Available mixture: {remainingMl} ml</p>
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
                          ? 'OUT OF STOCK'
                          : cannotAdd
                            ? 'NOT ENOUGH MIXTURE'
                            : 'ADD TO CART'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        )}
      </section>

      <ProductDetails
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={addToCart}
        cart={cart}
      />

      {/* CART */}
      <section className="cart-section" id="cart">
        <p className="subtitle">YOUR SELECTION</p>
        <h2>Shopping Cart</h2>

        {cart.length === 0 ? (
          <p className="empty-cart">Your cart is empty.</p>
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
                    <p>Size: {item.sizeMl} ml</p>
                    <p>{Number(item.price).toLocaleString()} DZD each</p>
                    <p>
                      Subtotal: {(
                        item.price * item.quantity
                      ).toLocaleString()} DZD
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
                    Remove
                  </button>
                </div>
              )
            })}

            <div className="cart-total">
              <h3>Total: {total.toLocaleString()} DZD</h3>
            </div>
          </>
        )}
      </section>

      {/* CHECKOUT */}
      {orderPlaced ? (
        <section className="order-success">
          <h2>Thank you for your order!</h2>
          <p>Your order has been successfully saved.</p>
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
          />
        </>
      )}
    </>
  )
}

export default Shop
