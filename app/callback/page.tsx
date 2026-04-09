'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function CallbackContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-red-600 mb-2">Authorization Failed</h1>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (code) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-xl text-center">
          <h1 className="text-xl font-semibold text-green-600 mb-4">Authorization Successful</h1>
          <p className="text-sm text-gray-500 mb-4">Copy this code:</p>
          <code className="block bg-gray-100 p-4 rounded text-xs break-all text-gray-800">
            {code}
          </code>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <p className="text-gray-500">Waiting for authorization...</p>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>}>
      <CallbackContent />
    </Suspense>
  );
}
