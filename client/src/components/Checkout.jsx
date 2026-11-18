
import { useState } from 'react'
import dz from 'geoalgeria'



function Checkout({ cart, total, onPlaceOrder, isSubmitting }) {
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    wilaya: '',
    commune: '',
    address: '',
  })

  const [errors, setErrors] = useState({})

  const selectedWilaya = dz.wilayas.find(
    wilaya => String(wilaya.code) === form.wilaya
  )

  const communes = form.wilaya
    ? dz.getCommunesByWilaya(Number(form.wilaya))
    : []

  function handleChange(e) {
    const { name, value } = e.target

    setForm(currentForm => ({
      ...currentForm,
      [name]: value,
      ...(name === 'wilaya' ? { commune: '' } : {}),
    }))

    setErrors(currentErrors => ({
      ...currentErrors,
      [name]: '',
      ...(name === 'wilaya' ? { commune: '' } : {}),
    }))
  }

  function validateForm() {
    const newErrors = {}

    if (form.fullName.trim().length < 3) {
      newErrors.fullName =
        'Please enter your full name (at least 3 characters).'
    }

    const cleanPhone = form.phone.replace(/[\s-]/g, '')

    const phoneRegex =
      /^(0[5-7]\d{8}|(\+213|213)[5-7]\d{8}|0[2-4]\d{7}|(\+213|213)[2-4]\d{7})$/

    if (!phoneRegex.test(cleanPhone)) {
      newErrors.phone =
        'Please enter a valid Algerian phone number.'
    }

    if (!form.wilaya) {
      newErrors.wilaya = 'Please select your wilaya.'
    }

    if (!form.commune) {
      newErrors.commune = 'Please select your commune.'
    }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()

    if (isSubmitting) return
    if (!validateForm()) return

    onPlaceOrder({
      customer: {
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        wilaya: `${String(selectedWilaya.code).padStart(2, '0')} - ${selectedWilaya.name_fr}`,
        commune: form.commune,
        address: form.address.trim(),
      },
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
        <div className="checkout-field">
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={form.fullName}
            onChange={handleChange}
            required
            minLength={3}
            maxLength={80}
            disabled={isSubmitting}
          />

          {errors.fullName && (
            <p className="error-message">{errors.fullName}</p>
          )}
        </div>

        <div className="checkout-field">
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number (e.g. 0550123456)"
            value={form.phone}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />

          {errors.phone && (
            <p className="error-message">{errors.phone}</p>
          )}
        </div>

        <div className="checkout-field">
          <select
            name="wilaya"
            value={form.wilaya}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          >
            <option value="">Select your Wilaya</option>

            {dz.wilayas.map(wilaya => (
              <option key={wilaya.code} value={String(wilaya.code)}>
                {String(wilaya.code).padStart(2, '0')} - {wilaya.name_fr}
              </option>
            ))}
          </select>

          {errors.wilaya && (
            <p className="error-message">{errors.wilaya}</p>
          )}
        </div>

        <div className="checkout-field">
          <select
            name="commune"
            value={form.commune}
            onChange={handleChange}
            required
            disabled={isSubmitting || !form.wilaya}
          >
            <option value="">
              {form.wilaya
                ? 'Select your Commune'
                : 'Select a Wilaya first'}
            </option>

            {communes.map(commune => (
              <option
                key={commune.code_commune}
                value={commune.name_fr}
              >
                {commune.name_fr}
              </option>
            ))}
          </select>

          {errors.commune && (
            <p className="error-message">{errors.commune}</p>
          )}
        </div>

        <div className="checkout-field">
          <textarea
            name="address"
            placeholder="Detailed Delivery Address (Optional)"
            value={form.address}
            onChange={handleChange}
            maxLength={300}
            disabled={isSubmitting}
          />
        </div>

        <div className="payment-info">
          <strong>Payment Method</strong>
          <p>Cash on Delivery (COD)</p>
          <small>Pay when your order arrives.</small>
        </div>

        <div className="checkout-total">
          <h3>
            Order Total: {Number(total).toLocaleString()} DZD
          </h3>
        </div>

        <button
          type="submit"
          className="order-button"
          disabled={isSubmitting || cart.length === 0}
        >
          {isSubmitting ? 'PLACING ORDER...' : 'PLACE ORDER'}
        </button>
      </form>
    </section>
  )
}

export default Checkout
