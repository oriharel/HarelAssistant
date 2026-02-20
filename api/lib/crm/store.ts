import { put, head } from '@vercel/blob';
import type { LeadsData, Lead } from './types.js';

const BLOB_PATH = 'crm/leads.json';

export async function readLeads(): Promise<LeadsData> {
    try {
        const metadata = await head(BLOB_PATH);
        const response = await fetch(metadata.url);
        if (!response.ok) return { leads: [], updatedAt: new Date().toISOString() };
        return (await response.json()) as LeadsData;
    } catch {
        return { leads: [], updatedAt: new Date().toISOString() };
    }
}

export async function writeLeads(data: LeadsData): Promise<void> {
    data.updatedAt = new Date().toISOString();
    await put(BLOB_PATH, JSON.stringify(data, null, 2), {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
    });
}

export async function getLeadById(id: string): Promise<Lead | undefined> {
    const data = await readLeads();
    return data.leads.find((l) => l.id === id);
}

export async function updateLead(id: string, updater: (lead: Lead) => Lead): Promise<Lead | null> {
    const data = await readLeads();
    const index = data.leads.findIndex((l) => l.id === id);
    if (index === -1) return null;
    data.leads[index] = updater(data.leads[index]);
    data.leads[index].updatedAt = new Date().toISOString();
    await writeLeads(data);
    return data.leads[index];
}

export async function deleteLead(id: string): Promise<boolean> {
    const data = await readLeads();
    const before = data.leads.length;
    data.leads = data.leads.filter((l) => l.id !== id);
    if (data.leads.length === before) return false;
    await writeLeads(data);
    return true;
}

export async function addLead(lead: Lead): Promise<void> {
    const data = await readLeads();
    data.leads.push(lead);
    await writeLeads(data);
}
