// Main Alpine.js app state for CRM dashboard
function crmApp() {
    return {
        // Navigation
        tab: 'dashboard', // dashboard | leads | detail
        loading: true,
        error: null,

        // Data
        leads: [],
        funnel: [],
        funnelTotal: 0,
        sources: [],
        sourcesTotal: 0,

        // Filters
        filterStage: '',
        filterSource: '',
        searchQuery: '',

        // Current lead detail
        currentLead: null,
        newNote: '',

        // Form state
        showForm: false,
        editingLead: null,
        form: { name: '', phone: '', email: '', source: 'other' },

        // Confirm dialog
        confirmAction: null,
        confirmMessage: '',

        async init() {
            await this.refresh();
        },

        async refresh() {
            this.loading = true;
            this.error = null;
            try {
                const [leads, funnelData, sourcesData] = await Promise.all([
                    api.getLeads(),
                    api.getFunnel(),
                    api.getSources(),
                ]);
                this.leads = leads;
                this.funnel = funnelData.funnel;
                this.funnelTotal = funnelData.total;
                this.sources = sourcesData.sources;
                this.sourcesTotal = sourcesData.total;
            } catch (e) {
                this.error = e.message;
            }
            this.loading = false;
        },

        // Filtered leads
        get filteredLeads() {
            let result = this.leads;
            if (this.filterStage) result = result.filter(l => l.stage === this.filterStage);
            if (this.filterSource) result = result.filter(l => l.source === this.filterSource);
            if (this.searchQuery) {
                const q = this.searchQuery.toLowerCase();
                result = result.filter(l =>
                    l.name.toLowerCase().includes(q) ||
                    l.phone.includes(q) ||
                    (l.email && l.email.toLowerCase().includes(q))
                );
            }
            return result.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        },

        // Recent activity (last 5 updated)
        get recentActivity() {
            return [...this.leads]
                .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                .slice(0, 5);
        },

        // Active leads count (not won/lost)
        get activeCount() {
            return this.leads.filter(l => l.stage !== 'closed_won' && l.stage !== 'lost').length;
        },

        // Navigation
        showDashboard() { this.tab = 'dashboard'; },
        showLeads() { this.tab = 'leads'; },
        async showDetail(id) {
            this.loading = true;
            try {
                this.currentLead = await api.getLead(id);
                this.tab = 'detail';
            } catch (e) {
                this.error = e.message;
            }
            this.loading = false;
        },

        // Form
        openNewForm() {
            this.editingLead = null;
            this.form = { name: '', phone: '', email: '', source: 'other' };
            this.showForm = true;
        },
        openEditForm(lead) {
            this.editingLead = lead;
            this.form = { name: lead.name, phone: lead.phone, email: lead.email || '', source: lead.source };
            this.showForm = true;
        },
        closeForm() { this.showForm = false; },

        async submitForm() {
            try {
                if (this.editingLead) {
                    await api.updateLead(this.editingLead.id, this.form);
                } else {
                    await api.createLead(this.form);
                }
                this.showForm = false;
                await this.refresh();
            } catch (e) {
                this.error = e.message;
            }
        },

        // Stage transition
        async changeStage(leadId, newStage) {
            if (newStage === 'lost') {
                const reason = prompt('סיבת אובדן:');
                if (reason === null) return;
                await api.updateStage(leadId, newStage, reason);
            } else {
                await api.updateStage(leadId, newStage);
            }
            await this.refresh();
            if (this.currentLead && this.currentLead.id === leadId) {
                this.currentLead = await api.getLead(leadId);
            }
        },

        // Notes
        async addNote() {
            if (!this.newNote.trim() || !this.currentLead) return;
            try {
                await api.addNote(this.currentLead.id, this.newNote.trim());
                this.currentLead = await api.getLead(this.currentLead.id);
                this.newNote = '';
            } catch (e) {
                this.error = e.message;
            }
        },

        // Delete
        async confirmDelete(lead) {
            if (!confirm(`למחוק את ${lead.name}?`)) return;
            await api.deleteLead(lead.id);
            this.tab = 'leads';
            await this.refresh();
        },

        // Helpers exposed to template
        stageLabel(s) { return STAGE_LABELS[s] || s; },
        stageColor(s) { return STAGE_COLORS[s] || '#6b7280'; },
        sourceLabel(s) { return SOURCE_LABELS[s] || s; },
        sourceColor(s) { return SOURCE_COLORS[s] || '#6b7280'; },
        formatDate(d) { return formatDate(d); },
        formatDateTime(d) { return formatDateTime(d); },
        timeAgo(d) { return timeAgo(d); },
        stagesOrder() { return STAGES_ORDER; },
    };
}
