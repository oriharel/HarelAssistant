import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readLeads } from '../../lib/crm/store.js';
import { checkAuth } from '../../lib/crm/helpers.js';
import { SOURCES, SOURCE_LABELS } from '../../lib/crm/types.js';
import type { Source } from '../../lib/crm/types.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (!checkAuth(req, res)) return;
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const data = await readLeads();
    const counts: Record<Source, number> = {} as Record<Source, number>;
    for (const source of SOURCES) counts[source] = 0;
    for (const lead of data.leads) counts[lead.source]++;

    const sources = SOURCES.map((source) => ({
        source,
        label: SOURCE_LABELS[source],
        count: counts[source],
    }));

    return res.status(200).json({ sources, total: data.leads.length });
}
