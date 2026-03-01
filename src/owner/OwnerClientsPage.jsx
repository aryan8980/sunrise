import { Link } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { addClient, deleteClient, listClientOrders, listClients, updateClient, getClientStats } from '../services/clientService';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';
import './OwnerClientsPage.css';

const initialClient = {
  name: '',
  phone: '',
  address: '',
  notes: ''
};

function OwnerClientsPage() {
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState(initialClient);
  const [editingId, setEditingId] = useState(null);
  const [viewingOrders, setViewingOrders] = useState(null);
  const [orders, setOrders] = useState([]);

  const loadClients = useCallback(async () => {
    const clientRows = await listClients();
    const withStats = await Promise.all(
      clientRows.map(async (client) => {
        const orders = await listClientOrders(client.id);
        return { ...client, ...getClientStats(orders) };
      })
    );
    setClients(withStats);
  }, []);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        await loadClients();
      } catch (error) {
        console.error(error);
      }
    };
    fetchClients();
  }, [loadClients]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (editingId) {
      await updateClient(editingId, form);
      toast.success('Client updated.');
    } else {
      await addClient(form);
      toast.success('Client added.');
    }
    setForm(initialClient);
    setEditingId(null);
    loadClients();
  };

  const handleViewOrders = async (client) => {
    try {
      const clientOrders = await listClientOrders(client.id);
      setOrders(clientOrders);
      setViewingOrders(client);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load orders.');
    }
  };

  const calculateOrdersSummary = () => {
    const totalOrders = orders.length;
    const totalAmount = orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalAmount / totalOrders : 0;
    return { totalOrders, totalAmount, avgOrderValue };
  };

  return (
    <section>
      <h1 className='section-title'>Owner Client Management</h1>
      <form className='form-card owner-client-form' onSubmit={handleSubmit}>
        <input placeholder='Name' value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input placeholder='Phone' value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
        <input placeholder='Address' value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        <textarea rows='3' placeholder='Notes' value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        <button className='btn' type='submit'>
          {editingId ? 'Update Client' : 'Add Client'}
        </button>
      </form>

      <div className='table-wrap'>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Total Orders</th>
              <th>Total Purchase</th>
              <th>Last Purchase</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id}>
                <td>{client.name}</td>
                <td>{client.totalOrders}</td>
                <td>{formatCurrency(client.totalPurchaseValue)}</td>
                <td>{client.lastPurchaseDate || '-'}</td>
                <td>
                  <button className='btn btn--ghost' onClick={() => handleViewOrders(client)}>Orders</button>{' '}
                  <Link to={`/admin/clients/${client.id}`}>View</Link>{' '}
                  <button className='btn btn--ghost' onClick={() => {
                    setEditingId(client.id);
                    setForm(client);
                  }}>Edit</button>{' '}
                  <button className='btn btn--ghost' onClick={() => deleteClient(client.id).then(() => {
                    toast.success('Client deleted.');
                    loadClients();
                  })}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {viewingOrders && (
        <div className='orders-modal' onClick={() => setViewingOrders(null)}>
          <div className='orders-modal-content' onClick={(e) => e.stopPropagation()}>
            <div className='orders-modal-header'>
              <h2>{viewingOrders.name} - Orders & Summary</h2>
              <button className='btn btn--ghost' onClick={() => setViewingOrders(null)}>✕</button>
            </div>

            <div className='orders-summary'>
              <h3>Summary</h3>
              <div className='summary-stats'>
                <div className='summary-stat'>
                  <span className='summary-label'>Total Orders:</span>
                  <span className='summary-value'>{calculateOrdersSummary().totalOrders}</span>
                </div>
                <div className='summary-stat'>
                  <span className='summary-label'>Total Amount:</span>
                  <span className='summary-value'>{formatCurrency(calculateOrdersSummary().totalAmount)}</span>
                </div>
                <div className='summary-stat'>
                  <span className='summary-label'>Avg Order Value:</span>
                  <span className='summary-value'>{formatCurrency(calculateOrdersSummary().avgOrderValue)}</span>
                </div>
              </div>
            </div>

            <div className='orders-list'>
              <h3>Order History</h3>
              {orders.length === 0 ? (
                <p className='no-orders'>No orders yet</p>
              ) : (
                <div className='table-wrap'>
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id}>
                          <td>{order.orderDate || '-'}</td>
                          <td>{order.productName || '-'}</td>
                          <td>{order.quantity || 0}</td>
                          <td>{formatCurrency(order.price || 0)}</td>
                          <td>{formatCurrency(order.totalAmount || 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default OwnerClientsPage;
