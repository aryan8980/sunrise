



import { useCallback, useEffect, useState } from 'react';
import {
  addClientOrder,
  deleteClientOrder,
  getClientById,
  listClientOrders,
  listClients,
  updateClientOrder
} from '../services/clientService';
import { listProducts } from '../services/productService';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import './OrderManagementPage.css';

const orderInitial = {
  clientId: '',
  billNo: '',
  orderDate: '',
  discount: 0,
  paymentMode: ''
};

const lineItemInitial = {
  productId: '',
  quantity: 1,
  price: 0
};

function OrderManagementPage() {
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [orderForm, setOrderForm] = useState(orderInitial);
  const [lineItems, setLineItems] = useState([{ ...lineItemInitial }]);
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClient, setFilterClient] = useState('all');

  const loadData = useCallback(async () => {
    try {
      const clientsList = await listClients();
      setClients(clientsList);

      const productsList = await listProducts();
      setProducts(productsList);

      // Load all orders from all clients
      const ordersWithClients = [];
      for (const client of clientsList) {
        const orders = await listClientOrders(client.id);
        orders.forEach(order => {
          const product = productsList.find(
            (p) => p.id === order.productId || p.name === order.productName
          );
          ordersWithClients.push({
            ...order,
            clientId: client.id,
            clientName: client.name,
            clientPhone: client.phone,
            productCategory: order.productCategory || product?.category || '-'
          });
        });
      }
      // Sort by date descending
      ordersWithClients.sort((a, b) => {
        return new Date(b.orderDate) - new Date(a.orderDate);
      });
      setAllOrders(ordersWithClients);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load data.');
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addLineItem = () => {
    setLineItems([...lineItems, { ...lineItemInitial }]);
  };

  const removeLineItem = (index) => {
    if (lineItems.length === 1) {
      toast.error('At least one product is required');
      return;
    }
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateLineItem = (index, field, value) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    
    // If product is selected, auto-fill price
    if (field === 'productId' && value) {
      const selectedProduct = products.find(p => p.id === value);
      if (selectedProduct) {
        updated[index].price = selectedProduct.price || 0;
      }
    }
    
    setLineItems(updated);
  };

  const calculateTotal = () => {
    const subtotal = lineItems.reduce((sum, item) => {
      return sum + (Number(item.quantity || 0) * Number(item.price || 0));
    }, 0);
    const discountPercent = Number(orderForm.discount || 0);
    const discountAmount = subtotal * (discountPercent / 100);
    return Math.max(0, subtotal - discountAmount);
  };

  const createBillNo = () => {
    const now = new Date();
    const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
      now.getDate()
    ).padStart(2, '0')}`;
    const timePart = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(
      2,
      '0'
    )}${String(now.getSeconds()).padStart(2, '0')}`;
    const randomPart = Math.floor(100 + Math.random() * 900);
    return `BL-${datePart}-${timePart}-${randomPart}`;
  };

  const formatAmount = (amount) => {
    return 'Rs. ' + Number(amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
  };

  const handleGenerateBillPdf = () => {
    if (!orderForm.clientId) {
      toast.error('Please select a client before generating bill PDF.');
      return;
    }

    if (!orderForm.productId) {
      toast.error('Please select a product before generating bill PDF.');
      return;
    }

    const selectedClient = clients.find((client) => client.id === orderForm.clientId);
    const selectedProduct = products.find((product) => product.id === orderForm.productId);

    if (!selectedClient || !selectedProduct) {
      toast.error('Unable to fetch client/product details for bill.');
      return;
    }

    const billNo = orderForm.billNo || createBillNo();
    const orderDate = orderForm.orderDate || new Date().toISOString().slice(0, 10);
    const quantity = Number(orderForm.quantity || 0);
    const unitPrice = Number(orderForm.price || 0);
    const discountPercent = Number(orderForm.discount || 0);
    const subtotal = quantity * unitPrice;
    const discountAmount = subtotal * (discountPercent / 100);
    const totalAmount = Math.max(0, subtotal - discountAmount);

    if (!orderForm.billNo || !orderForm.orderDate) {
      setOrderForm((prev) => ({
        ...prev,
        billNo,
        orderDate
      }));
    }

    const doc = new jsPDF();

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('SUNRISE APPARELS', 105, 20, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text('ORDER BILL / INVOICE', 105, 28, { align: 'center' });

    doc.setDrawColor(180, 180, 180);
    doc.line(14, 33, 196, 33);

    doc.setFontSize(11);
    doc.text(`Bill No: ${billNo}`, 14, 42);
    doc.text(`Order Date: ${orderDate}`, 140, 42);

    doc.text(`Client Name: ${selectedClient.name || '-'}`, 14, 52);
    doc.text(`Client Phone: ${selectedClient.phone || '-'}`, 14, 59);
    doc.text(`Client Email: ${selectedClient.email || '-'}`, 14, 66);

    doc.setDrawColor(210, 210, 210);
    doc.setFillColor(246, 246, 246);
    doc.rect(14, 76, 182, 10, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Product', 16, 83);
    doc.text('Category', 70, 83);
    doc.text('Qty', 120, 83);
    doc.text('Price', 138, 83);
    doc.text('Total', 170, 83);

    doc.setFont('helvetica', 'normal');
    const category = selectedProduct.category || '-';
    const productName = String(selectedProduct.name || '-');
    // Truncate product name if too long
    const maxProductNameLength = 30;
    const displayProductName = productName.length > maxProductNameLength 
      ? productName.substring(0, maxProductNameLength) + '...' 
      : productName;
    
    doc.text(displayProductName, 16, 93);
    doc.text(String(category), 70, 93);
    doc.text(String(quantity), 120, 93);
    doc.text(formatAmount(unitPrice), 138, 93);
    doc.text(formatAmount(subtotal), 168, 93);

    doc.setDrawColor(210, 210, 210);
    doc.line(14, 99, 196, 99);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text('Subtotal:', 130, 108);
    doc.text(formatAmount(subtotal), 190, 108, { align: 'right' });

    if (discountPercent > 0) {
      doc.text(`Discount (${discountPercent}%):`, 130, 115);
      doc.text(`- ${formatAmount(discountAmount)}`, 190, 115, { align: 'right' });
    }

    doc.setDrawColor(180, 180, 180);
    doc.line(130, discountPercent > 0 ? 119 : 112, 190, discountPercent > 0 ? 119 : 112);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Grand Total:', 130, discountPercent > 0 ? 128 : 121);
    doc.text(formatAmount(totalAmount), 190, discountPercent > 0 ? 128 : 121, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`Payment Mode: ${orderForm.paymentMode || '-'}`, 14, discountPercent > 0 ? 136 : 129);

    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text('Thank you for choosing Sunrise Apparels.', 105, 285, { align: 'center' });

    doc.save(`${billNo}.pdf`);
    toast.success('Bill PDF generated successfully.');
  };

  const handleEditOrder = (order) => {
    const selectedProduct = products.find(p => p.id === order.productId);
    setOrderForm({
      clientId: order.clientId,
      billNo: order.billNo,
      orderDate: order.orderDate,
      productId: order.productId || '',
      quantity: order.quantity,
      price: selectedProduct?.price || order.price || 0,
      discount: order.discount || 0,
      paymentMode: order.paymentMode
    });
    setEditingOrder(order);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setOrderForm(orderInitial);
    setEditingOrder(null);
    setShowForm(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!orderForm.clientId) {
      toast.error('Please select a client.');
      return;
    }

    if (!orderForm.productId) {
      toast.error('Please select a product.');
      return;
    }

    if (!orderForm.billNo) {
      toast.error('Please enter a bill number.');
      return;
    }

    try {
      const selectedProduct = products.find(p => p.id === orderForm.productId);
      const totalAmount = calculateTotal();
      const payload = {
        orderDate: orderForm.orderDate,
        productName: selectedProduct?.name || 'Unknown Product',
        productId: orderForm.productId,
        productCategory: selectedProduct?.category || '-',
        quantity: Number(orderForm.quantity),
        price: Number(orderForm.price),
        discount: Number(orderForm.discount || 0),
        totalAmount: totalAmount,
        paymentMode: orderForm.paymentMode,
        billNo: orderForm.billNo
      };

      if (editingOrder) {
        await updateClientOrder(editingOrder.clientId, editingOrder.id, payload);
        toast.success('Order updated successfully.');
      } else {
        await addClientOrder(orderForm.clientId, payload);
        toast.success('Order added successfully.');
      }
      
      setOrderForm(orderInitial);
      setEditingOrder(null);
      setShowForm(false);
      loadData();
    } catch (error) {
      console.error(error);
      toast.error(editingOrder ? 'Failed to update order.' : 'Failed to add order.');
    }
  };

  const handleDeleteOrder = async (clientId, orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    
    try {
      await deleteClientOrder(clientId, orderId);
      toast.success('Order deleted.');
      loadData();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete order.');
    }
  };

  // Filter orders
  const filteredOrders = allOrders.filter(order => {
    const matchesSearch = 
      order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.clientPhone.includes(searchTerm);
    
    const matchesClient = filterClient === 'all' || order.clientId === filterClient;
    
    return matchesSearch && matchesClient;
  });

  // Calculate summary
  const summary = {
    totalOrders: filteredOrders.length,
    totalRevenue: filteredOrders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0),
    avgOrderValue: filteredOrders.length > 0 
      ? filteredOrders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0) / filteredOrders.length 
      : 0
  };

  return (
    <section className='order-management-page'>
      <div className='page-header'>
        <h1 className='section-title'>Order Management</h1>
        <button className='btn' onClick={() => editingOrder ? handleCancelEdit() : setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add New Order'}
        </button>
      </div>

      {showForm && (
        <form className='form-card order-form' onSubmit={handleSubmit}>
          <h3>{editingOrder ? 'Edit Order' : 'Add New Order'}</h3>
          <div className='form-grid'>
            <div className='form-group'>
              <label htmlFor='client'>Client *</label>
              <select 
                id='client'
                value={orderForm.clientId} 
                onChange={(e) => setOrderForm({ ...orderForm, clientId: e.target.value })} 
                required
              >
                <option value=''>Select Client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} - {client.phone}
                  </option>
                ))}
              </select>
            </div>
            
            <div className='form-group'>
              <label htmlFor='billNo'>Bill No *</label>
              <input
                id='billNo'
                placeholder='Enter bill number'
                value={orderForm.billNo}
                onChange={(e) => setOrderForm({ ...orderForm, billNo: e.target.value })}
                required
              />
            </div>
            
            <div className='form-group'>
              <label htmlFor='orderDate'>Order Date *</label>
              <input 
                id='orderDate'
                type='date' 
                value={orderForm.orderDate} 
                onChange={(e) => setOrderForm({ ...orderForm, orderDate: e.target.value })} 
                required 
              />
            </div>
            
            <div className='form-group'>
              <label htmlFor='product'>Product *</label>
              <select
                id='product'
                value={orderForm.productId}
                onChange={(e) => handleProductSelect(e.target.value)}
                required
              >
                <option value=''>Select Product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - {formatCurrency(product.price)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className='form-group'>
              <label htmlFor='quantity'>Quantity *</label>
              <input
                id='quantity'
                type='number'
                placeholder='1'
                value={orderForm.quantity}
                onChange={(e) => setOrderForm({ ...orderForm, quantity: e.target.value })}
                min='1'
                required
              />
            </div>
            
            <div className='form-group'>
              <label htmlFor='price'>Price (Per Unit) *</label>
              <input
                id='price'
                type='number'
                value={orderForm.price}
                onChange={(e) => setOrderForm({ ...orderForm, price: e.target.value })}
                disabled
                className='disabled-input'
              />
            </div>
            
            <div className='form-group'>
              <label htmlFor='total'>Total Price</label>
              <input
                id='total'
                type='number'
                value={calculateTotal().toFixed(2)}
                disabled
                className='disabled-input'
              />
            </div>
            
            <div className='form-group'>
              <label htmlFor='discount'>Discount (%)</label>
              <input
                id='discount'
                type='number'
                placeholder='0'
                value={orderForm.discount}
                onChange={(e) => setOrderForm({ ...orderForm, discount: e.target.value })}
                min='0'
                max='100'
              />
            </div>
            
            <div className='form-group'>
              <label htmlFor='paymentMode'>Payment Mode *</label>
              <select
                id='paymentMode'
                value={orderForm.paymentMode}
                onChange={(e) => setOrderForm({ ...orderForm, paymentMode: e.target.value })}
              >
                <option value=''>Select Payment Mode</option>
                <option value='Cash'>Cash</option>
                <option value='Card'>Card</option>
                <option value='UPI'>UPI</option>
                <option value='Bank Transfer'>Bank Transfer</option>
                <option value='Cheque'>Cheque</option>
              </select>
            </div>
          </div>
          
          <div className='form-actions'>
            <button
              type='button'
              className='btn btn--ghost'
              onClick={handleGenerateBillPdf}
            >
              Generate Bill PDF
            </button>
            <button className='btn' type='submit'>
              {editingOrder ? 'Update Order' : 'Add Order'}
            </button>
          </div>
        </form>
      )}

      <div className='summary-cards'>
        <div className='summary-card'>
          <h4>Total Orders</h4>
          <p className='summary-value'>{summary.totalOrders}</p>
        </div>
        <div className='summary-card'>
          <h4>Total Revenue</h4>
          <p className='summary-value'>{formatCurrency(summary.totalRevenue)}</p>
        </div>
        <div className='summary-card'>
          <h4>Avg Order Value</h4>
          <p className='summary-value'>{formatCurrency(summary.avgOrderValue)}</p>
        </div>
      </div>

      <div className='filters-section'>
        <input
          type='text'
          placeholder='Search by client name, product, or phone...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='search-input'
        />
        
        <select value={filterClient} onChange={(e) => setFilterClient(e.target.value)}>
          <option value='all'>All Clients</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </div>

      <div className='table-wrap'>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Bill No</th>
              <th>Client</th>
              <th>Phone</th>
              <th>Product</th>
              <th>Category</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Discount</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan='12' style={{ textAlign: 'center' }}>
                  No orders found
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={`${order.clientId}-${order.id}`}>
                  <td>{order.orderDate || '-'}</td>
                  <td>{order.billNo || '-'}</td>
                  <td>{order.clientName}</td>
                  <td>{order.clientPhone}</td>
                  <td>{order.productName}</td>
                  <td>{order.productCategory}</td>
                  <td>{order.quantity}</td>
                  <td>{formatCurrency(order.price || 0)}</td>
                  <td>{order.discount > 0 ? `${order.discount}%` : '-'}</td>
                  <td><strong>{formatCurrency(order.totalAmount || 0)}</strong></td>
                  <td>{order.paymentMode || '-'}</td>
                  <td>
                    <button 
                      className='btn btn--ghost btn--small' 
                      onClick={() => handleEditOrder(order)}
                    >
                      Edit
                    </button>
                    <button 
                      className='btn btn--ghost btn--small' 
                      onClick={() => handleDeleteOrder(order.clientId, order.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default OrderManagementPage;
