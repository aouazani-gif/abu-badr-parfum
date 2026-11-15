
import { useState, useEffect } from 'react'

function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [togglingId, setTogglingId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editingId, setEditingId] = useState(null)

  const emptyForm = {
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    stock: ''
  }

  const [form, setForm] = useState(emptyForm)

  // Fetch all products for admin
  const fetchProducts = async () => {
    try {
      setError('')

      const token = sessionStorage.getItem('adminToken')

      const response = await fetch(
        'http://localhost:5000/api/products/admin/all',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch products')
      }

      setProducts(
        data.map(product => ({
          ...product,
          id: product.id || product._id
        }))
      )
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  // Handle form inputs
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  // Add or update product
  const handleSubmit = async (e) => {
    e.preventDefault()

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const token = sessionStorage.getItem('adminToken')

      const productData = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock)
      }

      const url = editingId
        ? `http://localhost:5000/api/products/${editingId}`
        : 'http://localhost:5000/api/products'

      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Operation failed')
      }

      setSuccess(
        editingId
          ? 'Product updated successfully!'
          : 'Product added successfully!'
      )

      setForm(emptyForm)
      setEditingId(null)

      await fetchProducts()
    } catch (error) {
      setError(error.message)
    } finally {
      setSaving(false)
    }
  }

  // Start editing
  const handleEdit = (product) => {
    setEditingId(product.id)

    setForm({
      name: product.name || '',
      description: product.description || '',
      price: String(product.price),
      category: product.category || '',
      image: product.image || '',
      stock: String(product.stock ?? 0)
    })

    setSuccess('')
    setError('')

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingId(null)
    setForm(emptyForm)
    setError('')
    setSuccess('')
  }

  // Delete product
  const handleDelete = async (productId, productName) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${productName}?`
    )

    if (!confirmed) return

    setError('')
    setSuccess('')

    try {
      const token = sessionStorage.getItem('adminToken')

      const response = await fetch(
        `http://localhost:5000/api/products/${productId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete product')
      }

      if (editingId === productId) {
        handleCancelEdit()
      }

      setSuccess('Product deleted successfully!')

      await fetchProducts()
    } catch (error) {
      setError(error.message)
    }
  }

  // Show or hide product in public shop
  const handleToggleAvailability = async (product) => {
    setTogglingId(product.id)
    setError('')
    setSuccess('')

    try {
      const token = sessionStorage.getItem('adminToken')

      const response = await fetch(
        `http://localhost:5000/api/products/${product.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            isAvailable: !product.isAvailable
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to update product visibility'
        )
      }

      setSuccess(
        product.isAvailable
          ? 'Product hidden from shop!'
          : 'Product listed in shop!'
      )

      await fetchProducts()
    } catch (error) {
      setError(error.message)
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div style={styles.page}>

      <header style={styles.header}>
        <div>
          <h1 style={styles.brand}>ABU BADR PARFUM</h1>
          <p style={styles.subtitle}>PRODUCT MANAGEMENT</p>
        </div>

        <button
          style={styles.backButton}
          onClick={() => {
            window.location.href = '/admin/dashboard'
          }}
        >
          Back to Dashboard
        </button>
      </header>

      {/* Add / Edit Form */}
      <section style={styles.formCard}>

        <h2 style={styles.sectionTitle}>
          {editingId ? 'Edit Product' : 'Add New Product'}
        </h2>

        <form onSubmit={handleSubmit} style={styles.form}>

          <input
            style={styles.input}
            name="name"
            placeholder="Product name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            style={styles.input}
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
          />

          <input
            style={styles.input}
            name="price"
            type="number"
            min="0"
            placeholder="Price (DA)"
            value={form.price}
            onChange={handleChange}
            required
          />

          <input
            style={styles.input}
            name="category"
            placeholder="Category"
            value={form.category}
            onChange={handleChange}
            required
          />

          <input
            style={styles.input}
            name="image"
            placeholder="Image URL"
            value={form.image}
            onChange={handleChange}
          />

          <input
            style={styles.input}
            name="stock"
            type="number"
            min="0"
            step="1"
            placeholder="Stock quantity"
            value={form.stock}
            onChange={handleChange}
            required
          />

          <button
            type="submit"
            style={styles.primaryButton}
            disabled={saving}
          >
            {saving
              ? 'Saving...'
              : editingId
                ? 'Update Product'
                : 'Add Product'}
          </button>

          {editingId && (
            <button
              type="button"
              style={styles.cancelButton}
              onClick={handleCancelEdit}
            >
              Cancel Editing
            </button>
          )}

        </form>

        {success && (
          <p style={styles.success}>{success}</p>
        )}

        {error && (
          <p style={styles.error}>{error}</p>
        )}

      </section>

      {/* Products List */}
      <section style={styles.productsSection}>

        <div style={styles.listHeader}>
          <h2 style={styles.sectionTitle}>Existing Products</h2>

          <span style={styles.count}>
            {products.length} Products
          </span>
        </div>

        {loading ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <div style={styles.productsGrid}>

            {products.map(product => (
              <div key={product.id} style={styles.productCard}>

                {product.image && (
                  <img
                    src={product.image}
                    alt={product.name}
                    style={styles.productImage}
                  />
                )}

                <h3 style={styles.productName}>
                  {product.name}
                </h3>

                <p>Price: {product.price} DA</p>
                <p>Category: {product.category}</p>
                <p>Stock: {product.stock}</p>

                {/* Visibility status */}
                <p style={{
                  color: product.isAvailable
                    ? '#4caf50'
                    : '#ff5555',
                  fontWeight: 'bold'
                }}>
                  {product.isAvailable ? 'Listed' : 'Hidden'}
                </p>

                {/* Stock status */}
                <p style={{
                  color: Number(product.stock) > 0
                    ? '#4caf50'
                    : '#ff5555',
                  fontWeight: 'bold'
                }}>
                  {Number(product.stock) > 0
                    ? 'In stock'
                    : 'Out of stock'}
                </p>

                <p style={styles.description}>
                  {product.description || 'No description'}
                </p>

                <div style={styles.actions}>

                  <button
                    style={styles.editButton}
                    onClick={() => handleEdit(product)}
                  >
                    Edit
                  </button>

                  <button
                    style={styles.deleteButton}
                    onClick={() =>
                      handleDelete(product.id, product.name)
                    }
                  >
                    Delete
                  </button>

                </div>

                {/* Visibility toggle */}
                <button
                  style={{
                    ...styles.toggleButton,
                    background: product.isAvailable
                      ? '#555'
                      : '#267a45'
                  }}
                  disabled={togglingId === product.id}
                  onClick={() => handleToggleAvailability(product)}
                >
                  {togglingId === product.id
                    ? 'Updating...'
                    : product.isAvailable
                      ? 'Hide from shop'
                      : 'Show in shop'}
                </button>

              </div>
            ))}

          </div>
        )}

      </section>

    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#111',
    color: '#eee',
    padding: '30px',
    fontFamily: 'Arial, sans-serif'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '15px',
    borderBottom: '1px solid #3d3218',
    paddingBottom: '20px',
    marginBottom: '30px'
  },
  brand: {
    color: '#d4af37',
    letterSpacing: '2px'
  },
  subtitle: {
    color: '#aaa'
  },
  backButton: {
    padding: '10px 16px',
    background: 'transparent',
    color: '#d4af37',
    border: '1px solid #9c7b22',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  formCard: {
    background: '#1c1c1c',
    border: '1px solid #3d3218',
    borderRadius: '10px',
    padding: '25px',
    marginBottom: '35px'
  },
  sectionTitle: {
    color: '#d4af37',
    marginBottom: '20px'
  },
  form: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '15px'
  },
  input: {
    padding: '13px',
    background: '#292929',
    color: '#fff',
    border: '1px solid #444',
    borderRadius: '6px',
    outline: 'none',
    minWidth: 0
  },
  primaryButton: {
    padding: '13px',
    background: '#d4af37',
    color: '#111',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  cancelButton: {
    padding: '13px',
    background: '#444',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  success: {
    color: '#4caf50',
    marginTop: '15px'
  },
  error: {
    color: '#ff5555',
    marginTop: '15px'
  },
  productsSection: {
    marginTop: '30px'
  },
  listHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  count: {
    color: '#aaa'
  },
  productsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px'
  },
  productCard: {
    background: '#1c1c1c',
    border: '1px solid #333',
    borderRadius: '10px',
    padding: '20px',
    overflow: 'hidden'
  },
  productImage: {
    width: '100%',
    height: '180px',
    objectFit: 'contain',
    background: '#292929',
    borderRadius: '6px'
  },
  productName: {
    color: '#d4af37',
    marginBottom: '12px'
  },
  description: {
    color: '#aaa',
    fontSize: '14px'
  },
  actions: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px'
  },
  editButton: {
    flex: 1,
    padding: '10px',
    background: '#d4af37',
    color: '#111',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  deleteButton: {
    flex: 1,
    padding: '10px',
    background: '#a83232',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  toggleButton: {
    width: '100%',
    marginTop: '12px',
    padding: '11px',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold'
  }
}

export default Products
