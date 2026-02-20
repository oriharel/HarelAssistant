import type { VercelRequest, VercelResponse } from '@vercel/node';
import { updateLead } from '../../../lib/crm/store.js';
import { checkAuth, isValidStage } from '../../../lib/crm/helpers.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (!checkAuth(req, res)) return;
    if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });

    const id = req.query.id as string;
    if (!id) return res.status(400).json({ error: 'Missing lead ID' });

    const { stage, lostReason } = req.body || {};
    if (!stage || !isValidStage(stage)) {
        return res.status(400).json({ error: 'Invalid or missing stage' });
    }

    const now = new Date().toISOString();
    const lead = await updateLead(id, (l) => ({
        ...l,
        stage,
        ...(stage === 'contacted' && !l.firstContactAt && { firstContactAt: now }),
        ...(stage === 'viewing_scheduled' && { viewingAt: now }),
        ...(stage === 'lost' && lostReason && { lostReason }),
    }));

    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    return res.status(200).json({ lead });
}
