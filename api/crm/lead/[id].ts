import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getLeadById, updateLead, deleteLead } from '../../lib/crm/store.js';
import { checkAuth, isValidSource } from '../../lib/crm/helpers.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (!checkAuth(req, res)) return;

    const id = req.query.id as string;
    if (!id) return res.status(400).json({ error: 'Missing lead ID' });

    if (req.method === 'GET') {
        const lead = await getLeadById(id);
        if (!lead) return res.status(404).json({ error: 'Lead not found' });
        return res.status(200).json({ lead });
    }

    if (req.method === 'PUT') {
        const { name, phone, email, source, lostReason } = req.body || {};
        if (source && !isValidSource(source)) {
            return res.status(400).json({ error: 'Invalid source' });
        }

        const lead = await updateLead(id, (l) => ({
            ...l,
            ...(name && { name }),
            ...(phone && { phone }),
            ...(email !== undefined && { email: email || undefined }),
            ...(source && { source }),
            ...(lostReason !== undefined && { lostReason }),
        }));

        if (!lead) return res.status(404).json({ error: 'Lead not found' });
        return res.status(200).json({ lead });
    }

    if (req.method === 'DELETE') {
        const deleted = await deleteLead(id);
        if (!deleted) return res.status(404).json({ error: 'Lead not found' });
        return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
