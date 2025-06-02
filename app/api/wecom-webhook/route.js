// api/wecom-webhook.js
import crypto from "crypto";

// Read sensitive values from environment variables for security
const TOKEN = process.env.WECOM_TOKEN || "YOUR_WECOM_TOKEN"; // Replace with actual token or set env var
const ENCODING_AES_KEY = process.env.WECOM_AES_KEY || "YOUR_WECOM_AES_KEY"; // Replace with actual key or set env var
const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL || "https://hook.us2.make.com/8e6ffe66n5pj9lcyy9w23nvgniku5o9e";

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

// Robust WeCom echostr decryption
function decryptEchostr(echostr, encodingAESKey) {
  try {
    // The key is base64-decoded, and must be 43 chars (plus '=' for padding)
    const AESKey = Buffer.from(encodingAESKey + '=', 'base64');
    const iv = AESKey.slice(0, 16);
    const decipher = crypto.createDecipheriv('aes-256-cbc', AESKey, iv);
    decipher.setAutoPadding(false);
    let decrypted = Buffer.concat([
      decipher.update(echostr, 'base64'),
      decipher.final()
    ]);
    // Remove PKCS#7 padding
    const pad = decrypted[decrypted.length - 1];
    decrypted = decrypted.slice(0, decrypted.length - pad);
    // The actual message is after 20 bytes
    const msg = decrypted.slice(20).toString();
    return { success: true, message: msg };
  } catch (error) {
    console.error('Decryption failed', error);
    return { success: false, error: error.message };
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
  const msg_signature = searchParams.get('msg_signature');
  const timestamp = searchParams.get('timestamp');
  const nonce = searchParams.get('nonce');

  // Log incoming query params for debugging
  console.log('WeCom GET params:', { msg_signature, timestamp, nonce, echostr });

  if (echostr) {
    const decrypted = decryptEchostr(echostr, ENCODING_AES_KEY);
    if (decrypted.success) {
      console.log('Decrypted echostr:', decrypted.message);
      return new Response(decrypted.message, { status: 200 });
    } else {
      console.error('Failed to decrypt echostr:', decrypted.error);
      return new Response('Failed to decrypt echostr', { status: 400 });
    }
  }

  // For browser or status checks
  return Response.json({
    status: "active",
    webhook_url: MAKE_WEBHOOK_URL,
    last_request: {
      ...lastRequest,
      is_wecom: msg_signature && timestamp && nonce
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

  // Forward to Make.com webhook
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
