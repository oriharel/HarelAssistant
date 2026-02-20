// API client and Hebrew utilities for CRM dashboard

const API_BASE = '/api/crm';

function getAuthHeaders() {
    const key = localStorage.getItem('crm_api_key');
    const headers = { 'Content-Type': 'application/json' };
    if (key) headers['Authorization'] = `Bearer ${key}`;
    return headers;
}

const api = {
    async getLeads(filters = {}) {
        const params = new URLSearchParams();
        if (filters.stage) params.set('stage', filters.stage);
        if (filters.source) params.set('source', filters.source);
        const qs = params.toString();
        const res = await fetch(`${API_BASE}/leads${qs ? '?' + qs : ''}`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error(await res.text());
        return (await res.json()).leads;
    },
    async createLead(data) {
        const res = await fetch(`${API_BASE}/leads`, {
            method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(await res.text());
        return (await res.json()).lead;
    },
    async getLead(id) {
        const res = await fetch(`${API_BASE}/lead/${id}`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error(await res.text());
        return (await res.json()).lead;
    },
    async updateLead(id, data) {
        const res = await fetch(`${API_BASE}/lead/${id}`, {
            method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(await res.text());
        return (await res.json()).lead;
    },
    async deleteLead(id) {
        const res = await fetch(`${API_BASE}/lead/${id}`, {
            method: 'DELETE', headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error(await res.text());
        return true;
    },
    async updateStage(id, stage, lostReason) {
        const body = { stage };
        if (lostReason) body.lostReason = lostReason;
        const res = await fetch(`${API_BASE}/lead/${id}/stage`, {
            method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(await res.text());
        return (await res.json()).lead;
    },
    async addNote(id, text) {
        const res = await fetch(`${API_BASE}/lead/${id}/notes`, {
            method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ text }),
        });
        if (!res.ok) throw new Error(await res.text());
        return (await res.json());
    },
    async getFunnel() {
        const res = await fetch(`${API_BASE}/stats/funnel`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error(await res.text());
        return await res.json();
    },
    async getSources() {
        const res = await fetch(`${API_BASE}/stats/sources`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error(await res.text());
        return await res.json();
    },
};

const STAGE_LABELS = {
    new: 'חדש',
    contacted: 'יצרנו קשר',
    viewing_scheduled: 'תואם ביקור',
    viewed: 'ביקר בדירה',
    negotiating: 'במשא ומתן',
    offer_made: 'הוגשה הצעה',
    closed_won: 'נסגרה עסקה',
    lost: 'אבד',
};

const STAGE_COLORS = {
    new: '#6366f1',
    contacted: '#3b82f6',
    viewing_scheduled: '#0ea5e9',
    viewed: '#14b8a6',
    negotiating: '#f59e0b',
    offer_made: '#f97316',
    closed_won: '#22c55e',
    lost: '#ef4444',
};

const STAGES_ORDER = ['new', 'contacted', 'viewing_scheduled', 'viewed', 'negotiating', 'offer_made', 'closed_won', 'lost'];

const SOURCE_LABELS = {
    yad2: 'יד2',
    facebook: 'פייסבוק',
    madlan: 'מדלן',
    referral: 'הפניה',
    other: 'אחר',
};

const SOURCE_COLORS = {
    yad2: '#ff6b00',
    facebook: '#1877f2',
    madlan: '#00b67a',
    referral: '#8b5cf6',
    other: '#6b7280',
};

function formatDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('he-IL', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDateTime(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('he-IL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function timeAgo(iso) {
    if (!iso) return '';
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'היום';
    if (days === 1) return 'אתמול';
    if (days < 7) return `לפני ${days} ימים`;
    if (days < 30) return `לפני ${Math.floor(days / 7)} שבועות`;
    return `לפני ${Math.floor(days / 30)} חודשים`;
}
