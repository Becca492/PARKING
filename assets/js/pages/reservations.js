// assets/js/pages/reservations.js
const ReservationsPage = {
    data: {
        reservations: [],
        users: [],
        parkingSpaces: [],
        vehicles: [],
        reservationTypes: [],
        promotionalOffers: []
    },
    
    filters: {
        period: 'month',
        status: 'all',
        client: ''
    },
    
    init: function() {
        this.loadData();
        this.setupEventListeners();
        this.updateUserName();
    },
    
    loadData: async function() {
        try {
            // Charger toutes les données nécessaires
            await this.loadUsers();
            await this.loadParkingSpaces();
            await this.loadVehicles();
            await this.loadReservationTypes();
            await this.loadPromotionalOffers();
            await this.loadReservations();
            
            this.renderTable();
            this.updateStats();
            this.populateSelects();
        } catch (error) {
            console.error('❌ Erreur chargement données:', error);
            App.showError('Impossible de charger les données');
            this.loadMockData(); // Fallback
        }
    },
    
    loadReservations: async function() {
        try {
            const result = await api.getReservations();
            console.log('📦 Réservations reçues:', result);
            if (result.success) {
                this.data.reservations = result.data || [];
                // Enrichir avec les noms et numéros de place
                this.enrichReservationsData();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('❌ Erreur chargement réservations:', error);
            throw error;
        }
    },
    
    loadUsers: async function() {
        try {
            const result = await api.getUsers();
            if (result.success) {
                this.data.users = result.data || [];
            }
        } catch (error) {
            console.error('❌ Erreur chargement utilisateurs:', error);
        }
    },
    
    loadParkingSpaces: async function() {
        try {
            const result = await api.getParkingSpaces();
            if (result.success) {
                this.data.parkingSpaces = result.data || [];
            }
        } catch (error) {
            console.error('❌ Erreur chargement places:', error);
        }
    },
    
    loadVehicles: async function() {
        try {
            const result = await api.getVehicles();
            if (result.success) {
                this.data.vehicles = result.data || [];
            }
        } catch (error) {
            console.error('❌ Erreur chargement véhicules:', error);
        }
    },
    
    loadReservationTypes: async function() {
        try {
            const result = await api.getReservationTypes();
            if (result.success) {
                this.data.reservationTypes = result.data || [];
            }
        } catch (error) {
            console.error('❌ Erreur chargement types réservation:', error);
        }
    },
    
    loadPromotionalOffers: async function() {
        try {
            const result = await api.getPromotionalOffers();
            if (result.success) {
                this.data.promotionalOffers = result.data || [];
            }
        } catch (error) {
            console.error('❌ Erreur chargement promotions:', error);
        }
    },
    
    enrichReservationsData: function() {
        // Ajouter les noms et numéros aux réservations pour l'affichage
        this.data.reservations.forEach(res => {
            const user = this.data.users.find(u => u.id === res.userId);
            const space = this.data.parkingSpaces.find(s => s.id === res.parkingSpaceId);
            res.clientName = user ? user.fullName : 'N/A';
            res.spaceNumber = space ? space.spaceNumber : 'N/A';
            res.clientPhone = user ? user.phoneNumber : 'N/A';
        });
    },
    
    loadMockData: function() {
        console.log('📦 Chargement données mock réservations');
        
        this.data.users = [
            { id: 1, fullName: 'Jean Kouassi', phone: '07070707' },
            { id: 2, fullName: 'Marie Konan', phone: '07070708' },
            { id: 3, fullName: 'Paul Yao', phone: '07070709' }
        ];
        
        this.data.parkingSpaces = [
            { id: 101, spaceNumber: 'A12', floorNumber: 0, hourlyRate: 1500 },
            { id: 102, spaceNumber: 'B03', floorNumber: 0, hourlyRate: 1500 },
            { id: 103, spaceNumber: 'C07', floorNumber: 1, hourlyRate: 1500 }
        ];
        
        this.data.vehicles = [
            { id: 1, licensePlate: 'AB-123-CD', brand: 'Toyota', model: 'Corolla' },
            { id: 2, licensePlate: 'EF-456-GH', brand: 'Honda', model: 'Civic' },
            { id: 3, licensePlate: 'IJ-789-KL', brand: 'Renault', model: 'Kangoo' }
        ];
        
        this.data.reservationTypes = [
            { id: 1, name: 'Horaire', hourlyRate: 1500 },
            { id: 2, name: 'Journalier', hourlyRate: 1200 }
        ];
        
        this.data.reservations = [
            {
                id: 1,
                confirmationNumber: 'RES-20240318-001',
                userId: 1,
                parkingSpaceId: 101,
                vehicleId: 1,
                reservationTypeId: 1,
                startDateTime: '2024-03-18T08:00:00',
                endDateTime: '2024-03-18T12:00:00',
                durationInHours: 4,
                totalAmount: 5000,
                status: 'confirmed',
                clientName: 'Jean Kouassi',
                spaceNumber: 'A12'
            },
            {
                id: 2,
                confirmationNumber: 'RES-20240318-002',
                userId: 2,
                parkingSpaceId: 102,
                vehicleId: 2,
                reservationTypeId: 2,
                startDateTime: '2024-03-18T14:00:00',
                endDateTime: '2024-03-18T18:00:00',
                durationInHours: 4,
                totalAmount: 6000,
                status: 'pending',
                clientName: 'Marie Konan',
                spaceNumber: 'B03'
            },
            {
                id: 3,
                confirmationNumber: 'RES-20240317-015',
                userId: 3,
                parkingSpaceId: 103,
                vehicleId: 3,
                reservationTypeId: 1,
                startDateTime: '2024-03-17T09:00:00',
                endDateTime: '2024-03-17T17:00:00',
                durationInHours: 8,
                totalAmount: 12000,
                status: 'confirmed',
                clientName: 'Paul Yao',
                spaceNumber: 'C07'
            }
        ];
        
        this.renderTable();
        this.updateStats();
        this.populateSelects();
    },
    
    renderTable: function() {
        const tbody = document.getElementById('reservationsTableBody');
        if (!tbody) return;
        
        if (this.data.reservations.length === 0) {
            tbody.innerHTML = '<td colspan="9" class="text-center"><i class="fas fa-calendar-times"></i><br>Aucune réservation</td>';
            return;
        }
        
        tbody.innerHTML = this.data.reservations.map(res => {
            const statusClass = this.getStatusClass(res.status);
            const statusText = this.getStatusText(res.status);
            
            return `
                <tr>
                    <td><strong>${res.confirmationNumber || 'N/A'}</strong></td>
                    <td>${res.clientName || 'N/A'}</td>
                    <td>${res.spaceNumber || 'N/A'}</td>
                    <td>${this.formatDate(res.startDateTime)}</td>
                    <td>${this.formatDate(res.endDateTime)}</td>
                    <td>${res.durationInHours}h</td>
                    <td><strong>${this.formatCFA(res.totalAmount)}</strong></td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td class="table-actions">
                        <button class="btn-icon" onclick="ReservationsPage.viewReservation(${res.id})" title="Voir détails">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon" onclick="ReservationsPage.editReservation(${res.id})" title="Modifier">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon" onclick="ReservationsPage.cancelReservation(${res.id})" title="Annuler">
                            <i class="fas fa-times"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },
    
    getStatusClass: function(status) {
        const classes = {
            'confirmed': 'status-active',
            'pending': 'status-pending',
            'cancelled': 'status-inactive'
        };
        return classes[status] || 'status-pending';
    },
    
    getStatusText: function(status) {
        const texts = {
            'confirmed': 'Confirmée',
            'pending': 'En attente',
            'cancelled': 'Annulée'
        };
        return texts[status] || status;
    },
    
    formatDate: function(dateStr) {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    formatCFA: function(amount) {
        if (!amount && amount !== 0) return '0 FCFA';
        return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + ' FCFA';
    },
    
    updateStats: function() {
        const total = this.data.reservations.length;
        const active = this.data.reservations.filter(r => r.status === 'confirmed').length;
        const pending = this.data.reservations.filter(r => r.status === 'pending').length;
        
        document.getElementById('totalReservations').textContent = total;
        document.getElementById('activeReservations').textContent = active;
        document.getElementById('pendingReservations').textContent = pending;
        document.getElementById('confirmedReservations').textContent = active;
    },
    
    populateSelects: function() {
        const userSelect = document.getElementById('userId');
        if (userSelect && this.data.users.length > 0) {
            userSelect.innerHTML = '<option value="">Sélectionner un client</option>' +
                this.data.users.map(u => `<option value="${u.id}">${u.fullName} (${u.phoneNumber || u.phone})</option>`).join('');
        }
        
        const spaceSelect = document.getElementById('parkingSpaceId');
        if (spaceSelect && this.data.parkingSpaces.length > 0) {
            spaceSelect.innerHTML = '<option value="">Sélectionner une place</option>' +
                this.data.parkingSpaces.map(s => 
                    `<option value="${s.id}">Étage ${s.floorNumber} - Place ${s.spaceNumber} (${this.formatCFA(s.hourlyRate)}/h)</option>`
                ).join('');
        }
        
        const vehicleSelect = document.getElementById('vehicleId');
        if (vehicleSelect && this.data.vehicles.length > 0) {
            vehicleSelect.innerHTML = '<option value="">Sélectionner un véhicule</option>' +
                this.data.vehicles.map(v => 
                    `<option value="${v.id}">${v.brand} ${v.model} (${v.licensePlate})</option>`
                ).join('');
        }
        
        const typeSelect = document.getElementById('reservationTypeId');
        if (typeSelect && this.data.reservationTypes.length > 0) {
            typeSelect.innerHTML = '<option value="">Sélectionner un type</option>' +
                this.data.reservationTypes.map(t => 
                    `<option value="${t.id}">${t.name} (${this.formatCFA(t.hourlyRate)}/h)</option>`
                ).join('');
        }
        
        // Optionnel : ajouter le select des promotions
        const promoSelect = document.getElementById('promoCode');
        if (promoSelect && this.data.promotionalOffers.length > 0) {
            promoSelect.innerHTML = '<option value="">Aucun code promo</option>' +
                this.data.promotionalOffers.filter(p => p.isActive).map(p => 
                    `<option value="${p.code}">${p.code} - ${p.discountType === 'percentage' ? p.discountValue + '%' : this.formatCFA(p.discountValue)}</option>`
                ).join('');
        }
    },
    
    setupEventListeners: function() {
        document.getElementById('periodFilter')?.addEventListener('change', (e) => {
            this.filters.period = e.target.value;
            this.applyFilters();
        });
        
        document.getElementById('statusFilter')?.addEventListener('change', (e) => {
            this.filters.status = e.target.value;
            this.applyFilters();
        });
        
        document.getElementById('clientFilter')?.addEventListener('input', (e) => {
            this.filters.client = e.target.value;
            this.applyFilters();
        });
        
        document.getElementById('reservationForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveReservation();
        });
    },
    
    applyFilters: function() {
        const filtered = this.data.reservations.filter(res => {
            let match = true;
            
            if (this.filters.status !== 'all') {
                match = match && res.status === this.filters.status;
            }
            
            if (this.filters.client) {
                const clientMatch = res.clientName?.toLowerCase().includes(this.filters.client.toLowerCase());
                match = match && clientMatch;
            }
            
            if (this.filters.period === 'today') {
                const today = new Date().toDateString();
                const resDate = new Date(res.startDateTime).toDateString();
                match = match && today === resDate;
            } else if (this.filters.period === 'week') {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                const resDate = new Date(res.startDateTime);
                match = match && resDate >= weekAgo;
            }
            
            return match;
        });
        
        const tbody = document.getElementById('reservationsTableBody');
        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="text-center"><i class="fas fa-search"></i><br>Aucune réservation trouvée</td></tr>';
        } else {
            const allReservations = this.data.reservations;
            this.data.reservations = filtered;
            this.renderTable();
            this.data.reservations = allReservations;
        }
    },
    
    openModal: function(reservation = null) {
        const modal = document.getElementById('reservationModal');
        const form = document.getElementById('reservationForm');
        
        if (reservation) {
            document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit"></i> Modifier réservation';
            document.getElementById('reservationId').value = reservation.id;
            document.getElementById('userId').value = reservation.userId;
            document.getElementById('parkingSpaceId').value = reservation.parkingSpaceId;
            document.getElementById('vehicleId').value = reservation.vehicleId;
            document.getElementById('reservationTypeId').value = reservation.reservationTypeId;
            document.getElementById('startDateTime').value = reservation.startDateTime ? reservation.startDateTime.slice(0, 16) : '';
            document.getElementById('endDateTime').value = reservation.endDateTime ? reservation.endDateTime.slice(0, 16) : '';
            document.getElementById('note').value = reservation.note || '';
        } else {
            form.reset();
            document.getElementById('modalTitle').innerHTML = '<i class="fas fa-plus-circle"></i> Nouvelle réservation';
            document.getElementById('reservationId').value = '';
            
            // Valeurs par défaut
            const now = new Date();
            const nextHour = new Date();
            nextHour.setHours(now.getHours() + 1);
            document.getElementById('startDateTime').value = now.toISOString().slice(0, 16);
            document.getElementById('endDateTime').value = nextHour.toISOString().slice(0, 16);
        }
        
        modal.classList.add('active');
    },
    
    closeModal: function() {
        document.getElementById('reservationModal').classList.remove('active');
    },
    
    viewReservation: function(id) {
        const reservation = this.data.reservations.find(r => r.id === id);
        if (!reservation) return;
        
        const user = this.data.users.find(u => u.id === reservation.userId);
        const space = this.data.parkingSpaces.find(s => s.id === reservation.parkingSpaceId);
        const vehicle = this.data.vehicles.find(v => v.id === reservation.vehicleId);
        const type = this.data.reservationTypes.find(t => t.id === reservation.reservationTypeId);
        
        const modal = document.getElementById('detailsModal');
        const details = document.getElementById('reservationDetails');
        
        details.innerHTML = `
            <div class="reservation-details">
                <div class="detail-row">
                    <div class="detail-label"><i class="fas fa-hashtag"></i> N° Réservation</div>
                    <div class="detail-value"><strong>${reservation.confirmationNumber || 'N/A'}</strong></div>
                </div>
                <div class="detail-row">
                    <div class="detail-label"><i class="fas fa-user"></i> Client</div>
                    <div class="detail-value">${user ? user.fullName : 'N/A'}<br><small>${user ? user.phoneNumber : ''}</small></div>
                </div>
                <div class="detail-row">
                    <div class="detail-label"><i class="fas fa-parking"></i> Place</div>
                    <div class="detail-value">${space ? `Étage ${space.floorNumber} - Place ${space.spaceNumber}` : 'N/A'}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label"><i class="fas fa-car"></i> Véhicule</div>
                    <div class="detail-value">${vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.licensePlate})` : 'N/A'}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label"><i class="fas fa-tag"></i> Type</div>
                    <div class="detail-value">${type ? type.name : 'N/A'}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label"><i class="fas fa-clock"></i> Début</div>
                    <div class="detail-value">${this.formatDate(reservation.startDateTime)}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label"><i class="fas fa-clock"></i> Fin</div>
                    <div class="detail-value">${this.formatDate(reservation.endDateTime)}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label"><i class="fas fa-hourglass-half"></i> Durée</div>
                    <div class="detail-value">${reservation.durationInHours} heures</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label"><i class="fas fa-money-bill"></i> Montant</div>
                    <div class="detail-value"><strong>${this.formatCFA(reservation.totalAmount)}</strong></div>
                </div>
                <div class="detail-row">
                    <div class="detail-label"><i class="fas fa-tag"></i> Statut</div>
                    <div class="detail-value">
                        <span class="status-badge ${this.getStatusClass(reservation.status)}">
                            ${this.getStatusText(reservation.status)}
                        </span>
                    </div>
                </div>
                ${reservation.note ? `
                <div class="detail-row">
                    <div class="detail-label"><i class="fas fa-sticky-note"></i> Note</div>
                    <div class="detail-value">${reservation.note}</div>
                </div>
                ` : ''}
            </div>
            <div class="form-actions">
                <button class="btn-secondary" onclick="ReservationsPage.closeDetailsModal()">
                    <i class="fas fa-times"></i> Fermer
                </button>
                <button class="btn-primary" onclick="ReservationsPage.editReservation(${reservation.id})">
                    <i class="fas fa-edit"></i> Modifier
                </button>
            </div>
        `;
        
        modal.classList.add('active');
    },
    
    closeDetailsModal: function() {
        document.getElementById('detailsModal').classList.remove('active');
    },
    
    editReservation: function(id) {
        const reservation = this.data.reservations.find(r => r.id === id);
        if (reservation) {
            this.closeDetailsModal();
            this.openModal(reservation);
        }
    },
    
    cancelReservation: async function(id) {
        if (!confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) return;
        
        try {
            const result = await api.deleteReservation(id);
            if (result.success) {
                // Supprimer localement
                this.data.reservations = this.data.reservations.filter(r => r.id !== id);
                App.showSuccess('Réservation annulée avec succès');
                this.renderTable();
                this.updateStats();
            } else {
                App.showError(result.error || 'Erreur lors de l\'annulation');
            }
        } catch (error) {
            console.error('❌ Erreur annulation:', error);
            App.showError('Erreur lors de l\'annulation');
        }
    },
    
    saveReservation: async function() {
        const id = document.getElementById('reservationId').value;
        
        const userId = parseInt(document.getElementById('userId').value);
        const parkingSpaceId = parseInt(document.getElementById('parkingSpaceId').value);
        const vehicleId = parseInt(document.getElementById('vehicleId').value);
        const reservationTypeId = parseInt(document.getElementById('reservationTypeId').value);
        const startDateTime = document.getElementById('startDateTime').value;
        const endDateTime = document.getElementById('endDateTime').value;
        const note = document.getElementById('note').value;
        
        // Validation
        if (!userId || !parkingSpaceId || !vehicleId || !reservationTypeId || !startDateTime || !endDateTime) {
            App.showError('Veuillez remplir tous les champs obligatoires');
            return;
        }
        
        // Calcul de la durée
        const start = new Date(startDateTime);
        const end = new Date(endDateTime);
        
        if (start >= end) {
            App.showError('La date de fin doit être après la date de début');
            return;
        }
        
        const durationInHours = (end - start) / (1000 * 60 * 60);
        
        // Trouver la place et le type pour calculer le montant
        const space = this.data.parkingSpaces.find(s => s.id === parkingSpaceId);
        const type = this.data.reservationTypes.find(t => t.id === reservationTypeId);
        
        const hourlyRate = type ? type.hourlyRate : (space ? space.hourlyRate : 1500);
        const totalAmount = Math.round(durationInHours * hourlyRate);
        
        const reservationData = {
            userId: userId,
            parkingSpaceId: parkingSpaceId,
            vehicleId: vehicleId,
            reservationTypeId: reservationTypeId,
            startDateTime: startDateTime,
            endDateTime: endDateTime,
            durationInHours: Math.round(durationInHours * 10) / 10,
            totalAmount: totalAmount,
            note: note || ''
        };
        
        try {
            let result;
            
            if (id) {
                // Modification
                result = await api.updateReservation(parseInt(id), reservationData);
                if (result.success) {
                    App.showSuccess('Réservation modifiée avec succès');
                    await this.loadReservations();
                    this.renderTable();
                    this.updateStats();
                } else {
                    App.showError(result.error || 'Erreur lors de la modification');
                }
            } else {
                // Création
                result = await api.createReservation(reservationData);
                if (result.success) {
                    App.showSuccess('Réservation créée avec succès');
                    await this.loadReservations();
                    this.renderTable();
                    this.updateStats();
                } else {
                    App.showError(result.error || 'Erreur lors de la création');
                }
            }
            
            this.closeModal();
        } catch (error) {
            console.error('❌ Erreur sauvegarde:', error);
            App.showError('Erreur lors de l\'enregistrement');
        }
    },
    
    exportData: function() {
        const dataToExport = this.data.reservations.map(r => ({
            'N° Réservation': r.confirmationNumber,
            'Client': r.clientName,
            'Place': r.spaceNumber,
            'Début': this.formatDate(r.startDateTime),
            'Fin': this.formatDate(r.endDateTime),
            'Durée': r.durationInHours + 'h',
            'Montant': r.totalAmount,
            'Statut': this.getStatusText(r.status)
        }));
        
        const headers = Object.keys(dataToExport[0] || {});
        const rows = dataToExport.map(obj => headers.map(h => obj[h]));
        
        const csv = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');
        
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `reservations_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        App.showSuccess('Export terminé');
    },
    
    updateUserName: function() {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                document.getElementById('userName').textContent = user.fullName || 'Rebecca KANGBE';
                document.getElementById('userRole').innerHTML = '<i class="fas fa-user-circle"></i> ' + (user.role || 'Administrateur');
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
    ReservationsPage.init();
});

window.ReservationsPage = ReservationsPage;