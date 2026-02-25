import { deleteApp, initializeApp } from 'firebase/app';
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc
} from 'firebase/firestore';
import { auth, db, firebaseConfig } from '../firebase';

export function loginWithEmailPassword(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function logoutUser() {
  return signOut(auth);
}

export async function createAdminUser({ email, password, name, role }) {
  const secondaryApp = initializeApp(firebaseConfig, `owner-create-${Date.now()}`);
  const secondaryAuth = getAuth(secondaryApp);
  const credential = await createUserWithEmailAndPassword(secondaryAuth, email, password);

  await setDoc(doc(db, 'users', credential.user.uid), {
    email,
    name,
    role,
    active: true,
    createdAt: Date.now(),
    createdAtServer: serverTimestamp()
  });

  await signOut(secondaryAuth);
  await deleteApp(secondaryApp);

  return credential.user;
}

export async function listAdminUsers() {
  const usersRef = collection(db, 'users');
  const usersSnap = await getDocs(query(usersRef));
  return usersSnap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
}

export function updateManagedUser(userId, payload) {
  return updateDoc(doc(db, 'users', userId), payload);
}

export function deleteManagedUserDoc(userId) {
  return deleteDoc(doc(db, 'users', userId));
}
