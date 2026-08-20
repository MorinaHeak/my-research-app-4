export default async function handler(req, res) {
  // Handle CORS headers and preflight requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { email, userId, txId } = req.body;

    if (!txId || !userId) {
      return res.status(400).json({ error: 'User details and Transaction ID are required' });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      return res.status(500).json({ error: 'Server configuration error: Telegram keys missing' });
    }

    const message = `🔔 *ស្នើសុំទិញក្រេឌីតថ្មី (New Payment Request)*\n\n👤 *User*: ${email || 'N/A'}\n🆔 *User ID*: \`${userId}\`\n🧾 *Transaction ID*: \`${txId}\`\n💵 *ចំនួន*: $1.00 (10 Credits)`;

    // Send Telegram alert with action buttons
    const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              { text: "✅ Approve (+10 Credits)", callback_data: `approve_${userId}_10` },
              { text: "❌ Reject", callback_data: `reject_${userId}` }
            ]
          ]
        }
      })
    });

    const data = await telegramResponse.json();

    if (!data.ok) {
      return res.status(400).json({ error: data.description });
    }

    return res.status(200).json({ success: true, message: 'Notification sent successfully' });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}