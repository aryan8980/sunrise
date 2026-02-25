import { collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, where, addDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';

const productsRef = collection(db, 'products');

export async function listProducts(filters = {}) {
  let q = query(productsRef, orderBy('createdAt', 'desc'));

  if (filters.category) q = query(productsRef, where('category', '==', filters.category));
  if (filters.size) q = query(productsRef, where('sizes', 'array-contains', filters.size));

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...d.data(), id: d.id }));
}

export async function getProductById(productId) {
  const productDoc = await getDoc(doc(db, 'products', productId));
  if (!productDoc.exists()) return null;
  return { ...productDoc.data(), id: productDoc.id };
}

export function addProduct(payload) {
  return addDoc(productsRef, {
    ...payload,
    createdAt: Date.now(),
    viewsCount: payload.viewsCount || 0
  });
}

export function updateProduct(productId, payload) {
  return updateDoc(doc(db, 'products', productId), payload);
}

export function deleteProduct(productId) {
  return deleteDoc(doc(db, 'products', productId));
}

export function incrementProductViews(productId) {
  return updateDoc(doc(db, 'products', productId), { viewsCount: increment(1) });
}
