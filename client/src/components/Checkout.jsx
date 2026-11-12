
import { useState } from 'react'

function Checkout({ cart, total, onPlaceOrder, isSubmitting }) {
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    wilaya: '',
    address: '',
  })

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  function handleSubmit(e) {
    e.preventDefault()

    onPlaceOrder({
      customer: form,
      products: cart,
    })
  }

  if (cart.length === 0) {
    return <p className="empty-cart">Your cart is empty.</p>
  }

  return (
    <section className="checkout-section" id="checkout">
      <p className="subtitle">ALMOST YOURS</p>
      <h2>Complete Your Order</h2>

      <form className="checkout-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={form.fullName}
          onChange={handleChange}
          required
        />

        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={form.phone}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="wilaya"
          placeholder="Wilaya"
          value={form.wilaya}
          onChange={handleChange}
          required
        />

        <textarea
          name="address"
          placeholder="Full Delivery Address"
          value={form.address}
          onChange={handleChange}
          required
        />

        <div className="payment-info">
          <strong>Payment Method</strong>
          <p>Cash on Delivery (COD)</p>
          <small>Pay when your order arrives.</small>
        </div>

        <button
          type="submit"
          className="order-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'PLACING ORDER...' : 'PLACE ORDER'}
        </button>
      </form>
    </section>
  )
}

export default Checkout
