import { Slot, useRouter } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { useEffect, useState } from 'react';

export default function RootLayout() {
  const user = useAuth();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const testing = false //!process.env.NODE_ENV.includes('test');
  useEffect(() => {
    if (user === null) {
      router.replace('/(auth)/login');
    } else if (user) {
      setReady(true); // wait until we're sure user is valid
    }
  }, [user]);

  if (!ready && user !== null) {
    return null; // still deciding
  }

  return <Slot />;
}
