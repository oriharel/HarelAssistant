import fetch from 'node-fetch';

// Mock environment variables if running locally without them set in shell
// You can also run: TELEGRAM_BOT_TOKEN=... TELEGRAM_CHAT_ID=... node test-notification.js
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error("❌ Error: Please set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID environment variables.");
    console.log("Example: TELEGRAM_BOT_TOKEN=123:abc TELEGRAM_CHAT_ID=456 node test-notification.js");
    process.exit(1);
}

async function sendReminder() {
    const message = "🧪 This is a test: Time to take your vitamins! 🧪";
    console.log(`Sending message to chat ID: ${TELEGRAM_CHAT_ID}...`);

    try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('❌ Telegram API error:', data);
        } else {
            console.log('✅ Notification sent successfully!', data);
        }
    } catch (error) {
        console.error('❌ Fetch error:', error);
    }
}

sendReminder();
