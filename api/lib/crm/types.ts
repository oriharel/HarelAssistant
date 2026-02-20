export const STAGES = [
    'new',
    'contacted',
    'viewing_scheduled',
    'viewed',
    'negotiating',
    'offer_made',
    'closed_won',
    'lost',
] as const;

export type Stage = (typeof STAGES)[number];

export const STAGE_LABELS: Record<Stage, string> = {
    new: 'חדש',
    contacted: 'יצרנו קשר',
    viewing_scheduled: 'תואם ביקור',
    viewed: 'ביקר בדירה',
    negotiating: 'במשא ומתן',
    offer_made: 'הוגשה הצעה',
    closed_won: 'נסגרה עסקה',
    lost: 'אבד',
};

export const SOURCES = ['yad2', 'facebook', 'madlan', 'referral', 'other'] as const;
export type Source = (typeof SOURCES)[number];

export const SOURCE_LABELS: Record<Source, string> = {
    yad2: 'יד2',
    facebook: 'פייסבוק',
    madlan: 'מדלן',
    referral: 'הפניה',
    other: 'אחר',
};

export interface Note {
    id: string;
    text: string;
    createdAt: string; // ISO date
}

export interface Lead {
    id: string;
    name: string;
    phone: string;
    email?: string;
    source: Source;
    stage: Stage;
    notes: Note[];
    lostReason?: string;
    createdAt: string;
    firstContactAt?: string;
    viewingAt?: string;
    updatedAt: string;
}

export interface LeadsData {
    leads: Lead[];
    updatedAt: string;
}
