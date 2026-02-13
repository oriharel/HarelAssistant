import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        return res.status(500).json({ error: 'Missing environment variables' });
    }

    // Get message from query parameter, request body, or use default
    const message = 
        (typeof req.query.message === 'string' ? req.query.message : null) ||
        (typeof req.body === 'object' && req.body?.message ? req.body.message : null) ||
        "👋 Good morning! Time for your morning routine! 👋";

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
            console.error('Telegram API error:', data);
            return res.status(500).json({ error: 'Failed to send notification', details: data });
        }

        return res.status(200).json({ success: true, data });
    } catch (error) {
        const err = error as Error;
        console.error('Fetch error:', err);
        return res.status(500).json({ error: 'Internal server error', details: err.message });
    }
}
