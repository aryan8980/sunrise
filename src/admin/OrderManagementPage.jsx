



import React, { useCallback, useEffect, useState } from 'react';
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

    if (lineItems.length === 0 || !lineItems.some(item => item.productId)) {
      toast.error('Please add at least one product before generating bill PDF.');
      return;
    }

    const selectedClient = clients.find((client) => client.id === orderForm.clientId);

    if (!selectedClient) {
      toast.error('Unable to fetch client details for bill.');
      return;
    }

    const billNo = orderForm.billNo || createBillNo();
    const orderDate = orderForm.orderDate || new Date().toISOString().slice(0, 10);
    const discountPercent = Number(orderForm.discount || 0);
    const subtotal = calculateTotal() / (1 - discountPercent / 100) || 0;
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

    // Line items content
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    let yPosition = 93;

    for (let item of lineItems) {
      if (item.productId) {
        const product = products.find(p => p.id === item.productId);
        const productName = String(product?.name || '-');
        const maxProductNameLength = 30;
        const displayProductName = productName.length > maxProductNameLength 
          ? productName.substring(0, maxProductNameLength) + '...' 
          : productName;
        
        const lineTotal = item.quantity * item.price;

        doc.text(displayProductName, 16, yPosition);
        doc.text(String(product?.category || '-'), 70, yPosition);
        doc.text(String(item.quantity), 120, yPosition);
        doc.text(formatAmount(item.price), 138, yPosition);
        doc.text(formatAmount(lineTotal), 168, yPosition);

        yPosition += 7;
      }
    }

    doc.setDrawColor(210, 210, 210);
    doc.line(14, yPosition, 196, yPosition);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    yPosition += 9;
    doc.text('Subtotal:', 130, yPosition);
    doc.text(formatAmount(subtotal), 190, yPosition, { align: 'right' });

    if (discountPercent > 0) {
      yPosition += 7;
      doc.text(`Discount (${discountPercent}%):`, 130, yPosition);
      doc.text(`- ${formatAmount(discountAmount)}`, 190, yPosition, { align: 'right' });
    }

    doc.setDrawColor(180, 180, 180);
    doc.line(130, yPosition + 4, 190, yPosition + 4);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    yPosition += 13;
    doc.text('Grand Total:', 130, yPosition);
    doc.text(formatAmount(totalAmount), 190, yPosition, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`Payment Mode: ${orderForm.paymentMode || '-'}`, 14, yPosition + 8);

    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text('Thank you for choosing Sunrise Apparels.', 105, 285, { align: 'center' });

    doc.save(`${billNo}.pdf`);
    toast.success('Bill PDF generated successfully.');
  };

  const handleEditOrder = (order) => {
    // Support both old single-product format and new multi-product format
    const reconstructedLineItems = order.lineItems 
      ? order.lineItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        }))
      : order.productId // Backward compatibility with old format
        ? [{
            productId: order.productId,
            quantity: order.quantity,
            price: order.price
          }]
        : [{ ...lineItemInitial }];

    setOrderForm({
      clientId: order.clientId,
      billNo: order.billNo,
      orderDate: order.orderDate,
      discount: order.discount || 0,
      paymentMode: order.paymentMode
    });
    setLineItems(reconstructedLineItems);
    setEditingOrder(order);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setOrderForm(orderInitial);
    setLineItems([{ ...lineItemInitial }]);
    setEditingOrder(null);
    setShowForm(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!orderForm.clientId) {
      toast.error('Please select a client.');
      return;
    }

    if (lineItems.length === 0) {
      toast.error('Please add at least one product.');
      return;
    }

    // Validate all line items have required fields
    for (let item of lineItems) {
      if (!item.productId) {
        toast.error('Please select a product for all line items.');
        return;
      }
      if (!item.quantity || item.quantity <= 0) {
        toast.error('Please enter valid quantity for all products.');
        return;
      }
    }

    if (!orderForm.billNo) {
      toast.error('Please enter a bill number.');
      return;
    }

    try {
      // Format line items with product details
      const formattedLineItems = lineItems.map((item) => {
        const product = products.find(p => p.id === item.productId);
        // Ensure price is set, either from item.price or from product lookup
        const price = Number(item.price || product?.price || 0);
        const quantity = Number(item.quantity || 0);
        
        console.log(`Line item: ${product?.name}, Qty: ${quantity}, Price: ${price}, Total: ${quantity * price}`);
        
        return {
          productId: item.productId,
          productName: product?.name || 'Unknown Product',
          productCategory: product?.category || '-',
          quantity: quantity,
          price: price,
          lineTotal: quantity * price
        };
      });

      // Calculate total from formatted line items (with correct prices)
      const subtotal = formattedLineItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
      const discountPercent = Number(orderForm.discount || 0);
      const discountAmount = subtotal * (discountPercent / 100);
      const totalAmount = Math.max(0, subtotal - discountAmount);
      
      console.log(`Subtotal: ${subtotal}, Discount: ${discountAmount}, Total: ${totalAmount}`);

      const payload = {
        orderDate: orderForm.orderDate,
        lineItems: formattedLineItems,
        discount: Number(orderForm.discount || 0),
        totalAmount: totalAmount,
        paymentMode: orderForm.paymentMode,
        billNo: orderForm.billNo
      };
      
      console.log('Payload:', payload);

      if (editingOrder) {
        await updateClientOrder(editingOrder.clientId, editingOrder.id, payload);
        toast.success('Order updated successfully.');
      } else {
        await addClientOrder(orderForm.clientId, payload);
        toast.success('Order added successfully.');
      }
      
      setOrderForm(orderInitial);
      setLineItems([{ ...lineItemInitial }]);
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

  const handleMarkCompleted = async (clientId, orderId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
      await updateClientOrder(clientId, orderId, { status: newStatus });
      toast.success(`Order marked as ${newStatus}.`);
      loadData();
    } catch (error) {
      console.error(error);
      toast.error('Failed to update order status.');
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
          
          <div className='line-items-section'>
            <div className='line-items-header'>
              <label>Products *</label>
              <button
                type='button'
                className='btn btn--sm btn--secondary'
                onClick={addLineItem}
              >
                + Add Product
              </button>
            </div>
            
            {lineItems.map((item, index) => (
              <div key={index} className='line-item-row'>
                <div className='line-item-fields'>
                  <div className='form-group form-group--inline'>
                    <label htmlFor={`product-${index}`}>Product</label>
                    <select
                      id={`product-${index}`}
                      value={item.productId}
                      onChange={(e) => updateLineItem(index, 'productId', e.target.value)}
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
                  
                  <div className='form-group form-group--inline'>
                    <label htmlFor={`quantity-${index}`}>Quantity</label>
                    <input
                      id={`quantity-${index}`}
                      type='number'
                      placeholder='1'
                      value={item.quantity}
                      onChange={(e) => updateLineItem(index, 'quantity', e.target.value)}
                      min='1'
                      required
                    />
                  </div>
                  
                  <div className='form-group form-group--inline'>
                    <label htmlFor={`price-${index}`}>Price (Per Unit)</label>
                    <input
                      id={`price-${index}`}
                      type='number'
                      value={item.price}
                      disabled
                      className='disabled-input'
                    />
                  </div>
                  
                  <div className='form-group form-group--inline'>
                    <label>Line Total</label>
                    <input
                      type='number'
                      value={(item.quantity * item.price || 0).toFixed(2)}
                      disabled
                      className='disabled-input'
                    />
                  </div>
                </div>
                
                {lineItems.length > 1 && (
                  <button
                    type='button'
                    className='btn btn--sm btn--danger line-item-remove'
                    onClick={() => removeLineItem(index)}
                    title='Remove this product'
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <div className='order-summary-section'>
            <div className='summary-row'>
              <span className='summary-label'>Subtotal:</span>
              <span className='summary-value'>{formatCurrency(calculateTotal() / (1 - (orderForm.discount || 0) / 100) || 0)}</span>
            </div>
            {orderForm.discount > 0 && (
              <div className='summary-row discount-row'>
                <span className='summary-label'>Discount ({orderForm.discount}%):</span>
                <span className='summary-value'>- {formatCurrency((calculateTotal() / (1 - (orderForm.discount || 0) / 100) || 0) * (orderForm.discount / 100))}</span>
              </div>
            )}
            <div className='summary-row total-row'>
              <span className='summary-label'>Total Amount:</span>
              <span className='summary-value'>{formatCurrency(calculateTotal())}</span>
            </div>
          </div>
          
          <div className='products-preview-table'>
            <h4>Order Details</h4>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Line Total</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.filter(item => item.productId).length === 0 ? (
                  <tr>
                    <td colSpan='4' style={{ textAlign: 'center', padding: '1rem' }}>
                      No products added yet
                    </td>
                  </tr>
                ) : (
                  lineItems.map((item, index) => {
                    if (!item.productId) return null;
                    const product = products.find(p => p.id === item.productId);
                    return (
                      <tr key={index}>
                        <td>{product?.name || '-'}</td>
                        <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                        <td style={{ textAlign: 'right' }}>{formatCurrency(item.price || 0)}</td>
                        <td style={{ textAlign: 'right', fontWeight: '600' }}>
                          {formatCurrency((item.quantity * item.price) || 0)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
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
              <th style={{ width: '40px' }}></th>
              <th>Date</th>
              <th>Bill No</th>
              <th>Client</th>
              <th>Phone</th>
              <th>Products</th>
              <th>Total Items</th>
              <th>Discount</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
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
              filteredOrders.map((order) => {
                // Support both old single-product and new multi-product formats
                const lineItems = order.lineItems ? order.lineItems : order.productId ? [{
                  productName: order.productName,
                  productCategory: order.productCategory,
                  quantity: order.quantity,
                  price: order.price
                }] : [];
                
                const totalQuantity = lineItems.reduce((sum, item) => sum + item.quantity, 0);
                const isMultiProduct = lineItems.length > 1;
                
                return (
                  <React.Fragment key={`${order.clientId}-${order.id}`}>
                    <tr>
                      <td style={{ width: '40px' }}>
                        {isMultiProduct && (
                          <button 
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '1.2rem',
                              padding: '0'
                            }}
                            onClick={() => {
                              const row = document.getElementById(`expand-${order.clientId}-${order.id}`);
                              if (row) {
                                row.style.display = row.style.display === 'none' ? 'table-row' : 'none';
                              }
                            }}
                            title='Expand to see all products'
                          >
                            ▶
                          </button>
                        )}
                      </td>
                      <td>{order.orderDate || '-'}</td>
                      <td>{order.billNo || '-'}</td>
                      <td>{order.clientName}</td>
                      <td>{order.clientPhone}</td>
                      <td>
                        {isMultiProduct ? (
                          <span style={{ fontWeight: '600', color: 'var(--color-primary)' }}>
                            {lineItems.length} products
                          </span>
                        ) : (
                          lineItems[0]?.productName || '-'
                        )}
                      </td>
                      <td>{totalQuantity}</td>
                      <td>{order.discount > 0 ? `${order.discount}%` : '-'}</td>
                      <td><strong>{formatCurrency(order.totalAmount || 0)}</strong></td>
                      <td>{order.paymentMode || '-'}</td>
                      <td>
                        <span style={{
                          padding: '0.4rem 0.8rem',
                          borderRadius: '20px',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          backgroundColor: order.status === 'completed' ? '#d4edda' : '#fff3cd',
                          color: order.status === 'completed' ? '#155724' : '#856404'
                        }}>
                          {order.status === 'completed' ? '✓ Completed' : 'Pending'}
                        </span>
                      </td>
                      <td className='actions-cell'>
                        <div className='order-actions'>
                          <button 
                            className='btn btn--ghost btn--small' 
                            onClick={() => handleEditOrder(order)}
                          >
                            Edit
                          </button>
                          <button 
                            className='btn btn--ghost btn--small' 
                            onClick={() => handleMarkCompleted(order.clientId, order.id, order.status)}
                          >
                            {order.status === 'completed' ? 'Mark Pending' : 'Mark Done'}
                          </button>
                          <button 
                            className='btn btn--ghost btn--small' 
                            onClick={() => handleDeleteOrder(order.clientId, order.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    {isMultiProduct && (
                      <tr 
                        id={`expand-${order.clientId}-${order.id}`}
                        style={{ 
                          display: 'none',
                          backgroundColor: '#f9f5f7'
                        }}
                      >
                        <td colSpan='12' style={{ padding: '1rem' }}>
                          <div style={{ paddingLeft: '1rem' }}>
                            <h4 style={{ margin: '0 0 0.75rem 0', color: 'var(--color-primary)' }}>
                              Products in this Order:
                            </h4>
                            <table style={{ 
                              width: '100%',
                              borderCollapse: 'collapse',
                              fontSize: '0.9rem'
                            }}>
                              <thead>
                                <tr style={{ borderBottom: '1px solid var(--color-gray-light)' }}>
                                  <th style={{ textAlign: 'left', padding: '0.5rem 0', fontWeight: '600' }}>Product</th>
                                  <th style={{ textAlign: 'left', padding: '0.5rem 0', fontWeight: '600' }}>Category</th>
                                  <th style={{ textAlign: 'left', padding: '0.5rem 0', fontWeight: '600' }}>Qty</th>
                                  <th style={{ textAlign: 'left', padding: '0.5rem 0', fontWeight: '600' }}>Price</th>
                                  <th style={{ textAlign: 'left', padding: '0.5rem 0', fontWeight: '600' }}>Line Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {lineItems.map((item, idx) => (
                                  <tr key={idx} style={{ borderBottom: '1px solid var(--color-gray-lightest)' }}>
                                    <td style={{ padding: '0.5rem 0' }}>{item.productName || '-'}</td>
                                    <td style={{ padding: '0.5rem 0' }}>{item.productCategory || '-'}</td>
                                    <td style={{ padding: '0.5rem 0' }}>{item.quantity}</td>
                                    <td style={{ padding: '0.5rem 0' }}>{formatCurrency(item.price || 0)}</td>
                                    <td style={{ padding: '0.5rem 0', fontWeight: '600' }}>
                                      {formatCurrency((item.quantity * item.price) || 0)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default OrderManagementPage;
