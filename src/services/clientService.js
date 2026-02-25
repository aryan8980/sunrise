import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc
} from 'firebase/firestore';
import { db } from '../firebase';

const clientsRef = collection(db, 'clients');

export async function listClients() {
  const snap = await getDocs(query(clientsRef, orderBy('name', 'asc')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getClientById(clientId) {
  const clientSnap = await getDoc(doc(db, 'clients', clientId));
  if (!clientSnap.exists()) return null;
  return { id: clientSnap.id, ...clientSnap.data() };
}

export function addClient(payload) {
  return addDoc(clientsRef, {
    ...payload,
    createdAt: Date.now()
  });
}

export function updateClient(clientId, payload) {
  return updateDoc(doc(db, 'clients', clientId), payload);
}

export function deleteClient(clientId) {
  return deleteDoc(doc(db, 'clients', clientId));
}

export async function listClientOrders(clientId) {
  const ordersRef = collection(db, 'clients', clientId, 'orders');
  const snap = await getDocs(query(ordersRef, orderBy('orderDate', 'desc')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function addClientOrder(clientId, payload) {
  const ordersRef = collection(db, 'clients', clientId, 'orders');
  return addDoc(ordersRef, {
    ...payload,
    totalAmount: Number(payload.quantity || 0) * Number(payload.price || 0)
  });
}

export function updateClientOrder(clientId, orderId, payload) {
  return updateDoc(doc(db, 'clients', clientId, 'orders', orderId), payload);
}

export function deleteClientOrder(clientId, orderId) {
  return deleteDoc(doc(db, 'clients', clientId, 'orders', orderId));
}

export function getClientStats(orders = []) {
  const totalOrders = orders.length;
  const totalPurchaseValue = orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
  const lastPurchaseDate = orders.length ? orders[0].orderDate : '-';

  return {
    totalOrders,
    totalPurchaseValue,
    lastPurchaseDate
  };
}
