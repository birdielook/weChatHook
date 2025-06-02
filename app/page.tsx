'use client';

import { useEffect, useState } from 'react';

interface WebhookStatus {
  status?: string;
  webhook_url?: string;
  last_request?: {
    timestamp: string;
    method: string;
    source: string;
    status: string;
    is_wecom: boolean;
  };
}

export default function Home() {
  const [webhookStatus, setWebhookStatus] = useState<WebhookStatus>({});
  const [lastChecked, setLastChecked] = useState<string>('');

  const checkWebhookStatus = async () => {
    try {
      const response = await fetch('/api/wecom-webhook');
      const data = await response.json();
      setWebhookStatus(data);
      setLastChecked(new Date().toISOString());
    } catch (error) {
      console.error('Failed to fetch webhook status:', error);
    }
  };

  useEffect(() => {
    checkWebhookStatus();
    // Check status every 30 seconds
    const interval = setInterval(checkWebhookStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

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
            <div className="text-gray-600 space-y-2">
              <p className="mb-2">
                Status: <span className={webhookStatus.status === 'active' ? 'text-green-600' : 'text-red-600'}>
                  {webhookStatus.status || 'Loading...'}
                </span>
              </p>
              
              {webhookStatus.last_request && (
                <>
                  <p>Last Request:</p>
                  <ul className="text-sm space-y-1 pl-4">
                    <li>Time: {formatDate(webhookStatus.last_request.timestamp)}</li>
                    <li>Method: {webhookStatus.last_request.method}</li>
                    <li>Source: {webhookStatus.last_request.source}</li>
                    <li>Status: <span className={webhookStatus.last_request.status === 'success' ? 'text-green-600' : 'text-red-600'}>
                      {webhookStatus.last_request.status}
                    </span></li>
                    <li>WeCom Request: <span className={webhookStatus.last_request.is_wecom ? 'text-green-600' : 'text-gray-600'}>
                      {webhookStatus.last_request.is_wecom ? 'Yes' : 'No'}
                    </span></li>
                  </ul>
                </>
              )}
              
              <p className="text-xs text-gray-500 mt-2">
                Last checked: {formatDate(lastChecked)}
              </p>
              
              <button 
                onClick={checkWebhookStatus}
                className="mt-2 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Refresh Status
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
