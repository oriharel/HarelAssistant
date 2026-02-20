import type { VercelRequest, VercelResponse } from '@vercel/node';
import { STAGES, SOURCES } from './types.js';
import type { Stage, Source } from './types.js';

export function generateId(): string {
    const ts = Date.now().toString(36);
    const rand = Math.random().toString(36).slice(2, 8);
    return `${ts}-${rand}`;
}

export function checkAuth(req: VercelRequest, res: VercelResponse): boolean {
    const apiKey = process.env.CRM_API_KEY;
    if (!apiKey) return true; // open in dev mode

    const auth = req.headers.authorization;
    if (auth !== `Bearer ${apiKey}`) {
        res.status(401).json({ error: 'Unauthorized' });
        return false;
    }
    return true;
}

export function isValidStage(stage: string): stage is Stage {
    return STAGES.includes(stage as Stage);
}

export function isValidSource(source: string): source is Source {
    return SOURCES.includes(source as Source);
}
