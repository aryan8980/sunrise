import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const inquiriesRef = collection(db, 'inquiries');

export function createInquiry(payload) {
  return addDoc(inquiriesRef, {
    ...payload,
    status: 'pending',
    createdAt: Date.now()
  });
}

export async function listInquiries() {
  const snap = await getDocs(query(inquiriesRef, orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => {
    const data = d.data();
    const legacyStatus = data.resolved === true ? 'done' : 'pending';
    return { id: d.id, ...data, status: data.status || legacyStatus };
  });
}

export function updateInquiry(inquiryId, payload) {
  return updateDoc(doc(db, 'inquiries', inquiryId), payload);
}

export function deleteInquiry(inquiryId) {
  return deleteDoc(doc(db, 'inquiries', inquiryId));
}
