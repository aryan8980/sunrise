import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { addClient, deleteClient, listClientOrders, listClients, updateClient, getClientStats } from '../services/clientService';
import { formatCurrency } from '../utils/helpers';
import './OwnerClientsPage.css';

const initialClient = {
  name: '',
  phone: '',
  email: '',
  address: '',
  clientType: '',
  notes: ''
};

function OwnerClientsPage() {
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState(initialClient);
  const [editingId, setEditingId] = useState(null);

  const loadClients = async () => {
    const clientRows = await listClients();
    const withStats = await Promise.all(
      clientRows.map(async (client) => {
        const orders = await listClientOrders(client.id);
        return { ...client, ...getClientStats(orders) };
      })
    );
    setClients(withStats);
  };

  useEffect(() => {
    loadClients().catch(console.error);
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (editingId) {
      await updateClient(editingId, form);
    } else {
      await addClient(form);
    }
    setForm(initialClient);
    setEditingId(null);
    loadClients();
  };

  return (
    <section>
      <h1 className='section-title'>Owner Client Management</h1>
      <form className='form-card owner-client-form' onSubmit={handleSubmit}>
        <input placeholder='Name' value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input placeholder='Phone' value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
        <input placeholder='Email' value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input placeholder='Address' value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        <input
          placeholder='Client Type (Retail/B2B/VIP)'
          value={form.clientType}
          onChange={(e) => setForm({ ...form, clientType: e.target.value })}
        />
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
              <th>Type</th>
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
                <td>{client.clientType}</td>
                <td>{client.totalOrders}</td>
                <td>{formatCurrency(client.totalPurchaseValue)}</td>
                <td>{client.lastPurchaseDate || '-'}</td>
                <td>
                  <Link to={`/admin/clients/${client.id}`}>View</Link>{' '}
                  <button className='btn btn--ghost' onClick={() => {
                    setEditingId(client.id);
                    setForm(client);
                  }}>Edit</button>{' '}
                  <button className='btn btn--ghost' onClick={() => deleteClient(client.id).then(loadClients)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default OwnerClientsPage;
