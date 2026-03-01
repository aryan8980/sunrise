import { collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, where, addDoc, updateDoc, increment } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';

const productsRef = collection(db, 'products');

export async function uploadProductImage(file) {
  try {
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const storageRef = ref(storage, `products/${fileName}`);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

export async function uploadMultipleProductImages(files) {
  try {
    const urls = [];
    for (const file of files) {
      const url = await uploadProductImage(file);
      urls.push(url);
    }
    return urls;
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw error;
  }
}

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
