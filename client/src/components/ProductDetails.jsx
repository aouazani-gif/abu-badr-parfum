
function ProductDetails({ product, onClose, onAddToCart, cart }) {
  if (!product) return null

  const outOfStock = Number(product.stock) <= 0

  const cartItem = cart.find(
    item => item.id === product.id
  )

  const reachedStockLimit =
    cartItem && cartItem.quantity >= Number(product.stock)

  function handleAddToCart() {
    const added = onAddToCart(product)

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

          <h3 className="product-modal-price">
            {Number(product.price).toLocaleString()} DZD
          </h3>

          <p className={outOfStock ? 'stock-unavailable' : 'stock-available'}>
            {outOfStock ? 'OUT OF STOCK' : 'IN STOCK'}
          </p>

          <button
            className="add-button"
            onClick={handleAddToCart}
            disabled={outOfStock || reachedStockLimit}
          >
            {outOfStock
              ? 'OUT OF STOCK'
              : reachedStockLimit
                ? 'MAXIMUM STOCK ADDED'
                : 'ADD TO CART'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductDetails
