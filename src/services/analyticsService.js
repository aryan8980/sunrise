import { collection, getCountFromServer, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

function toMillis(value) {
  if (typeof value === 'number') return value;
  if (value && typeof value.toMillis === 'function') return value.toMillis();
  if (value && typeof value.seconds === 'number') return value.seconds * 1000;
  return 0;
}

function formatMonthKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function formatMonthLabel(monthKey) {
  const [year, month] = monthKey.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleString('en-US', { month: 'short', year: 'numeric' });
}

function getRecentMonthKeys(monthCount = 6) {
  const keys = [];
  const now = new Date();

  for (let i = monthCount - 1; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(formatMonthKey(date));
  }

  return keys;
}

async function getMonthlyAnalytics() {
  const [inquiriesSnap, productsSnap] = await Promise.all([
    getDocs(collection(db, 'inquiries')),
    getDocs(collection(db, 'products'))
  ]);

  const monthKeys = getRecentMonthKeys(6);
  const monthMap = Object.fromEntries(
    monthKeys.map((month) => [month, { month, inquiries: 0, productsAdded: 0 }])
  );

  inquiriesSnap.docs.forEach((d) => {
    const createdAt = toMillis(d.data().createdAt);
    if (!createdAt) return;
    const key = formatMonthKey(new Date(createdAt));
    if (monthMap[key]) monthMap[key].inquiries += 1;
  });

  productsSnap.docs.forEach((d) => {
    const createdAt = toMillis(d.data().createdAt);
    if (!createdAt) return;
    const key = formatMonthKey(new Date(createdAt));
    if (monthMap[key]) monthMap[key].productsAdded += 1;
  });

  return monthKeys.map((key) => ({
    ...monthMap[key],
    label: formatMonthLabel(key)
  }));
}

async function getMonthlyOrderStats() {
  const clientsSnap = await getDocs(collection(db, 'clients'));
  const monthKeys = getRecentMonthKeys(6);
  const monthMap = Object.fromEntries(
    monthKeys.map((month) => [month, { month, orders: 0, revenue: 0 }])
  );

  for (const clientDoc of clientsSnap.docs) {
    const ordersSnap = await getDocs(collection(db, 'clients', clientDoc.id, 'orders'));
    ordersSnap.docs.forEach((orderDoc) => {
      const order = orderDoc.data();
      if (order.orderDate) {
        const key = formatMonthKey(new Date(order.orderDate));
        if (monthMap[key]) {
          monthMap[key].orders += 1;
          monthMap[key].revenue += Number(order.totalAmount || 0);
        }
      }
    });
  }

  return monthKeys.map((key) => ({
    ...monthMap[key],
    label: formatMonthLabel(key)
  }));
}

async function getInquiryStatusBreakdown() {
  const inquiriesSnap = await getDocs(collection(db, 'inquiries'));
  const breakdown = { pending: 0, ongoing: 0, done: 0 };

  inquiriesSnap.docs.forEach((d) => {
    const status = d.data().status || 'pending';
    if (breakdown.hasOwnProperty(status)) {
      breakdown[status] += 1;
    }
  });

  return breakdown;
}

async function getProductCategorySummary() {
  const productsSnap = await getDocs(collection(db, 'products'));
  const categoryMap = {};

  productsSnap.docs.forEach((d) => {
    const category = d.data().category || 'Uncategorized';
    categoryMap[category] = (categoryMap[category] || 0) + 1;
  });

  return Object.entries(categoryMap).map(([name, count]) => ({
    name,
    count
  }));
}

async function getTopProducts() {
  const clientsSnap = await getDocs(collection(db, 'clients'));
  const productMap = {};

  for (const clientDoc of clientsSnap.docs) {
    const ordersSnap = await getDocs(collection(db, 'clients', clientDoc.id, 'orders'));
    ordersSnap.docs.forEach((orderDoc) => {
      const order = orderDoc.data();
      const productName = order.productName || 'Unknown';
      if (!productMap[productName]) {
        productMap[productName] = { name: productName, orders: 0, revenue: 0 };
      }
      productMap[productName].orders += 1;
      productMap[productName].revenue += Number(order.totalAmount || 0);
    });
  }

  return Object.values(productMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
}

export async function getDashboardStats() {
  const [productsCountSnap, inquiriesCountSnap, monthlyAnalytics, monthlyOrders, inquiryBreakdown, productCategories, topProducts] = await Promise.all([
    getCountFromServer(collection(db, 'products')),
    getCountFromServer(collection(db, 'inquiries')),
    getMonthlyAnalytics(),
    getMonthlyOrderStats(),
    getInquiryStatusBreakdown(),
    getProductCategorySummary(),
    getTopProducts()
  ]);

  // Calculate total orders and revenue
  const totalOrders = monthlyOrders.reduce((sum, m) => sum + m.orders, 0);
  const totalRevenue = monthlyOrders.reduce((sum, m) => sum + m.revenue, 0);

  return {
    totalProducts: productsCountSnap.data().count,
    totalInquiries: inquiriesCountSnap.data().count,
    totalOrders,
    totalRevenue,
    monthlyAnalytics,
    monthlyOrders,
    inquiryBreakdown,
    productCategories,
    topProducts
  };
}
