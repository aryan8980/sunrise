import { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { AuthContext } from './AuthContextMain';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (!firebaseUser) {
        setRole(null);
        setActive(false);
        setLoading(false);
        return;
      }

      try {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userDocRef);
        if (!userSnap.exists()) {
          setRole(null);
          setActive(false);
        } else {
          const data = userSnap.data();
          setRole(data.role || null);
          setActive(data.active !== false);
        }
      } catch (error) {
        console.error('Failed to fetch user role:', error);
        setRole(null);
        setActive(false);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const userDocRef = doc(db, 'users', credential.user.uid);
    const userSnap = await getDoc(userDocRef);
    const nextRole = userSnap.exists() ? userSnap.data().role : null;
    const nextActive = userSnap.exists() ? userSnap.data().active !== false : false;
    setRole(nextRole);
    setActive(nextActive);
    return { user: credential.user, role: nextRole, active: nextActive };
  };

  const logout = () => signOut(auth);

  const value = useMemo(
    () => ({ user, role, active, loading, login, logout }),
    [user, role, active, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
