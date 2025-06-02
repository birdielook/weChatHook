// api/wecom-webhook.js
import crypto from "crypto";

// ⚠️ SECURITY WARNING: Exposing credentials in code is not recommended
const TOKEN = "YOUR_WECOM_TOKEN"; // Replace with actual token
const ENCODING_AES_KEY = "YOUR_WECOM_AES_KEY"; // Replace with actual key
const MAKE_WEBHOOK_URL = "https://hook.us2.make.com/8e6ffe66n5pj9lcyy9w23nvgniku5o9e"; // Exposed directly

// Track last request
let lastRequest = {
  timestamp: null,
  method: null,
  source: null,
  status: null
};

// Validate required values at startup
if (!TOKEN || !ENCODING_AES_KEY || !MAKE_WEBHOOK_URL) {
  throw new Error('Missing required configuration values');
}

function decryptEchostr(echostr) {
  try {
    // Simplified example decryption
    const decryptor = new crypto.Decipheriv('aes-256-cbc', ENCODING_AES_KEY, 'initialization-vector');
    let decrypted = decryptor.update(echostr, 'base64', 'utf8');
    decrypted += decryptor.final('utf8');
    return { success: true, message: decrypted };
  } catch (error) {
    console.error('Decryption failed');
    return { success: false };
  }
}

export async function GET(request) {
  lastRequest = {
    timestamp: new Date().toISOString(),
    method: "GET",
    source: request.headers.get('user-agent') || 'Unknown',
    status: 'success'
  };

  const { searchParams } = new URL(request.url);
  const echostr = searchParams.get('echostr');

  if (echostr) {
    const decrypted = decryptEchostr(echostr);
    if (decrypted.success) {
      return new Response(decrypted.message, { status: 200 });
    } else {
      return new Response('Failed to decrypt echostr', { status: 400 });
    }
  }

  return Response.json({
    status: "active",
    webhook_url: MAKE_WEBHOOK_URL,
    last_request: {
      ...lastRequest,
      is_wecom: searchParams.get('msg_signature') && searchParams.get('timestamp') && searchParams.get('nonce')
    },
    note: "⚠️ WARNING: Exposing URLs in code is insecure"
  });
}

export async function POST(request) {
  lastRequest = {
    timestamp: new Date().toISOString(),
    method: "POST",
    source: request.headers.get('user-agent') || 'Unknown',
    status: 'success'
  };

  const rawBody = await request.text();

  const response = await fetch(MAKE_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/xml" },
    body: rawBody,
  });

  if (!response.ok) {
    console.error('Forwarding failed');
    return new Response('Gateway error', { status: 502 });
  }

  return new Response('success', { status: 200 });
}
