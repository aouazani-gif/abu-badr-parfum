
import { useState } from 'react'

const wilayas = [
  '01 - Adrar',
  '02 - Chlef',
  '03 - Laghouat',
  '04 - Oum El Bouaghi',
  '05 - Batna',
  '06 - Béjaïa',
  '07 - Biskra',
  '08 - Béchar',
  '09 - Blida',
  '10 - Bouira',
  '11 - Tamanrasset',
  '12 - Tébessa',
  '13 - Tlemcen',
  '14 - Tiaret',
  '15 - Tizi Ouzou',
  '16 - Alger',
  '17 - Djelfa',
  '18 - Jijel',
  '19 - Sétif',
  '20 - Saïda',
  '21 - Skikda',
  '22 - Sidi Bel Abbès',
  '23 - Annaba',
  '24 - Guelma',
  '25 - Constantine',
  '26 - Médéa',
  '27 - Mostaganem',
  '28 - M’Sila',
  '29 - Mascara',
  '30 - Ouargla',
  '31 - Oran',
  '32 - El Bayadh',
  '33 - Illizi',
  '34 - Bordj Bou Arréridj',
  '35 - Boumerdès',
  '36 - El Tarf',
  '37 - Tindouf',
  '38 - Tissemsilt',
  '39 - El Oued',
  '40 - Khenchela',
  '41 - Souk Ahras',
  '42 - Tipaza',
  '43 - Mila',
  '44 - Aïn Defla',
  '45 - Naâma',
  '46 - Aïn Témouchent',
  '47 - Ghardaïa',
  '48 - Relizane',
  '49 - Timimoun',
  '50 - Bordj Badji Mokhtar',
  '51 - Ouled Djellal',
  '52 - Béni Abbès',
  '53 - In Salah',
  '54 - In Guezzam',
  '55 - Touggourt',
  '56 - Djanet',
  '57 - El M’Ghair',
  '58 - El Meniaa',
  '59 - Aflou',
  '60 - Barika',
  '61 - Ksar Chellala',
  '62 - Messaad',
  '63 - Aïn Oussera',
  '64 - Bou Saâda',
  '65 - El Abiodh Sidi Cheikh',
  '66 - El Kantara',
  '67 - Bir El Ater',
  '68 - Ksar El Boukhari',
  '69 - Sidi Ali'
]

function Checkout({ cart, total, onPlaceOrder, isSubmitting }) {
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    wilaya: '',
    address: '',
  })

  const [errors, setErrors] = useState({})

  function handleChange(e) {
    const { name, value } = e.target

    setForm(currentForm => ({
      ...currentForm,
      [name]: value,
    }))

    setErrors(currentErrors => ({
      ...currentErrors,
      [name]: '',
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

    if (form.address.trim().length < 5) {
      newErrors.address =
        'Please enter a complete delivery address.'
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
        wilaya: form.wilaya,
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

            {wilayas.map(wilaya => (
              <option key={wilaya} value={wilaya}>
                {wilaya}
              </option>
            ))}
          </select>

          {errors.wilaya && (
            <p className="error-message">{errors.wilaya}</p>
          )}
        </div>

        <div className="checkout-field">
          <textarea
            name="address"
            placeholder="Full Delivery Address"
            value={form.address}
            onChange={handleChange}
            required
            minLength={5}
            maxLength={300}
            disabled={isSubmitting}
          />

          {errors.address && (
            <p className="error-message">{errors.address}</p>
          )}
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
