
import { useState, useEffect } from 'react'

const allowedSizes = [30, 50, 100]

function ProductDetails({ product, onClose, onAddToCart, cart, language = 'en' }) {
  const [selectedSize, setSelectedSize] = useState(30)

  const isArabic = language === 'ar'

  const t = {
    chooseSize: isArabic ? 'اختر حجم القارورة:' : 'Choose bottle size:',
    availableMixture: isArabic ? 'الكمية المتوفرة:' : 'Available mixture:',
    outOfStock: isArabic ? 'نفدت الكمية' : 'OUT OF STOCK',
    notEnough: isArabic ? 'الكمية غير كافية لهذا الحجم' : 'NOT ENOUGH MIXTURE FOR THIS SIZE',
    notEnoughButton: isArabic ? 'الكمية غير كافية' : 'NOT ENOUGH MIXTURE',
    inStock: isArabic ? 'متوفر' : 'IN STOCK',
    addToCart: isArabic ? 'أضف إلى السلة' : 'ADD TO CART',
    priceUnavailable: isArabic ? 'السعر غير متوفر' : 'Price unavailable',
    defaultDescription: isArabic
      ? 'اكتشف هذا العطر الحصري من أبو بدر للعطور.'
      : 'Discover this exclusive fragrance from Abu Badr Parfum.',
    sizeLabel: isArabic ? 'اختر الحجم' : 'Choose size'
  }

  useEffect(() => {
    setSelectedSize(30)
  }, [product])

  if (!product) return null

  const stockMl = Number(product.stockMl) || 0

  const usedMl = cart.reduce((total, item) => {
    return item.id === product.id
      ? total + item.sizeMl * item.quantity
      : total
  }, 0)

  const remainingMl = Math.max(0, stockMl - usedMl)

  const price = Number(product[`price${selectedSize}ml`])

  const outOfStock = stockMl <= 0
  const cannotAdd = remainingMl < selectedSize

  const displayedCategory = isArabic
    ? product.categoryAr || product.category
    : product.category

  const displayedDescription = isArabic
    ? product.descriptionAr || product.description || t.defaultDescription
    : product.description || t.defaultDescription

  function handleAddToCart() {
    const added = onAddToCart(product, selectedSize)

    if (added) {
      onClose()
    }
  }

  return (
    <div
      className="product-modal-overlay"
      onClick={onClose}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <div
        className="product-modal"
        onClick={event => event.stopPropagation()}
      >
        <button className="product-modal-close" onClick={onClose}>
          &times;
        </button>

        <div className="product-modal-image">
          {product.image ? (
            <img
              className="product-modal-photo"
              src={product.image}
              alt={product.name}
            />
          ) : (
            <div className="bottle-shape">
              <span>AB</span>
            </div>
          )}
        </div>

        <div className="product-modal-info">

          <p className="product-modal-category">
            {displayedCategory}
          </p>

          {/* Perfume name always stays in English */}
          <h2 dir="ltr" style={{ textAlign: isArabic ? 'right' : 'left' }}>
            {product.name}
          </h2>

          <p className="product-modal-description">
            {displayedDescription}
          </p>

          <label>{t.chooseSize}</label>

          <div
            className="size-picker modal-size-picker"
            role="group"
            aria-label={`${t.sizeLabel}: ${product.name}`}
            style={{
              display: 'flex',
              gap: '8px',
              margin: '12px 0',
              flexWrap: 'wrap'
            }}
          >
            {allowedSizes.map(size => {
              const isSelected = selectedSize === size
              const sizePrice = Number(product[`price${size}ml`])

              return (
                <button
                  key={size}
                  type="button"
                  className={`size-option ${isSelected ? 'active' : ''}`}
                  onClick={() => setSelectedSize(size)}
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

          <h3 className="product-modal-price">
            {Number.isFinite(price)
              ? `${price.toLocaleString()} DZD`
              : t.priceUnavailable}
          </h3>

          <p>
            {t.availableMixture} {remainingMl} ml
          </p>

          <p
            className={
              outOfStock || cannotAdd
                ? 'stock-unavailable'
                : 'stock-available'
            }
          >
            {outOfStock
              ? t.outOfStock
              : cannotAdd
                ? t.notEnough
                : t.inStock}
          </p>

          <button
            className="add-button"
            onClick={handleAddToCart}
            disabled={
              outOfStock ||
              cannotAdd ||
              !Number.isFinite(price)
            }
          >
            {outOfStock
              ? t.outOfStock
              : cannotAdd
                ? t.notEnoughButton
                : t.addToCart}
          </button>

        </div>
      </div>
    </div>
  )
}

export default ProductDetails
