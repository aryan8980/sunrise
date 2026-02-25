import { collection, getCountFromServer, getDocs, limit, orderBy, query } from 'firebase/firestore';
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

export async function getDashboardStats() {
  const productsCountSnap = await getCountFromServer(collection(db, 'products'));
  const inquiriesCountSnap = await getCountFromServer(collection(db, 'inquiries'));

  const mostViewedSnap = await getDocs(
    query(collection(db, 'products'), orderBy('viewsCount', 'desc'), limit(5))
  );

  const mostViewedProducts = mostViewedSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const monthlyAnalytics = await getMonthlyAnalytics();

  return {
    totalProducts: productsCountSnap.data().count,
    totalInquiries: inquiriesCountSnap.data().count,
    mostViewedProducts,
    monthlyAnalytics
  };
}
