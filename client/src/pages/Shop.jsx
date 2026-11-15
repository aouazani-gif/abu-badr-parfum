
import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Checkout from '../components/Checkout'
import ProductDetails from '../components/ProductDetails'

function Shop() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOption, setSortOption] = useState('default')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderError, setOrderError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch products from Express API
  useEffect(() => {
    fetch('http://localhost:5000/api/products')
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

  const availableProducts = products

  // Filter products
  const filteredProducts = availableProducts.filter(product =>
    `${product.name} ${product.category}`
      .toLowerCase()
      .includes(searchTerm.trim().toLowerCase())
  )

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOption) {
      case 'price-low':
        return Number(a.price) - Number(b.price)

      case 'price-high':
        return Number(b.price) - Number(a.price)

      case 'name':
        return a.name.localeCompare(b.name)

      default:
        return 0
    }
  })

  // Add product to cart
  function addToCart(product) {
    if (Number(product.stock) <= 0) return

    setCart(currentCart => {
      const existing = currentCart.find(
        item => item.id === product.id
      )

      if (existing) {
        if (existing.quantity >= Number(product.stock)) {
          return currentCart
        }

        return currentCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }

      return [
        ...currentCart,
        { ...product, quantity: 1 }
      ]
    })
  }

  // Update cart quantity
  function updateQuantity(id, amount) {
    setCart(currentCart =>
      currentCart
        .map(item => {
          if (item.id !== id) return item

          const newQuantity = item.quantity + amount

          return {
            ...item,
            quantity: Math.min(
              newQuantity,
              Number(item.stock)
            )
          }
        })
        .filter(item => item.quantity > 0)
    )
  }

  // Remove product
  function removeFromCart(id) {
    setCart(currentCart =>
      currentCart.filter(item => item.id !== id)
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

  // Submit order
  async function handlePlaceOrder(orderData) {
    setIsSubmitting(true)
    setOrderError('')

    try {
      const response = await fetch(
        'http://localhost:5000/api/orders',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            customer: orderData.customer,
            products: orderData.products.map(item => ({
              productId: item.id,
              quantity: item.quantity
            }))
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to place order'
        )
      }

      setOrderPlaced(true)
      setCart([])

    } catch (error) {
      setOrderError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Navbar cartCount={cartCount} />

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <p className="subtitle">THE ART OF ELEGANCE</p>

          <h1>
            YOUR SCENT.<br />
            YOUR IDENTITY.
          </h1>

          <p className="description">
            Discover exclusive fragrances crafted
            for men who leave a lasting impression.
          </p>

          <button
            className="shop-button"
            onClick={() =>
              document.getElementById('products')?.scrollIntoView({
                behavior: 'smooth'
              })
            }
          >
            EXPLORE COLLECTION
          </button>
        </div>
      </section>

      {/* Products Section */}
      <section className="products-section" id="products">
        <p className="subtitle">OUR SELECTION</p>
        <h2>Featured Fragrances</h2>

        {/* Search */}
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

        {/* Sorting */}
        <div className="product-sorting">
          <label htmlFor="sort-products">
            Sort by:
          </label>

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

        {error && (
          <p className="error-message">{error}</p>
        )}

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
                const cartItem = cart.find(
                  item => item.id === product.id
                )

                const reachedStockLimit =
                  cartItem &&
                  cartItem.quantity >= Number(product.stock)

                const outOfStock =
                  Number(product.stock) <= 0

                return (
                  <div className="product-card" key={product.id}>

                    {/* Real Product Image */}
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
                        {Number(product.price).toLocaleString()} DZD
                      </span>

                      <button
                        className="details-button"
                        onClick={() => setSelectedProduct(product)}
                      >
                        VIEW DETAILS
                      </button>

                      {outOfStock && (
                        <p>OUT OF STOCK</p>
                      )}

                      <button
                        className="add-button"
                        onClick={() => addToCart(product)}
                        disabled={
                          outOfStock || reachedStockLimit
                        }
                      >
                        {outOfStock
                          ? 'OUT OF STOCK'
                          : reachedStockLimit
                            ? 'MAXIMUM STOCK ADDED'
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

      {/* Product Details */}
      <ProductDetails
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={addToCart}
      />

      {/* Cart */}
      <section className="cart-section" id="cart">
        <p className="subtitle">YOUR SELECTION</p>
        <h2>Shopping Cart</h2>

        {cart.length === 0 ? (
          <p className="empty-cart">
            Your cart is empty.
          </p>
        ) : (
          <>
            {cart.map(item => (
              <div className="cart-item" key={item.id}>
                <div>
                  <h3>{item.name}</h3>

                  <p>
                    {Number(item.price).toLocaleString()} DZD
                  </p>
                </div>

                <div className="quantity-controls">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                  >
                    -
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    disabled={
                      item.quantity >= Number(item.stock)
                    }
                  >
                    +
                  </button>
                </div>

                <button
                  className="remove-button"
                  onClick={() => removeFromCart(item.id)}
                >
                  Remove
                </button>
              </div>
            ))}

            <div className="cart-total">
              <h3>
                Total: {total.toLocaleString()} DZD
              </h3>
            </div>
          </>
        )}
      </section>

      {/* Checkout */}
      {orderPlaced ? (
        <section className="order-success">
          <h2>Thank you for your order!</h2>
          <p>Your order has been successfully saved.</p>
        </section>
      ) : (
        <>
          {orderError && (
            <p className="error-message">
              {orderError}
            </p>
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
