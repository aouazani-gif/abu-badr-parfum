
import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Checkout from '../components/Checkout'

function shop() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
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

  // Add product to cart
  function addToCart(product) {
    setCart(currentCart => {
      const existing = currentCart.find(
        item => item.id === product.id
      )

      if (existing) {
        return currentCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }

      return [...currentCart, { ...product, quantity: 1 }]
    })
  }

  // Update quantity
  function updateQuantity(id, amount) {
    setCart(currentCart =>
      currentCart
        .map(item =>
          item.id === id
            ? { ...item, quantity: item.quantity + amount }
            : item
        )
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
    (total, item) => total + item.quantity, 0
  )

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity, 0
  )

  // Submit a real order to the backend
  async function handlePlaceOrder(orderData) {
    setIsSubmitting(true)
    setOrderError('')

    try {
      const response = await fetch('http://localhost:5000/api/orders', {
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
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to place order')
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

      <section className="hero">
        <div className="hero-content">
          <p className="subtitle">THE ART OF ELEGANCE</p>
          <h1>YOUR SCENT.<br />YOUR IDENTITY.</h1>

          <p className="description">
            Discover exclusive fragrances crafted
            for men who leave a lasting impression.
          </p>

          <button
            className="shop-button"
            onClick={() =>
              document.getElementById('products').scrollIntoView({
                behavior: 'smooth'
              })
            }
          >
            EXPLORE COLLECTION
          </button>
        </div>
      </section>

      <section className="products-section" id="products">
        <p className="subtitle">OUR SELECTION</p>
        <h2>Featured Fragrances</h2>

        {loading && <p>Loading products...</p>}

        {error && <p className="error-message">{error}</p>}

        {!loading && !error && (
          <div className="products-grid">
            {products.map((product, index) => (
              <div className="product-card" key={product.id}>
                <div className={`product-image bottle-${(index % 4) + 1}`}>
                  <div className="bottle-shape">
                    <span>AB</span>
                  </div>
                </div>

                <div className="product-info">
                  <p>{product.category}</p>
                  <h3>{product.name}</h3>

                  <span className="price">
                    {product.price.toLocaleString()} DZD
                  </span>

                  <button
                    className="add-button"
                    onClick={() => addToCart(product)}
                  >
                    ADD TO CART
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="cart-section" id="cart">
        <p className="subtitle">YOUR SELECTION</p>
        <h2>Shopping Cart</h2>

        {cart.length === 0 ? (
          <p className="empty-cart">Your cart is empty.</p>
        ) : (
          <>
            {cart.map(item => (
              <div className="cart-item" key={item.id}>
                <div>
                  <h3>{item.name}</h3>
                  <p>{item.price.toLocaleString()} DZD</p>
                </div>

                <div className="quantity-controls">
                  <button onClick={() => updateQuantity(item.id, -1)}>
                    -
                  </button>

                  <span>{item.quantity}</span>

                  <button onClick={() => updateQuantity(item.id, 1)}>
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
              <h3>Total: {total.toLocaleString()} DZD</h3>
            </div>
          </>
        )}
      </section>

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

export default shop
