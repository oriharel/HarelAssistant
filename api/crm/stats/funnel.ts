import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readLeads } from '../../lib/crm/store.js';
import { checkAuth } from '../../lib/crm/helpers.js';
import { STAGES, STAGE_LABELS } from '../../lib/crm/types.js';
import type { Stage } from '../../lib/crm/types.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (!checkAuth(req, res)) return;
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const data = await readLeads();
    const counts: Record<Stage, number> = {} as Record<Stage, number>;
    for (const stage of STAGES) counts[stage] = 0;
    for (const lead of data.leads) counts[lead.stage]++;

    const funnel = STAGES.map((stage) => ({
        stage,
        label: STAGE_LABELS[stage],
        count: counts[stage],
    }));

    return res.status(200).json({ funnel, total: data.leads.length });
}
