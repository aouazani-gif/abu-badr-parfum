
import { useState, useEffect } from 'react'

const allowedSizes = [30, 50, 100]

function ProductDetails({ product, onClose, onAddToCart, cart }) {
  const [selectedSize, setSelectedSize] = useState(30)

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

  function handleAddToCart() {
    const added = onAddToCart(product, selectedSize)

    if (added) {
      onClose()
    }
  }

  return (
    <div className="product-modal-overlay" onClick={onClose}>
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
            {product.category}
          </p>

          <h2>{product.name}</h2>

          <p className="product-modal-description">
            {product.description ||
              'Discover this exclusive fragrance from Abu Badr Parfum.'}
          </p>

          <label>Choose bottle size:</label>

          <div
            className="size-picker modal-size-picker"
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
              : 'Price unavailable'}
          </h3>

          <p>
            Available mixture: {remainingMl} ml
          </p>

          <p className={outOfStock || cannotAdd
            ? 'stock-unavailable'
            : 'stock-available'}
          >
            {outOfStock
              ? 'OUT OF STOCK'
              : cannotAdd
                ? 'NOT ENOUGH MIXTURE FOR THIS SIZE'
                : 'IN STOCK'}
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
              ? 'OUT OF STOCK'
              : cannotAdd
                ? 'NOT ENOUGH MIXTURE'
                : 'ADD TO CART'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductDetails
