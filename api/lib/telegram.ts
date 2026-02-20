import fetch from 'node-fetch';

export async function sendTelegram(message: string): Promise<{ ok: boolean; data?: any; error?: string }> {
    const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        return { ok: false, error: 'Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID' };
    }

    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        return { ok: false, error: 'Telegram API error', data };
    }

    return { ok: true, data };
}
