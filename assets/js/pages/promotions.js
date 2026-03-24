// assets/js/pages/promotions.js
const PromotionsPage = {
    data: {
        promotions: []
    },
    
    filters: {
        search: '',
        status: 'all',
        type: 'all'
    },
    
    init: function() {
        this.loadData();
        this.setupEventListeners();
        this.updateUserName();
    },
    
    loadData: async function() {
        try {
            const result = await api.getPromotionalOffers();
            console.log('📦 Promotions reçues:', result);
            
            if (result.success) {
                this.data.promotions = result.data || [];
                this.renderGrid();
                this.updateStats();
            } else {
                console.error('❌ Erreur API promotions:', result.error);
                App.showError('Impossible de charger les promotions');
                this.loadMockData();
            }
        } catch (error) {
            console.error('❌ Erreur chargement promotions:', error);
            App.showError('Impossible de charger les promotions');
            this.loadMockData();
        }
    },
    
    loadMockData: function() {
        console.log('📦 Chargement données mock promotions');
        this.data.promotions = [
            {
                id: 1,
                title: 'Première réservation',
                code: 'FIRST20',
                description: '20% de réduction sur votre première réservation',
                discountType: 'percentage',
                discountValue: 20,
                minAmount: 0,
                maxDiscount: null,
                startDate: '2024-01-01T00:00:00',
                endDate: '2024-12-31T23:59:59',
                maxUses: 1000,
                maxPerUser: 1,
                currentUses: 245,
                isActive: true
            },
            {
                id: 2,
                title: 'Fidélité',
                code: 'LOYAL10',
                description: '10% de réduction pour les clients fidèles',
                discountType: 'percentage',
                discountValue: 10,
                minAmount: 5000,
                maxDiscount: 5000,
                startDate: '2024-01-01T00:00:00',
                endDate: '2024-06-30T23:59:59',
                maxUses: 500,
                maxPerUser: 3,
                currentUses: 89,
                isActive: true
            },
            {
                id: 3,
                title: 'Stationnement longue durée',
                code: 'LONGTERM',
                description: '5000 FCFA de réduction sur les réservations de +24h',
                discountType: 'fixed',
                discountValue: 5000,
                minAmount: 15000,
                maxDiscount: null,
                startDate: '2024-02-01T00:00:00',
                endDate: '2024-05-31T23:59:59',
                maxUses: 200,
                maxPerUser: 2,
                currentUses: 34,
                isActive: true
            }
        ];
        this.renderGrid();
        this.updateStats();
    },
    
    renderGrid: function() {
        const grid = document.getElementById('promoGrid');
        if (!grid) return;
        
        const filteredPromos = this.getFilteredPromotions();
        
        if (filteredPromos.length === 0) {
            grid.innerHTML = '<div class="text-center"><i class="fas fa-tags" style="font-size: 48px; opacity: 0.3; margin-bottom: 20px;"></i><br>Aucune promotion trouvée</div>';
            return;
        }
        
        grid.innerHTML = filteredPromos.map(promo => {
            const status = this.getPromoStatus(promo);
            const statusClass = this.getStatusClass(status);
            const cardClass = this.getCardClass(status);
            const discountText = this.formatDiscount(promo);
            
            return `
                <div class="promo-card ${cardClass}" data-id="${promo.id}">
                    <div class="promo-status">
                        <span class="status-badge ${statusClass}">
                            <i class="fas ${this.getStatusIcon(status)}"></i> ${status}
                        </span>
                    </div>
                    
                    <div class="promo-code">${promo.code}</div>
                    <div class="promo-title">${promo.title}</div>
                    <div class="promo-description">${promo.description}</div>
                    
                    <div class="promo-discount">
                        <i class="fas ${promo.discountType === 'percentage' ? 'fa-percent' : 'fa-money-bill'}"></i>
                        ${discountText}
                        ${promo.minAmount > 0 ? ` • Min: ${App.formatCFA(promo.minAmount)}` : ''}
                    </div>
                    
                    <div class="promo-dates">
                        <i class="fas fa-calendar-alt"></i>
                        Du ${this.formatDate(promo.startDate)} au ${this.formatDate(promo.endDate)}
                    </div>
                    
                    <div class="promo-stats">
                        <div class="stat-item">
                            <div class="stat-label-sm">Utilisations</div>
                            <div class="stat-value-sm">${promo.currentUses || 0}/${promo.maxUses}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label-sm">Par utilisateur</div>
                            <div class="stat-value-sm">${promo.maxPerUser}</div>
                        </div>
                        ${promo.maxDiscount ? `
                            <div class="stat-item">
                                <div class="stat-label-sm">Max réduction</div>
                                <div class="stat-value-sm">${App.formatCFA(promo.maxDiscount)}</div>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="promo-actions">
                        <button class="btn-action" onclick="PromotionsPage.viewPromo(${promo.id})" title="Voir détails">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-action" onclick="PromotionsPage.editPromo(${promo.id})" title="Modifier">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action" onclick="PromotionsPage.toggleStatus(${promo.id})" title="${promo.isActive ? 'Désactiver' : 'Activer'}">
                            <i class="fas ${promo.isActive ? 'fa-toggle-on' : 'fa-toggle-off'}"></i>
                        </button>
                        <button class="btn-action delete" onclick="PromotionsPage.deletePromo(${promo.id})" title="Supprimer">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },
    
    getPromoStatus: function(promo) {
        if (!promo.isActive) return 'Inactif';
        
        const now = new Date();
        const start = new Date(promo.startDate);
        const end = new Date(promo.endDate);
        
        if (now < start) return 'À venir';
        if (now > end) return 'Expiré';
        return 'Actif';
    },
    
    getStatusClass: function(status) {
        const classes = {
            'Actif': 'status-active',
            'Inactif': 'status-inactive',
            'Expiré': 'status-expired',
            'À venir': 'status-upcoming'
        };
        return classes[status] || 'status-inactive';
    },
    
    getCardClass: function(status) {
        const classes = {
            'Actif': 'active',
            'Inactif': 'inactive',
            'Expiré': 'expired',
            'À venir': 'upcoming'
        };
        return classes[status] || '';
    },
    
    getStatusIcon: function(status) {
        const icons = {
            'Actif': 'fa-check-circle',
            'Inactif': 'fa-ban',
            'Expiré': 'fa-hourglass-end',
            'À venir': 'fa-clock'
        };
        return icons[status] || 'fa-circle';
    },
    
    formatDiscount: function(promo) {
        if (promo.discountType === 'percentage') {
            return `${promo.discountValue}% de réduction`;
        } else {
            return `${App.formatCFA(promo.discountValue)} de réduction`;
        }
    },
    
    formatDate: function(dateStr) {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    },
    
    getFilteredPromotions: function() {
        return this.data.promotions.filter(promo => {
            let match = true;
            
            if (this.filters.search) {
                const searchLower = this.filters.search.toLowerCase();
                match = match && (
                    promo.title.toLowerCase().includes(searchLower) ||
                    promo.code.toLowerCase().includes(searchLower) ||
                    promo.description.toLowerCase().includes(searchLower)
                );
            }
            
            if (this.filters.status !== 'all') {
                const status = this.getPromoStatus(promo).toLowerCase();
                match = match && status === this.filters.status;
            }
            
            if (this.filters.type !== 'all') {
                match = match && promo.discountType === this.filters.type;
            }
            
            return match;
        });
    },
    
    updateStats: function() {
        const active = this.data.promotions.filter(p => this.getPromoStatus(p) === 'Actif').length;
        const totalUses = this.data.promotions.reduce((sum, p) => sum + (p.currentUses || 0), 0);
        const totalPossible = this.data.promotions.reduce((sum, p) => sum + p.maxUses, 0);
        const usageRate = totalPossible > 0 ? Math.round((totalUses / totalPossible) * 100) : 0;
        
        const now = new Date();
        const weekFromNow = new Date();
        weekFromNow.setDate(now.getDate() + 7);
        
        const expiringSoon = this.data.promotions.filter(p => {
            if (!p.isActive) return false;
            const endDate = new Date(p.endDate);
            return endDate > now && endDate <= weekFromNow;
        }).length;
        
        document.getElementById('activePromos').textContent = active;
        document.getElementById('totalUses').textContent = totalUses;
        document.getElementById('usageRate').textContent = usageRate + '%';
        document.getElementById('expiringSoon').textContent = expiringSoon;
    },
    
    setupEventListeners: function() {
        document.getElementById('searchInput')?.addEventListener('input', (e) => {
            this.filters.search = e.target.value;
            this.renderGrid();
        });
        
        document.getElementById('statusFilter')?.addEventListener('change', (e) => {
            this.filters.status = e.target.value;
            this.renderGrid();
        });
        
        document.getElementById('typeFilter')?.addEventListener('change', (e) => {
            this.filters.type = e.target.value;
            this.renderGrid();
        });
        
        document.getElementById('promoForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.savePromo();
        });
    },
    
    openModal: function(promo = null) {
        const modal = document.getElementById('promoModal');
        
        if (promo) {
            document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit"></i> Modifier promotion';
            document.getElementById('promoId').value = promo.id;
            document.getElementById('title').value = promo.title;
            document.getElementById('code').value = promo.code;
            document.getElementById('description').value = promo.description;
            document.getElementById('discountType').value = promo.discountType;
            document.getElementById('discountValue').value = promo.discountValue;
            document.getElementById('minAmount').value = promo.minAmount || 0;
            document.getElementById('maxDiscount').value = promo.maxDiscount || '';
            document.getElementById('startDate').value = promo.startDate.slice(0, 16);
            document.getElementById('endDate').value = promo.endDate.slice(0, 16);
            document.getElementById('maxUses').value = promo.maxUses;
            document.getElementById('maxPerUser').value = promo.maxPerUser;
            document.getElementById('isActive').checked = promo.isActive;
        } else {
            document.getElementById('promoForm').reset();
            document.getElementById('modalTitle').innerHTML = '<i class="fas fa-plus-circle"></i> Nouvelle promotion';
            document.getElementById('promoId').value = '';
            
            const now = new Date();
            const nextMonth = new Date();
            nextMonth.setMonth(now.getMonth() + 1);
            
            document.getElementById('startDate').value = now.toISOString().slice(0, 16);
            document.getElementById('endDate').value = nextMonth.toISOString().slice(0, 16);
            document.getElementById('maxUses').value = '100';
            document.getElementById('maxPerUser').value = '1';
            document.getElementById('isActive').checked = true;
        }
        
        modal.classList.add('active');
    },
    
    closeModal: function() {
        document.getElementById('promoModal').classList.remove('active');
    },
    
    viewPromo: function(id) {
        const promo = this.data.promotions.find(p => p.id === id);
        if (!promo) return;
        
        const modal = document.getElementById('detailsModal');
        const details = document.getElementById('promoDetails');
        const status = this.getPromoStatus(promo);
        
        details.innerHTML = `
            <div class="promo-details">
                <div class="detail-row">
                    <div class="detail-label">Code promo</div>
                    <div class="detail-value"><strong>${promo.code}</strong></div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Titre</div>
                    <div class="detail-value">${promo.title}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Description</div>
                    <div class="detail-value">${promo.description}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Réduction</div>
                    <div class="detail-value">${this.formatDiscount(promo)}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Montant minimum</div>
                    <div class="detail-value">${promo.minAmount > 0 ? App.formatCFA(promo.minAmount) : 'Aucun'}</div>
                </div>
                ${promo.maxDiscount ? `
                <div class="detail-row">
                    <div class="detail-label">Réduction maximale</div>
                    <div class="detail-value">${App.formatCFA(promo.maxDiscount)}</div>
                </div>
                ` : ''}
                <div class="detail-row">
                    <div class="detail-label">Période</div>
                    <div class="detail-value">Du ${this.formatDate(promo.startDate)} au ${this.formatDate(promo.endDate)}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Utilisations</div>
                    <div class="detail-value">${promo.currentUses || 0} / ${promo.maxUses}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Par utilisateur</div>
                    <div class="detail-value">${promo.maxPerUser} fois</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Statut</div>
                    <div class="detail-value">
                        <span class="status-badge ${this.getStatusClass(status)}">
                            <i class="fas ${this.getStatusIcon(status)}"></i> ${status}
                        </span>
                    </div>
                </div>
            </div>
            <div class="form-actions">
                <button class="btn-secondary" onclick="PromotionsPage.closeDetailsModal()">
                    <i class="fas fa-times"></i> Fermer
                </button>
                <button class="btn-primary" onclick="PromotionsPage.editPromo(${promo.id})">
                    <i class="fas fa-edit"></i> Modifier
                </button>
            </div>
        `;
        
        modal.classList.add('active');
    },
    
    closeDetailsModal: function() {
        document.getElementById('detailsModal').classList.remove('active');
    },
    
    editPromo: function(id) {
        const promo = this.data.promotions.find(p => p.id === id);
        if (promo) {
            this.closeDetailsModal();
            this.openModal(promo);
        }
    },
    
    toggleStatus: async function(id) {
        const promo = this.data.promotions.find(p => p.id === id);
        if (!promo) return;
        
        try {
            const updatedPromo = { ...promo, isActive: !promo.isActive };
            const result = await api.updatePromotionalOffer(id, updatedPromo);
            
            if (result.success) {
                promo.isActive = !promo.isActive;
                App.showSuccess(`Promotion ${promo.isActive ? 'activée' : 'désactivée'}`);
                this.renderGrid();
                this.updateStats();
            } else {
                App.showError(result.error || 'Erreur lors du changement de statut');
            }
        } catch (error) {
            App.showError('Erreur lors du changement de statut');
        }
    },
    
    deletePromo: async function(id) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette promotion ?')) return;
        
        try {
            const result = await api.deletePromotionalOffer(id);
            
            if (result.success) {
                this.data.promotions = this.data.promotions.filter(p => p.id !== id);
                App.showSuccess('Promotion supprimée avec succès');
                this.renderGrid();
                this.updateStats();
            } else {
                App.showError(result.error || 'Erreur lors de la suppression');
            }
        } catch (error) {
            App.showError('Erreur lors de la suppression');
        }
    },
    
    // assets/js/pages/promotions.js - Version corrigée

savePromo: async function() {
    const id = document.getElementById('promoId').value;
    
    // Format exact attendu par ton API
    const promoData = {
        Title: document.getElementById('title').value,
        Code: document.getElementById('code').value,
        Description: document.getElementById('description').value,
        DiscountType: document.getElementById('discountType').value === 'percentage' ? 0 : 1,
        DiscountValue: parseFloat(document.getElementById('discountValue').value),
        MinReservationAmount: parseFloat(document.getElementById('minAmount').value) || 0,
        StartDate: document.getElementById('startDate').value,
        EndDate: document.getElementById('endDate').value,
        IsActive: document.getElementById('isActive').checked
    };
    
    console.log('📦 Données formatées pour l\'API:', promoData);
    
    try {
        let result;
        
        if (id) {
            // Pour la modification, ajoute l'Id
            const updateData = {
                Id: parseInt(id),
                ...promoData
            };
            result = await api.updatePromotionalOffer(parseInt(id), updateData);
        } else {
            result = await api.createPromotionalOffer(promoData);
        }
        
        if (result.success) {
            App.showSuccess(id ? 'Promotion modifiée avec succès' : 'Promotion créée avec succès');
            this.closeModal();
            await this.loadData();
        } else {
            App.showError(result.error || 'Erreur lors de l\'enregistrement');
        }
    } catch (error) {
        console.error('❌ Erreur:', error);
        App.showError(error.message || 'Erreur lors de l\'enregistrement');
    }
},
    updateUserName: function() {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                const userNameEl = document.getElementById('userName');
                const userRoleEl = document.getElementById('userRole');
                if (userNameEl) userNameEl.textContent = user.fullName || 'Rebecca KANGBE';
                if (userRoleEl) userRoleEl.innerHTML = '<i class="fas fa-user-circle"></i> ' + (user.role || 'Administrateur');
            } catch (e) {
                console.error('Erreur parsing user:', e);
            }
        }
    }
};

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    if (typeof App !== 'undefined' && App.checkAuth) {
        App.checkAuth();
    }
    PromotionsPage.init();
});

window.PromotionsPage = PromotionsPage;