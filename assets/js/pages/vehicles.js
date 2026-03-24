// assets/js/pages/vehicles.js
const VehiclesPage = {
    data: {
        vehicles: [],
        users: [],
        vehicleTypes: [],
        currentView: 'grid'
    },
    
    filters: {
        search: '',
        type: 'all',
        insurance: 'all',
        status: 'all'
    },
    
    init: function() {
        this.loadData();
        this.setupEventListeners();
        this.updateUserName();
    },
    
    loadData: async function() {
        try {
            // Charger les types de véhicules
            await this.loadVehicleTypes();
            
            // Charger les utilisateurs
            await this.loadUsers();
            
            // Puis charger les véhicules
            const result = await api.getVehicles();
            console.log('📦 Véhicules reçus:', result);
            
            if (result.success) {
                this.data.vehicles = result.data || [];
                this.renderView();
                this.updateStats();
            } else {
                console.error('❌ Erreur API véhicules:', result.error);
                App.showError('Impossible de charger les véhicules');
                this.loadMockData();
            }
        } catch (error) {
            console.error('❌ Erreur chargement véhicules:', error);
            App.showError('Impossible de charger les véhicules');
            this.loadMockData();
        }
    },
    
    loadUsers: async function() {
        try {
            const result = await api.getUsers();
            if (result.success) {
                this.data.users = result.data || [];
                this.populateUserSelect();
            }
        } catch (error) {
            console.error('❌ Erreur chargement utilisateurs:', error);
        }
    },
    
    loadVehicleTypes: async function() {
        try {
            const result = await api.getVehicleTypes();
            if (result.success) {
                this.data.vehicleTypes = result.data || [];
                this.populateTypeSelect();
            }
        } catch (error) {
            console.error('❌ Erreur chargement types:', error);
            // Fallback aux types par défaut
            this.data.vehicleTypes = [
                { id: 1, name: 'voiture' },
                { id: 2, name: 'moto' },
                { id: 3, name: 'utilitaire' },
                { id: 4, name: 'poids-lourd' }
            ];
            this.populateTypeSelect();
        }
    },
    
    populateUserSelect: function() {
        const select = document.getElementById('userId');
        if (!select) return;
        
        select.innerHTML = '<option value="">Sélectionner un propriétaire</option>';
        
        if (this.data.users.length > 0) {
            this.data.users.forEach(user => {
                select.innerHTML += `<option value="${user.id}">${user.fullName}</option>`;
            });
        }
    },
    
    populateTypeSelect: function() {
        const select = document.getElementById('vehicleType');
        if (!select) return;
        
        select.innerHTML = '<option value="">Sélectionner un type</option>';
        
        if (this.data.vehicleTypes.length > 0) {
            this.data.vehicleTypes.forEach(type => {
                select.innerHTML += `<option value="${type.id}">${type.name}</option>`;
            });
        }
    },
    
    loadMockData: function() {
        console.log('📦 Chargement données mock véhicules');
        this.data.users = [
            { id: 1, fullName: 'Jean Kouassi' },
            { id: 2, fullName: 'Marie Konan' },
            { id: 3, fullName: 'Paul Yao' }
        ];
        
        this.data.vehicles = [
            {
                id: 1,
                userId: 1,
                licensePlate: 'AB-123-CD',
                vehiculeTypeId: 1,
                brand: 'Toyota',
                model: 'Corolla',
                color: 'Blanc',
                year: 2022,
                isInsured: true,
                insuranceCompany: 'SUNU Assurance',
                insuranceNumber: 'POL-2022-001',
                insuranceExpiry: '2025-12-31',
                status: 1, // 1 = parked
                currentSpot: 'A12',
                notes: 'Climatisation révisée'
            },
            {
                id: 2,
                userId: 2,
                licensePlate: 'EF-456-GH',
                vehiculeTypeId: 2,
                brand: 'Yamaha',
                model: 'MT-07',
                color: 'Noir',
                year: 2023,
                isInsured: true,
                insuranceCompany: 'AXA',
                insuranceNumber: 'POL-2023-045',
                insuranceExpiry: '2024-11-30',
                status: 0, // 0 = outside
                currentSpot: null,
                notes: ''
            },
            {
                id: 3,
                userId: 3,
                licensePlate: 'IJ-789-KL',
                vehiculeTypeId: 3,
                brand: 'Renault',
                model: 'Kangoo',
                color: 'Bleu',
                year: 2021,
                isInsured: false,
                insuranceCompany: null,
                insuranceNumber: null,
                insuranceExpiry: null,
                status: 1,
                currentSpot: 'B03',
                notes: 'Véhicule de livraison'
            }
        ];
        this.renderView();
        this.updateStats();
    },
    
    renderView: function() {
        const container = document.getElementById('vehiclesContainer');
        if (!container) return;
        
        if (this.currentView === 'grid') {
            container.innerHTML = this.renderGridView();
        } else {
            container.innerHTML = this.renderListView();
        }
    },
    
    renderGridView: function() {
        const filteredVehicles = this.getFilteredVehicles();
        
        if (filteredVehicles.length === 0) {
            return '<div class="text-center"><i class="fas fa-car" style="font-size: 48px; opacity: 0.3; margin-bottom: 20px;"></i><br>Aucun véhicule trouvé</div>';
        }
        
        return `
            <div class="vehicles-grid">
                ${filteredVehicles.map(vehicle => {
                    const owner = this.getUserName(vehicle.userId);
                    const typeName = this.getVehicleTypeName(vehicle.vehiculeTypeId);
                    const insuranceClass = vehicle.isInsured ? 'insured' : 'uninsured';
                    const isParked = vehicle.status === 1;
                    
                    return `
                        <div class="vehicle-card ${insuranceClass}">
                            <div class="vehicle-status">
                                <span class="vehicle-badge ${vehicle.isInsured ? 'badge-insured' : 'badge-uninsured'}">
                                    <i class="fas ${vehicle.isInsured ? 'fa-shield-alt' : 'fa-exclamation-triangle'}"></i>
                                    ${vehicle.isInsured ? 'Assuré' : 'Non assuré'}
                                </span>
                                ${isParked ? 
                                    '<span class="vehicle-badge badge-parked"><i class="fas fa-parking"></i> Garé</span>' : 
                                    '<span class="vehicle-badge"><i class="fas fa-road"></i> Sorti</span>'}
                            </div>
                            
                            <div class="vehicle-icon">
                                <i class="fas ${this.getVehicleIcon(typeName)}"></i>
                            </div>
                            
                            <div class="vehicle-plate">${vehicle.licensePlate}</div>
                            
                            <div class="vehicle-info">
                                <div class="vehicle-model">${vehicle.brand} ${vehicle.model}</div>
                                <div class="vehicle-details">
                                    <i class="fas fa-palette"></i> ${vehicle.color} • 
                                    <i class="fas fa-calendar"></i> ${vehicle.year || 'N/A'}
                                </div>
                                <div class="vehicle-owner">
                                    <i class="fas fa-user"></i> ${owner}
                                </div>
                                ${vehicle.currentSpot ? 
                                    `<div class="vehicle-details"><i class="fas fa-map-marker-alt"></i> Place ${vehicle.currentSpot}</div>` : ''}
                            </div>
                            
                            <div class="vehicle-actions">
                                <button class="btn-icon" onclick="VehiclesPage.viewVehicle(${vehicle.id})">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="btn-icon" onclick="VehiclesPage.editVehicle(${vehicle.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn-icon" onclick="VehiclesPage.toggleInsurance(${vehicle.id})">
                                    <i class="fas ${vehicle.isInsured ? 'fa-shield' : 'fa-shield-alt'}"></i>
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },
    
    renderListView: function() {
        const filteredVehicles = this.getFilteredVehicles();
        
        if (filteredVehicles.length === 0) {
            return '<div class="text-center">Aucun véhicule trouvé</div>';
        }
        
        return `
            <div class="vehicles-list">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th><i class="fas fa-id-card"></i> Plaque</th>
                            <th><i class="fas fa-car"></i> Véhicule</th>
                            <th><i class="fas fa-user"></i> Propriétaire</th>
                            <th><i class="fas fa-shield-alt"></i> Assurance</th>
                            <th><i class="fas fa-parking"></i> Statut</th>
                            <th><i class="fas fa-cog"></i> Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredVehicles.map(vehicle => {
                            const owner = this.getUserName(vehicle.userId);
                            const isParked = vehicle.status === 1;
                            
                            return `
                                <tr>
                                    <td><strong>${vehicle.licensePlate}</strong></td>
                                    <td>${vehicle.brand} ${vehicle.model} (${vehicle.color})</td>
                                    <td>${owner}</td>
                                    <td>
                                        <span class="status-badge ${vehicle.isInsured ? 'status-active' : 'status-inactive'}">
                                            <i class="fas ${vehicle.isInsured ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                                            ${vehicle.isInsured ? 'Assuré' : 'Non assuré'}
                                        </span>
                                    </td>
                                    <td>
                                        ${isParked ? 
                                            '<span class="status-badge badge-parked"><i class="fas fa-parking"></i> Garé</span>' : 
                                            '<span class="status-badge"><i class="fas fa-road"></i> Sorti</span>'}
                                    </td>
                                    <td class="table-actions">
                                        <button class="btn-icon" onclick="VehiclesPage.viewVehicle(${vehicle.id})">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        <button class="btn-icon" onclick="VehiclesPage.editVehicle(${vehicle.id})">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },
    
    getVehicleIcon: function(typeName) {
        const icons = {
            'voiture': 'fa-car',
            'moto': 'fa-motorcycle',
            'utilitaire': 'fa-truck',
            'poids-lourd': 'fa-truck-moving'
        };
        return icons[typeName] || 'fa-car';
    },
    
    getVehicleTypeName: function(typeId) {
        const type = this.data.vehicleTypes.find(t => t.id === typeId);
        return type ? type.name : 'inconnu';
    },
    
    getUserName: function(userId) {
        const user = this.data.users.find(u => u.id === userId);
        return user ? user.fullName : 'Inconnu';
    },
    
    getFilteredVehicles: function() {
        return this.data.vehicles.filter(vehicle => {
            let match = true;
            
            if (this.filters.search) {
                const searchLower = this.filters.search.toLowerCase();
                match = match && (
                    (vehicle.licensePlate && vehicle.licensePlate.toLowerCase().includes(searchLower)) ||
                    (vehicle.brand && vehicle.brand.toLowerCase().includes(searchLower)) ||
                    (vehicle.model && vehicle.model.toLowerCase().includes(searchLower))
                );
            }
            
            if (this.filters.type !== 'all') {
                const typeName = this.getVehicleTypeName(vehicle.vehiculeTypeId);
                match = match && typeName === this.filters.type;
            }
            
            if (this.filters.insurance !== 'all') {
                match = match && (
                    (this.filters.insurance === 'insured' && vehicle.isInsured) ||
                    (this.filters.insurance === 'uninsured' && !vehicle.isInsured)
                );
            }
            
            if (this.filters.status !== 'all') {
                const isParked = vehicle.status === 1;
                match = match && (
                    (this.filters.status === 'parked' && isParked) ||
                    (this.filters.status === 'outside' && !isParked)
                );
            }
            
            return match;
        });
    },
    
    updateStats: function() {
        const total = this.data.vehicles.length;
        const insured = this.data.vehicles.filter(v => v.isInsured).length;
        const uninsured = total - insured;
        const parked = this.data.vehicles.filter(v => v.status === 1).length;
        
        document.getElementById('totalVehicles').textContent = total;
        document.getElementById('insuredVehicles').textContent = insured;
        document.getElementById('uninsuredVehicles').textContent = uninsured;
        document.getElementById('parkedVehicles').textContent = parked;
    },
    
    setupEventListeners: function() {
        document.getElementById('searchInput')?.addEventListener('input', (e) => {
            this.filters.search = e.target.value;
            this.renderView();
        });
        
        document.getElementById('typeFilter')?.addEventListener('change', (e) => {
            this.filters.type = e.target.value;
            this.renderView();
        });
        
        document.getElementById('insuranceFilter')?.addEventListener('change', (e) => {
            this.filters.insurance = e.target.value;
            this.renderView();
        });
        
        document.getElementById('statusFilter')?.addEventListener('change', (e) => {
            this.filters.status = e.target.value;
            this.renderView();
        });
        
        document.getElementById('vehicleForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveVehicle();
        });
        
        document.getElementById('isInsured')?.addEventListener('change', (e) => {
            this.toggleInsuranceFields();
        });
    },
    
    toggleView: function(view) {
        this.currentView = view;
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        this.renderView();
    },
    
    toggleInsuranceFields: function() {
        const isChecked = document.getElementById('isInsured').checked;
        document.getElementById('insuranceFields').style.display = isChecked ? 'block' : 'none';
    },
    
    openModal: function(vehicle = null) {
        const modal = document.getElementById('vehicleModal');
        this.populateUserSelect();
        this.populateTypeSelect();
        
        if (vehicle) {
            document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit"></i> Modifier véhicule';
            document.getElementById('vehicleId').value = vehicle.id;
            document.getElementById('userId').value = vehicle.userId;
            document.getElementById('licensePlate').value = vehicle.licensePlate;
            document.getElementById('vehicleType').value = vehicle.vehiculeTypeId;
            document.getElementById('brand').value = vehicle.brand;
            document.getElementById('model').value = vehicle.model;
            document.getElementById('color').value = vehicle.color;
            document.getElementById('year').value = vehicle.year || '';
            document.getElementById('isInsured').checked = vehicle.isInsured || false;
            document.getElementById('notes').value = vehicle.notes || '';
            
            if (vehicle.isInsured) {
                document.getElementById('insuranceFields').style.display = 'block';
                document.getElementById('insuranceCompany').value = vehicle.insuranceCompany || '';
                document.getElementById('insuranceNumber').value = vehicle.insuranceNumber || '';
                document.getElementById('insuranceExpiry').value = vehicle.insuranceExpiry || '';
            } else {
                document.getElementById('insuranceFields').style.display = 'none';
            }
        } else {
            document.getElementById('vehicleForm').reset();
            document.getElementById('modalTitle').innerHTML = '<i class="fas fa-plus"></i> Nouveau véhicule';
            document.getElementById('vehicleId').value = '';
            document.getElementById('insuranceFields').style.display = 'none';
        }
        
        modal.classList.add('active');
    },
    
    closeModal: function() {
        document.getElementById('vehicleModal').classList.remove('active');
    },
    
    viewVehicle: function(id) {
        const vehicle = this.data.vehicles.find(v => v.id === id);
        if (!vehicle) return;
        
        const modal = document.getElementById('vehicleDetailsModal');
        const details = document.getElementById('vehicleDetails');
        const owner = this.getUserName(vehicle.userId);
        const typeName = this.getVehicleTypeName(vehicle.vehiculeTypeId);
        const isParked = vehicle.status === 1;
        
        details.innerHTML = `
            <div class="vehicle-details">
                <div class="detail-row">
                    <div class="detail-label"><i class="fas fa-id-card"></i> Plaque</div>
                    <div class="detail-value"><strong>${vehicle.licensePlate}</strong></div>
                </div>
                <div class="detail-row">
                    <div class="detail-label"><i class="fas fa-tag"></i> Type</div>
                    <div class="detail-value"><i class="fas ${this.getVehicleIcon(typeName)}"></i> ${typeName}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label"><i class="fas fa-trademark"></i> Marque/Modèle</div>
                    <div class="detail-value">${vehicle.brand} ${vehicle.model}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label"><i class="fas fa-palette"></i> Couleur</div>
                    <div class="detail-value">${vehicle.color}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label"><i class="fas fa-calendar"></i> Année</div>
                    <div class="detail-value">${vehicle.year || 'N/A'}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label"><i class="fas fa-user"></i> Propriétaire</div>
                    <div class="detail-value">${owner}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label"><i class="fas fa-shield-alt"></i> Assurance</div>
                    <div class="detail-value">
                        <span class="status-badge ${vehicle.isInsured ? 'status-active' : 'status-inactive'}">
                            <i class="fas ${vehicle.isInsured ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                            ${vehicle.isInsured ? 'Assuré' : 'Non assuré'}
                        </span>
                    </div>
                </div>
                <div class="detail-row">
                    <div class="detail-label"><i class="fas fa-parking"></i> Statut</div>
                    <div class="detail-value">
                        ${isParked ? 
                            `<i class="fas fa-parking" style="color: var(--lime);"></i> Garé ${vehicle.currentSpot ? '(Place ' + vehicle.currentSpot + ')' : ''}` : 
                            '<i class="fas fa-road"></i> Sorti'}
                    </div>
                </div>
                
                ${vehicle.isInsured ? `
                    <div class="insurance-info">
                        <h4><i class="fas fa-shield-alt"></i> Informations d'assurance</h4>
                        <div class="detail-row">
                            <div class="detail-label">Compagnie</div>
                            <div class="detail-value">${vehicle.insuranceCompany || 'N/A'}</div>
                        </div>
                        <div class="detail-row">
                            <div class="detail-label">N° Police</div>
                            <div class="detail-value">${vehicle.insuranceNumber || 'N/A'}</div>
                        </div>
                        <div class="detail-row">
                            <div class="detail-label">Expiration</div>
                            <div class="detail-value">${vehicle.insuranceExpiry ? new Date(vehicle.insuranceExpiry).toLocaleDateString('fr-FR') : 'N/A'}</div>
                        </div>
                    </div>
                ` : ''}
                
                ${vehicle.notes ? `
                    <div class="detail-row">
                        <div class="detail-label"><i class="fas fa-sticky-note"></i> Notes</div>
                        <div class="detail-value">${vehicle.notes}</div>
                    </div>
                ` : ''}
            </div>
            <div class="form-actions">
                <button class="btn-secondary" onclick="VehiclesPage.closeDetailsModal()">
                    <i class="fas fa-times"></i> Fermer
                </button>
                <button class="btn-primary" onclick="VehiclesPage.editVehicle(${vehicle.id})">
                    <i class="fas fa-edit"></i> Modifier
                </button>
            </div>
        `;
        
        modal.classList.add('active');
    },
    
    closeDetailsModal: function() {
        document.getElementById('vehicleDetailsModal').classList.remove('active');
    },
    
    editVehicle: function(id) {
        const vehicle = this.data.vehicles.find(v => v.id === id);
        if (vehicle) {
            this.closeDetailsModal();
            this.openModal(vehicle);
        }
    },
    
    toggleInsurance: async function(id) {
        const vehicle = this.data.vehicles.find(v => v.id === id);
        if (!vehicle) return;
        
        vehicle.isInsured = !vehicle.isInsured;
        
        // Préparer les données de mise à jour
        const updateData = {
            id: vehicle.id,
            licensePlate: vehicle.licensePlate,
            userId: vehicle.userId,
            vehiculeTypeId: vehicle.vehiculeTypeId,
            brand: vehicle.brand,
            model: vehicle.model,
            color: vehicle.color,
            isInsured: vehicle.isInsured,
            insuranceExpiryDate: vehicle.insuranceExpiry || null,
            status: vehicle.status
        };
        
        try {
            const result = await api.updateVehicle(vehicle.id, updateData);
            if (result.success) {
                App.showSuccess(`Assurance ${vehicle.isInsured ? 'activée' : 'désactivée'}`);
                this.renderView();
            } else {
                // Revenir en arrière si erreur
                vehicle.isInsured = !vehicle.isInsured;
                App.showError(result.error || 'Erreur lors de la modification');
            }
        } catch (error) {
            vehicle.isInsured = !vehicle.isInsured;
            App.showError(error.message || 'Erreur lors de la modification');
        }
    },

    saveVehicle: async function() {
        const id = document.getElementById('vehicleId').value;
        
        // Récupérer les valeurs du formulaire
        const licensePlate = document.getElementById('licensePlate').value;
        const userId = parseInt(document.getElementById('userId').value);
        const vehiculeTypeId = parseInt(document.getElementById('vehicleType').value);
        const brand = document.getElementById('brand').value;
        const model = document.getElementById('model').value;
        const color = document.getElementById('color').value;
        const year = document.getElementById('year').value ? parseInt(document.getElementById('year').value) : null;
        const isInsured = document.getElementById('isInsured').checked;
        const notes = document.getElementById('notes').value || "";
        
        // Validation des champs obligatoires
        if (!licensePlate || !userId || !vehiculeTypeId || !brand || !model || !color) {
            App.showError('Veuillez remplir tous les champs obligatoires');
            return;
        }
        
        // Données de base communes
        const baseData = {
            licensePlate: licensePlate,
            userId: userId,
            vehiculeTypeId: vehiculeTypeId,
            brand: brand,
            model: model,
            color: color
        };
        
        try {
            let result;
            
            if (id) {
                // Modification - on inclut tous les champs
                const updateData = {
                    id: parseInt(id),
                    ...baseData,
                    isInsured: isInsured,
                    insuranceExpiryDate: isInsured ? document.getElementById('insuranceExpiry').value : null,
                    status: 1, // ItemsStatus.EnCours
                    year: year,
                    notes: notes
                };
                
                console.log('📦 Modification:', updateData);
                result = await api.updateVehicle(parseInt(id), updateData);
            } else {
                // Création - on utilise CreateVehiculeDto (sans assurance ni status)
                const createData = {
                    ...baseData,
                    year: year,
                    notes: notes
                };
                
                console.log('📦 Création:', createData);
                result = await api.createVehicle(createData);
            }
            
            console.log('📦 Réponse API:', result);
            
            if (result.success) {
                App.showSuccess(id ? 'Véhicule modifié avec succès' : 'Véhicule ajouté avec succès');
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
    VehiclesPage.init();
});

window.VehiclesPage = VehiclesPage;