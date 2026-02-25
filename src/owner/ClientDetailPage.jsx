import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  addClientOrder,
  deleteClientOrder,
  getClientById,
  getClientStats,
  listClientOrders
} from '../services/clientService';
import { formatCurrency } from '../utils/helpers';
import './ClientDetailPage.css';

const orderInitial = {
  orderDate: '',
  productName: '',
  quantity: 1,
  price: 0,
  paymentMode: '',
  deliveryStatus: '',
  remarks: ''
};

function ClientDetailPage() {
  const { clientId } = useParams();
  const [client, setClient] = useState(null);
  const [orders, setOrders] = useState([]);
  const [orderForm, setOrderForm] = useState(orderInitial);

  const loadData = async () => {
    const clientData = await getClientById(clientId);
    const orderData = await listClientOrders(clientId);
    setClient(clientData);
    setOrders(orderData);
  };

  useEffect(() => {
    loadData().catch(console.error);
  }, [clientId]);

  if (!client) return <section>Client not found.</section>;

  const stats = getClientStats(orders);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await addClientOrder(clientId, orderForm);
    setOrderForm(orderInitial);
    loadData();
  };

  return (
    <section>
      <h1 className='section-title'>{client.name}</h1>
      <p>{client.email} | {client.phone}</p>
      <p>{client.address}</p>
      <p>Type: {client.clientType}</p>
      <p>Notes: {client.notes}</p>

      <div className='client-stats'>
        <p>Total Orders: {stats.totalOrders}</p>
        <p>Total Purchase: {formatCurrency(stats.totalPurchaseValue)}</p>
        <p>Last Purchase: {stats.lastPurchaseDate || '-'}</p>
      </div>

      <form className='form-card client-order-form' onSubmit={handleSubmit}>
        <h3>Add Manual Order</h3>
        <input type='date' value={orderForm.orderDate} onChange={(e) => setOrderForm({ ...orderForm, orderDate: e.target.value })} required />
        <input
          placeholder='Product name'
          value={orderForm.productName}
          onChange={(e) => setOrderForm({ ...orderForm, productName: e.target.value })}
          required
        />
        <input
          type='number'
          placeholder='Quantity'
          value={orderForm.quantity}
          onChange={(e) => setOrderForm({ ...orderForm, quantity: e.target.value })}
          required
        />
        <input
          type='number'
          placeholder='Price'
          value={orderForm.price}
          onChange={(e) => setOrderForm({ ...orderForm, price: e.target.value })}
          required
        />
        <input
          placeholder='Payment mode'
          value={orderForm.paymentMode}
          onChange={(e) => setOrderForm({ ...orderForm, paymentMode: e.target.value })}
        />
        <input
          placeholder='Delivery status'
          value={orderForm.deliveryStatus}
          onChange={(e) => setOrderForm({ ...orderForm, deliveryStatus: e.target.value })}
        />
        <textarea
          rows='2'
          placeholder='Remarks'
          value={orderForm.remarks}
          onChange={(e) => setOrderForm({ ...orderForm, remarks: e.target.value })}
        />
        <button className='btn' type='submit'>Add Order</button>
      </form>

      <div className='table-wrap'>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Product</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Delivery</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.orderDate}</td>
                <td>{order.productName}</td>
                <td>{order.quantity}</td>
                <td>{formatCurrency(order.price)}</td>
                <td>{formatCurrency(order.totalAmount)}</td>
                <td>{order.paymentMode}</td>
                <td>{order.deliveryStatus}</td>
                <td>
                  <button className='btn btn--ghost' onClick={() => deleteClientOrder(clientId, order.id).then(loadData)}>
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

export default ClientDetailPage;
