import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';

const storesRef = collection(db, 'stores');

export async function listStores() {
  const snap = await getDocs(query(storesRef, orderBy('order', 'asc')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
