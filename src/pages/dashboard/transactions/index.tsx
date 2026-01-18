import { useEffect } from 'react';
import { useRouter } from 'next/router';

// ----------------------------------------------------------------------

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    if (router.pathname === '/dashboard/transactions') {
      router.push('/dashboard/transactions/history');
    }
  });

  return null;
}
