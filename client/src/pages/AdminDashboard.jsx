
import { useState, useEffect } from 'react'
import './AdminDashboard.css'

function AdminDashboard() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch orders from backend
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = sessionStorage.getItem('adminToken')

        const response = await fetch('http://localhost:5000/api/orders', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch orders')
        }

        setOrders(data.orders)
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = sessionStorage.getItem('adminToken')

      const response = await fetch(
        `http://localhost:5000/api/orders/${orderId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ status: newStatus })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update status')
      }

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? data.order : order
        )
      )
    } catch (error) {
      alert(error.message)
    }
  }

  if (loading) return <p>Loading orders...</p>
  if (error) return <p>{error}</p>

  return (
    <div className="admin-dashboard">

      {/* Header */}
      <header className="dashboard-header">
        <div>
          <h1>ABU BADR PARFUM</h1>
          <p>Administration Dashboard</p>
        </div>
      </header>

      {/* Statistics */}
      <section className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Orders</h3>
          <p>{orders.length}</p>
        </div>

        <div className="stat-card">
          <h3>Pending Orders</h3>
          <p>{orders.filter(order => order.status === 'Pending').length}</p>
        </div>

        <div className="stat-card">
          <h3>Delivered Orders</h3>
          <p>{orders.filter(order => order.status === 'Delivered').length}</p>
        </div>
      </section>

      {/* Orders */}
      <section className="orders-section">
        <h2>Orders Management</h2>

        {orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          orders.map((order) => (
            <div className="order-card" key={order._id}>

              <h3>Order #{order._id}</h3>

              <p>Customer: {order.customer.fullName}</p>
              <p>Phone: {order.customer.phone}</p>
              <p>Wilaya: {order.customer.wilaya}</p>
              <p>Address: {order.customer.address}</p>

              <h4>Products:</h4>

              {order.products.map((product, index) => (
                <p key={index}>
                  {product.name} × {product.quantity} — {product.price} DA
                </p>
              ))}

              <p className="order-total">
                Total: {order.total} DA
              </p>

              <div className="order-status">
                <label>Status:</label>

                <select
                  value={order.status}
                  onChange={(e) =>
                    updateOrderStatus(order._id, e.target.value)
                  }
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

            </div>
          ))
        )}
      </section>

    </div>
  )
}

export default AdminDashboard
