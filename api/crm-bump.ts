import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readLeads } from './lib/crm/store.js';
import { sendTelegram } from './lib/telegram.js';
import { STAGE_LABELS } from './lib/crm/types.js';
import type { Lead, Stage } from './lib/crm/types.js';

// Stages where staleness matters (active pipeline stages)
const ACTIVE_STAGES: Stage[] = ['new', 'contacted', 'viewing_scheduled', 'viewed', 'negotiating', 'offer_made'];

// Days before a lead is considered stale per stage
const STALE_DAYS: Partial<Record<Stage, number>> = {
    new: 1,
    contacted: 3,
    viewing_scheduled: 2,
    viewed: 3,
    negotiating: 5,
    offer_made: 3,
};

function daysSince(iso: string): number {
    return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const data = await readLeads();
        const staleLeads: { lead: Lead; days: number }[] = [];

        for (const lead of data.leads) {
            if (!ACTIVE_STAGES.includes(lead.stage)) continue;
            const threshold = STALE_DAYS[lead.stage] || 3;
            const days = daysSince(lead.updatedAt);
            if (days >= threshold) {
                staleLeads.push({ lead, days });
            }
        }

        if (staleLeads.length === 0) {
            return res.status(200).json({ message: 'No stale leads', sent: false });
        }

        // Build Telegram message
        const lines = ['🏠 תזכורת CRM - לידים שדורשים טיפול:\n'];
        for (const { lead, days } of staleLeads) {
            const stage = STAGE_LABELS[lead.stage];
            lines.push(`• ${lead.name} (${lead.phone}) - ${stage} - ${days} ימים ללא עדכון`);
        }
        lines.push(`\nסה״כ ${staleLeads.length} לידים דורשים תשומת לב`);

        const result = await sendTelegram(lines.join('\n'));

        if (!result.ok) {
            return res.status(500).json({ error: result.error, details: result.data });
        }

        return res.status(200).json({ success: true, staleCount: staleLeads.length });
    } catch (error) {
        const err = error as Error;
        console.error('CRM bump error:', err);
        return res.status(500).json({ error: err.message });
    }
}
