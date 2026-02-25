import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export async function getPageContent(pageKey) {
  const pageRef = doc(db, 'siteContent', pageKey);
  const snap = await getDoc(pageRef);

  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}
