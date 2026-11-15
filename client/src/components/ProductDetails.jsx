
function ProductDetails({ product, onClose, onAddToCart }) {
  if (!product) return null

  const outOfStock = Number(product.stock) <= 0

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
          <p className="product-modal-category">{product.category}</p>
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
            onClick={() => {
              onAddToCart(product)
              onClose()
            }}
            disabled={outOfStock}
          >
            {outOfStock ? 'OUT OF STOCK' : 'ADD TO CART'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductDetails
