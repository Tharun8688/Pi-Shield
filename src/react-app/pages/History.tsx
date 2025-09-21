import { useEffect, useState } from "react";
import { onAuthStateChanged, getAuth, User } from "firebase/auth";
import { app } from "@/react-app/firebase"; // create a firebase.ts config file

const auth = getAuth(app);

export default function History() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  if (!user) {
    return <p>Please log in to view history.</p>;
  }

  return (
    <div>
      <h1>History Page</h1>
      <p>Welcome, {user.email}</p>
    </div>
  );
}