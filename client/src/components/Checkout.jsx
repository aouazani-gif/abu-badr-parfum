
import { useState } from 'react'
import dz from 'geoalgeria'

function Checkout({ cart, total, onPlaceOrder, isSubmitting, language = 'en' }) {
  const isArabic = language === 'ar'

  const t = {
    emptyCart: isArabic ? 'سلة التسوق فارغة.' : 'Your cart is empty.',
    subtitle: isArabic ? 'بقيت خطوة واحدة' : 'ALMOST YOURS',
    title: isArabic ? 'أكمل طلبك' : 'Complete Your Order',
    fullName: isArabic ? 'الاسم الكامل' : 'Full Name',
    phone: isArabic ? 'رقم الهاتف (مثال: 0550123456)' : 'Phone Number (e.g. 0550123456)',
    wilaya: isArabic ? 'اختر ولايتك' : 'Select your Wilaya',
    commune: isArabic ? 'اختر بلديتك' : 'Select your Commune',
    selectWilayaFirst: isArabic ? 'اختر الولاية أولا' : 'Select a Wilaya first',
    address: isArabic ? 'عنوان التوصيل بالتفصيل (اختياري)' : 'Detailed Delivery Address (Optional)',
    payment: isArabic ? 'طريقة الدفع' : 'Payment Method',
    cod: isArabic ? 'الدفع عند الاستلام' : 'Cash on Delivery (COD)',
    payWhenArrives: isArabic ? 'ادفع عند وصول طلبك.' : 'Pay when your order arrives.',
    total: isArabic ? 'المجموع:' : 'Order Total:',
    placing: isArabic ? 'جارٍ إرسال الطلب...' : 'PLACING ORDER...',
    placeOrder: isArabic ? 'تأكيد الطلب' : 'PLACE ORDER',
    nameError: isArabic
      ? 'يرجى إدخال الاسم الكامل (3 أحرف على الأقل).'
      : 'Please enter your full name (at least 3 characters).',
    phoneError: isArabic
      ? 'يرجى إدخال رقم هاتف جزائري صحيح.'
      : 'Please enter a valid Algerian phone number.',
    wilayaError: isArabic ? 'يرجى اختيار الولاية.' : 'Please select your wilaya.',
    communeError: isArabic ? 'يرجى اختيار البلدية.' : 'Please select your commune.'
  }

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    wilaya: '',
    commune: '',
    address: ''
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
      ...(name === 'wilaya' ? { commune: '' } : {})
    }))

    setErrors(currentErrors => ({
      ...currentErrors,
      [name]: '',
      ...(name === 'wilaya' ? { commune: '' } : {})
    }))
  }

  function validateForm() {
    const newErrors = {}

    if (form.fullName.trim().length < 3) {
      newErrors.fullName = t.nameError
    }

    const cleanPhone = form.phone.replace(/[\s-]/g, '')

    const phoneRegex =
      /^(0[5-7]\d{8}|(\+213|213)[5-7]\d{8}|0[2-4]\d{7}|(\+213|213)[2-4]\d{7})$/

    if (!phoneRegex.test(cleanPhone)) {
      newErrors.phone = t.phoneError
    }

    if (!form.wilaya) {
      newErrors.wilaya = t.wilayaError
    }

    if (!form.commune) {
      newErrors.commune = t.communeError
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
        address: form.address.trim()
      },
      products: cart
    })
  }

  if (cart.length === 0) {
    return (
      <p className="empty-cart" dir={isArabic ? 'rtl' : 'ltr'}>
        {t.emptyCart}
      </p>
    )
  }

  return (
    <section
      className="checkout-section"
      id="checkout"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <p className="subtitle">{t.subtitle}</p>
      <h2>{t.title}</h2>

      <form className="checkout-form" onSubmit={handleSubmit}>
        <div className="checkout-field">
          <input
            type="text"
            name="fullName"
            placeholder={t.fullName}
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
            placeholder={t.phone}
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
            <option value="">{t.wilaya}</option>

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
              {form.wilaya ? t.commune : t.selectWilayaFirst}
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
            placeholder={t.address}
            value={form.address}
            onChange={handleChange}
            maxLength={300}
            disabled={isSubmitting}
          />
        </div>

        <div className="payment-info">
          <strong>{t.payment}</strong>
          <p>{t.cod}</p>
          <small>{t.payWhenArrives}</small>
        </div>

        <div className="checkout-total">
          <h3>
            {t.total} {Number(total).toLocaleString()} DZD
          </h3>
        </div>

        <button
          type="submit"
          className="order-button"
          disabled={isSubmitting || cart.length === 0}
        >
          {isSubmitting ? t.placing : t.placeOrder}
        </button>
      </form>
    </section>
  )
}

export default Checkout
