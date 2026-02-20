import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readLeads, addLead } from '../lib/crm/store.js';
import { checkAuth, generateId, isValidSource, isValidStage } from '../lib/crm/helpers.js';
import type { Lead } from '../lib/crm/types.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (!checkAuth(req, res)) return;

    if (req.method === 'GET') {
        const data = await readLeads();
        let leads = data.leads;

        const { stage, source } = req.query;
        if (typeof stage === 'string' && isValidStage(stage)) {
            leads = leads.filter((l) => l.stage === stage);
        }
        if (typeof source === 'string' && isValidSource(source)) {
            leads = leads.filter((l) => l.source === source);
        }

        return res.status(200).json({ leads });
    }

    if (req.method === 'POST') {
        const { name, phone, email, source } = req.body || {};
        if (!name || !phone) {
            return res.status(400).json({ error: 'name and phone are required' });
        }
        if (source && !isValidSource(source)) {
            return res.status(400).json({ error: 'Invalid source' });
        }

        const now = new Date().toISOString();
        const lead: Lead = {
            id: generateId(),
            name,
            phone,
            email: email || undefined,
            source: source || 'other',
            stage: 'new',
            notes: [],
            createdAt: now,
            updatedAt: now,
        };

        await addLead(lead);
        return res.status(201).json({ lead });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
