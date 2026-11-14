
import { useState, useEffect } from 'react'

function Products() {
  const emptyForm = {
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    stock: ''
  }

  const [products, setProducts] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchProducts = async () => {
    try {
      const response = await fetch(
        'http://localhost:5000/api/products'
      )
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch products')
      }

      setProducts(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const token = sessionStorage.getItem('adminToken')

      const response = await fetch(
        editingId
          ? `http://localhost:5000/api/products/${editingId}`
          : 'http://localhost:5000/api/products',
        {
          method: editingId ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            ...form,
            price: Number(form.price),
            stock: Number(form.stock)
          })
        }
      )

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
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

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
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}?`)) return

    try {
      const token = sessionStorage.getItem('adminToken')

      const response = await fetch(
        `http://localhost:5000/api/products/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Delete failed')
      }

      if (editingId === id) {
        setEditingId(null)
        setForm(emptyForm)
      }

      setSuccess('Product deleted successfully!')
      await fetchProducts()
    } catch (err) {
      setError(err.message)
    }
  }

  const gold = '#d4af37'

  return (
    <div style={{
      minHeight: '100vh',
      background: '#111',
      color: '#eee',
      padding: '30px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: gold }}>ABU BADR PARFUM</h1>
      <h2>Product Management</h2>

      <button
        onClick={() => window.location.href = '/admin/dashboard'}
        style={{ padding: '10px', cursor: 'pointer' }}
      >
        Back to Dashboard
      </button>

      <div style={{
        background: '#1c1c1c',
        padding: '25px',
        borderRadius: '10px',
        marginTop: '25px'
      }}>
        <h2 style={{ color: gold }}>
          {editingId ? 'Edit Product' : 'Add New Product'}
        </h2>

        <form onSubmit={handleSubmit} style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '15px'
        }}>
          {[
            ['name', 'Product name', 'text'],
            ['description', 'Description', 'text'],
            ['price', 'Price (DA)', 'number'],
            ['category', 'Category', 'text'],
            ['image', 'Image URL', 'text'],
            ['stock', 'Stock quantity', 'number']
          ].map(([name, placeholder, type]) => (
            <input
              key={name}
              name={name}
              type={type}
              min={type === 'number' ? 0 : undefined}
              step={name === 'stock' ? 1 : undefined}
              placeholder={placeholder}
              value={form[name]}
              onChange={handleChange}
              required={['name', 'price', 'category', 'stock'].includes(name)}
              style={{
                padding: '13px',
                background: '#292929',
                color: 'white',
                border: '1px solid #555',
                borderRadius: '6px'
              }}
            />
          ))}

          <button type="submit" disabled={saving} style={{
            padding: '13px',
            background: gold,
            color: '#111',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>
            {saving
              ? 'Saving...'
              : editingId ? 'Update Product' : 'Add Product'}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null)
                setForm(emptyForm)
              }}
              style={{ padding: '13px', cursor: 'pointer' }}
            >
              Cancel Editing
            </button>
          )}
        </form>

        {success && <p style={{ color: '#4caf50' }}>{success}</p>}
        {error && <p style={{ color: '#ff5555' }}>{error}</p>}
      </div>

      <h2 style={{ color: gold, marginTop: '35px' }}>
        Existing Products ({products.length})
      </h2>

      {loading ? (
        <p>Loading products...</p>
      ) : products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px'
        }}>
          {products.map(product => (
            <div key={product.id} style={{
              background: '#1c1c1c',
              border: '1px solid #444',
              borderRadius: '10px',
              padding: '20px'
            }}>
              {product.image && (
                <img
                  src={product.image}
                  alt={product.name}
                  style={{
                    width: '100%',
                    height: '180px',
                    objectFit: 'contain'
                  }}
                />
              )}

              <h3 style={{ color: gold }}>{product.name}</h3>
              <p>Price: {product.price} DA</p>
              <p>Category: {product.category}</p>
              <p>Stock: {product.stock}</p>
              <p>{product.description || 'No description'}</p>

              <div style={{
                display: 'flex',
                gap: '10px',
                marginTop: '20px'
              }}>
                <button
                  onClick={() => handleEdit(product)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: gold,
                    color: '#111',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(product.id, product.name)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#a83232',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Products
