import type { VercelRequest, VercelResponse } from '@vercel/node';
import { updateLead } from '../../../lib/crm/store.js';
import { checkAuth, generateId } from '../../../lib/crm/helpers.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (!checkAuth(req, res)) return;
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const id = req.query.id as string;
    if (!id) return res.status(400).json({ error: 'Missing lead ID' });

    const { text } = req.body || {};
    if (!text) return res.status(400).json({ error: 'text is required' });

    const note = { id: generateId(), text, createdAt: new Date().toISOString() };
    const lead = await updateLead(id, (l) => ({
        ...l,
        notes: [...l.notes, note],
    }));

    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    return res.status(200).json({ lead, note });
}
