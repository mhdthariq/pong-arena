"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

const SinglePlayerRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    router.push("/games/pong/single-player");
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
      <p className="text-xl">Redirecting to the new single player page...</p>
    </div>
  );
};

export default SinglePlayerRedirect;
