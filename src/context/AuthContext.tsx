import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebase";

interface AuthContextType {
  user: User | null;
  role: "student" | "teacher" | null;
  name: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, role: null, name: null, loading: true });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<"student" | "teacher" | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        const docRef = doc(db, "users", currentUser.uid);
        
        // Listen actively for document changes (catches new registrations instantly)
        unsubscribeSnapshot = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setRole(data.role as "student" | "teacher");
            // Do NOT use currentUser.displayName. Use strict Firestore data.
            setName(data.name || null);
          } else {
            console.warn("User document not found in Firestore! Awaiting Profile Completion.");
            setRole(null);
            setName(null);
          }
          setLoading(false);
        }, (error) => {
          console.error("Error subscribing to user data:", error);
          setRole(null);
          setName(null);
          setLoading(false);
        });

      } else {
        // User logged out
        setRole(null);
        setName(null);
        setLoading(false);
        if (unsubscribeSnapshot) unsubscribeSnapshot();
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, name, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
