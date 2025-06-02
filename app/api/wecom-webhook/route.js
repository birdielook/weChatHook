// api/wecom-webhook.js
import crypto from "crypto";

// ⚠️ SECURITY WARNING: Exposing credentials in code is not recommended
const TOKEN = "YOUR_WECOM_TOKEN"; // Replace with actual token
const ENCODING_AES_KEY = "YOUR_WECOM_AES_KEY"; // Replace with actual key
const MAKE_WEBHOOK_URL = "https://hook.make.com/your-actual-webhook-url"; // Exposed directly

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

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      // Display webhook URL in response for demonstration
      res.status(200).json({
        status: "active",
        webhook_url: MAKE_WEBHOOK_URL,
        note: "⚠️ WARNING: Exposing URLs in code is insecure"
      });

    } else if (req.method === "POST") {
      const rawBody = await getRawBody(req);
      
      // Forward to exposed webhook URL
      const response = await fetch(MAKE_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/xml" },
        body: rawBody,
      });

      if (!response.ok) {
        console.error('Forwarding failed');
        return res.status(502).send('Gateway error');
      }

      res.status(200).send('success');

    } else {
      res.status(405).send('Method Not Allowed');
    }
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
}

async function getRawBody(req) {
  const buffers = [];
  for await (const chunk of req) {
    buffers.push(chunk);
  }
  return Buffer.concat(buffers);
}
