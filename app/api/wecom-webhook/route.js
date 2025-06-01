import WechatCrypto from 'wechat-crypto';

const TOKEN = process.env.WECOM_TOKEN;
const ENCODING_AES_KEY = process.env.WECOM_AES_KEY;
const CORP_ID = process.env.WECOM_CORP_ID;

const crypto = new WechatCrypto(TOKEN, ENCODING_AES_KEY, CORP_ID);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { msg_signature, timestamp, nonce, echostr } = req.query;

    try {
      // Pass echostr as-is, do not decode or modify
      const decrypted = crypto.decrypt(echostr);
      res.status(200).send(decrypted.message);
    } catch (err) {
      console.error('Decryption error:', err);
      res.status(400).send('Failed to decrypt echostr');
    }
  } else if (req.method === 'POST') {
    // Your POST forwarding logic here
    res.status(200).send('success');
  } else {
    res.status(405).send('Method Not Allowed');
  }
}
