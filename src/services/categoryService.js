import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const categoriesRef = collection(db, 'categories');

export async function listCategories() {
  const snap = await getDocs(query(categoriesRef, orderBy('order', 'asc')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function addCategory(payload) {
  return addDoc(categoriesRef, payload);
}

export function updateCategory(categoryId, payload) {
  return updateDoc(doc(db, 'categories', categoryId), payload);
}

export function deleteCategory(categoryId) {
  return deleteDoc(doc(db, 'categories', categoryId));
}
