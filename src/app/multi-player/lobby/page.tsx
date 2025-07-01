'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/games/pong/multi-player/lobby');
  }, [router]);
  
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
      <p className="text-xl">Redirecting to the new lobby page...</p>
    </div>
  );
}
