'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [webhookStatus, setWebhookStatus] = useState<{ status?: string; webhook_url?: string }>({});

  useEffect(() => {
    const checkWebhookStatus = async () => {
      try {
        const response = await fetch('/api/wecom-webhook');
        const data = await response.json();
        setWebhookStatus(data);
      } catch (error) {
        console.error('Failed to fetch webhook status:', error);
      }
    };

    checkWebhookStatus();
  }, []);

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Welcome to Your Plain Project</h1>
        <p className="text-lg text-gray-600 mb-8">
          This is a simple, clean starting point for your Next.js application.
        </p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Getting Started</h2>
            <p className="text-gray-600">Start building your application by editing the files in this project.</p>
          </div>

          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Documentation</h2>
            <p className="text-gray-600">Learn more about Next.js features and best practices.</p>
          </div>

          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Deploy</h2>
            <p className="text-gray-600">Deploy your application to Vercel with a single click.</p>
          </div>

          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Webhook Status</h2>
            <div className="text-gray-600">
              <p className="mb-2">Status: <span className={webhookStatus.status === 'active' ? 'text-green-600' : 'text-red-600'}>
                {webhookStatus.status || 'Loading...'}
              </span></p>
              {webhookStatus.webhook_url && (
                <a 
                  href="/api/wecom-webhook" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View Webhook Details
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
