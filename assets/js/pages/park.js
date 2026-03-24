// assets/js/pages/park.js
const ParkingPage = {
    data: {
        parkingSpaces: [],
        vehicles: [],
        clients: [],
        updateInterval: null
    },
    
    init: function() {
        this.loadData();
        this.setupEventListeners();
        this.startRealTimeUpdates();
        this.updateUserName();
    },
    
    loadData: async function() {
        try {
            await this.loadParkingSpaces();
            await this.loadVehicles();
            await this.loadClients();
            this.renderParkingGrid();
            this.updateStats();
            this.populateSelects();
        } catch (error) {
            console.error('❌ Erreur chargement parking:', error);
            App.showError('Impossible de charger les données du parking');
            this.renderStaticGrid();
        }
    },
    
    loadParkingSpaces: async function() {
        try {
            const result = await api.getParkingSpaces();
            console.log('📦 Places de parking reçues:', result);
            if (result.success) {
                this.data.parkingSpaces = result.data || [];
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('❌ Erreur chargement places:', error);
            throw error;
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
    
    loadClients: async function() {
        try {
            const result = await api.getUsers();
            if (result.success) {
                this.data.clients = result.data || [];
            }
        } catch (error) {
            console.error('❌ Erreur chargement clients:', error);
        }
    },
    
    renderParkingGrid: function() {
        const container = document.getElementById('parkingGrid');
        if (!container) return;
        
        if (this.data.parkingSpaces.length === 0) {
            this.renderStaticGrid();
            return;
        }
        
        const floors = [...new Set(this.data.parkingSpaces.map(s => s.floorNumber))].sort();
        
        let html = '';
        floors.forEach(floor => {
            const floorSpaces = this.data.parkingSpaces.filter(s => s.floorNumber === floor);
            const zones = {};
            floorSpaces.forEach(spot => {
                const zone = spot.section;
                if (!zones[zone]) zones[zone] = [];
                zones[zone].push(spot);
            });
            
            html += `<div class="lot-row">`;
            Object.entries(zones).forEach(([zoneName, spots]) => {
                html += this.renderZone(zoneName, floor, spots);
            });
            html += `</div>`;
            
            if (floor < floors.length - 1) {
                html += `
                    <div class="lane">
                        <span><i class="fas fa-sign-in-alt"></i> Entrée</span>
                        <span>➜➜➜</span>
                        <span><i class="fas fa-sign-out-alt"></i> Sortie</span>
                        <span><i class="fas fa-sign-in-alt"></i> Entrée</span>
                        <span>➜➜➜</span>
                        <span><i class="fas fa-sign-out-alt"></i> Sortie</span>
                        <span><i class="fas fa-sign-in-alt"></i> Entrée</span>
                        <span>➜➜➜</span>
                        <span><i class="fas fa-sign-out-alt"></i> Sortie</span>
                    </div>
                `;
            }
        });
        
        container.innerHTML = html;
        this.updateTime();
    },
    
    renderZone: function(zoneName, floor, spots) {
        spots.sort((a, b) => {
            const numA = parseInt(a.spaceNumber.replace(zoneName, ''));
            const numB = parseInt(b.spaceNumber.replace(zoneName, ''));
            return numA - numB;
        });
        
        const topRow = spots.slice(0, 4);
        const bottomRow = spots.slice(4, 8);
        
        return `
            <div class="zone" data-etage="${floor}" data-zone="${zoneName}">
                <div class="zbadge">${zoneName} ${String(floor).padStart(2, '0')}</div>
                <div class="sgrid">
                    ${this.renderStalls(topRow)}
                </div>
                <div class="sgrid1">
                    ${this.renderStalls(bottomRow)}
                </div>
            </div>
        `;
    },
    
    renderStalls: function(spots) {
        return spots.map(spot => {
            const statusClass = spot.status || 'free';
            const hasVehicle = spot.status === 'occupied';
            
            return `
                <div class="stall ${statusClass}" 
                     data-id="${spot.id}"
                     data-number="${spot.spaceNumber}"
                     data-status="${spot.status}"
                     onclick="ParkingPage.showSpotDetails(${spot.id})">
                    ${hasVehicle 
                        ? '<img src="../assets/img/car-icon.png" alt="voiture">' 
                        : `<span class="en">${spot.spaceNumber.slice(-2)}</span>`
                    }
                    <div class="stall-tooltip">
                        <div class="tooltip-content">
                            <strong>Place ${spot.spaceNumber}</strong><br>
                            <i class="fas fa-money-bill"></i> ${App.formatCFA(spot.hourlyRate)}/h<br>
                            ${spot.isHandiAccessible ? '<i class="fas fa-wheelchair"></i> Accessible' : ''}
                            ${spot.status === 'occupied' && spot.currentVehicle ? 
                                `<br><i class="fas fa-car"></i> ${spot.currentVehicle.brand} ${spot.currentVehicle.model}<br>
                                <i class="fas fa-id-card"></i> ${spot.currentVehicle.licensePlate}` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },
    
    renderStaticGrid: function() {
        const container = document.getElementById('parkingGrid');
        if (!container) return;
        
        container.innerHTML = `
            <div class="lot-row">
                <div class="zone" data-etage="0">
                    <div class="zbadge">A 01</div>
                    <div class="sgrid">
                        <div class="stall free"><span class="en">01</span></div>
                        <div class="stall free"><span class="en">02</span></div>
                        <div class="stall free"><span class="en">03</span></div>
                        <div class="stall free"><span class="en">04</span></div>
                    </div>
                    <div class="sgrid1">
                        <div class="stall free"><span class="en">05</span></div>
                        <div class="stall free"><span class="en">06</span></div>
                        <div class="stall free"><span class="en">07</span></div>
                        <div class="stall free"><span class="en">08</span></div>
                    </div>
                </div>
                <div class="zone" data-etage="0">
                    <div class="zbadge">B 01</div>
                    <div class="sgrid">
                        <div class="stall free"><span class="en">01</span></div>
                        <div class="stall free"><span class="en">02</span></div>
                        <div class="stall free"><span class="en">03</span></div>
                        <div class="stall free"><span class="en">04</span></div>
                    </div>
                    <div class="sgrid1">
                        <div class="stall free"><span class="en">05</span></div>
                        <div class="stall free"><span class="en">06</span></div>
                        <div class="stall free"><span class="en">07</span></div>
                        <div class="stall free"><span class="en">08</span></div>
                    </div>
                </div>
            </div>
            <div class="lane">
                <span><i class="fas fa-sign-in-alt"></i> Entrée</span>
                <span>➜➜➜</span>
                <span><i class="fas fa-sign-out-alt"></i> Sortie</span>
                <span><i class="fas fa-sign-in-alt"></i> Entrée</span>
                <span>➜➜➜</span>
                <span><i class="fas fa-sign-out-alt"></i> Sortie</span>
                <span><i class="fas fa-sign-in-alt"></i> Entrée</span>
                <span>➜➜➜</span>
                <span><i class="fas fa-sign-out-alt"></i> Sortie</span>
            </div>
        `;
    },
    
    updateStats: function() {
        const total = this.data.parkingSpaces.length;
        const free = this.data.parkingSpaces.filter(s => s.status === 'free').length;
        const occupied = this.data.parkingSpaces.filter(s => s.status === 'occupied').length;
        const reserved = this.data.parkingSpaces.filter(s => s.status === 'reserved').length;
        
        const statsHtml = `
            <div class="stats-cards" style="display: flex; gap: 15px; margin-bottom: 20px;">
                <div class="stat-card" style="background: white; padding: 15px; border-radius: 12px; flex: 1; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                    <div style="font-size: 12px; color: #888;"><i class="fas fa-parking"></i> Total places</div>
                    <div style="font-size: 24px; font-weight: 700;">${total}</div>
                </div>
                <div class="stat-card" style="background: white; padding: 15px; border-radius: 12px; flex: 1; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                    <div style="font-size: 12px; color: #888;"><i class="fas fa-circle" style="color: #28a745;"></i> Libres</div>
                    <div style="font-size: 24px; font-weight: 700;">${free}</div>
                </div>
                <div class="stat-card" style="background: white; padding: 15px; border-radius: 12px; flex: 1; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                    <div style="font-size: 12px; color: #888;"><i class="fas fa-circle" style="color: #dc3545;"></i> Occupées</div>
                    <div style="font-size: 24px; font-weight: 700;">${occupied}</div>
                </div>
                <div class="stat-card" style="background: white; padding: 15px; border-radius: 12px; flex: 1; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                    <div style="font-size: 12px; color: #888;"><i class="fas fa-circle" style="color: #ffc107;"></i> Réservées</div>
                    <div style="font-size: 24px; font-weight: 700;">${reserved}</div>
                </div>
            </div>
        `;
        
        const existingStats = document.querySelector('.stats-cards');
        if (existingStats) existingStats.remove();
        
        const contentHeader = document.querySelector('.content-wrapper');
        if (contentHeader && contentHeader.firstChild) {
            contentHeader.insertAdjacentHTML('afterbegin', statsHtml);
        }
    },
    
    populateSelects: function() {
        const vehicleSelect = document.getElementById('vehicleSelect');
        if (vehicleSelect && this.data.vehicles.length > 0) {
            vehicleSelect.innerHTML = '<option value="">Sélectionner un véhicule</option>' +
                this.data.vehicles.map(v => 
                    `<option value="${v.id}">${v.brand} ${v.model} - ${v.licensePlate}</option>`
                ).join('');
        }
        
        const clientSelect = document.getElementById('clientSelect');
        if (clientSelect && this.data.clients.length > 0) {
            clientSelect.innerHTML = '<option value="">Sélectionner un client</option>' +
                this.data.clients.map(c => 
                    `<option value="${c.id}">${c.fullName} (${c.phoneNumber})</option>`
                ).join('');
        }
    },
    
    setupEventListeners: function() {
        window.filtrerEtage = (valeur) => this.filtrerEtage(valeur);
        window.filtrerEmplacement = (valeur) => this.filtrerEmplacement(valeur);
        
        document.getElementById('addSpotForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveNewSpot();
        });
        
        document.getElementById('assignForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.assignVehicle();
        });
    },
    
    filtrerEtage: function(valeur) {
        const zones = document.querySelectorAll(".zone");
        zones.forEach((zone) => {
            if (valeur === "tous") {
                zone.style.display = "flex";
            } else if (zone.dataset.etage === valeur) {
                zone.style.display = "flex";
            } else {
                zone.style.display = "none";
            }
        });
    },
    
    filtrerEmplacement: function(valeur) {
        const stalls = document.querySelectorAll(".stall");
        stalls.forEach((stall) => {
            stall.style.opacity = "1";
            stall.style.outline = "none";
        });
        
        if (valeur === "tous") return;
        
        stalls.forEach((stall) => {
            const status = stall.classList.contains('free') ? 'libre' :
                          stall.classList.contains('occupied') ? 'occupe' :
                          stall.classList.contains('reserved') ? 'reserve' : '';
            
            let correspond = false;
            if (valeur === "libre" && status === 'libre') correspond = true;
            if (valeur === "occupe" && status === 'occupe') correspond = true;
            if (valeur === "reserve" && status === 'reserve') correspond = true;
            
            if (!correspond) {
                stall.style.opacity = "0.2";
            } else {
                stall.style.outline = "2px solid #8dc63f";
            }
        });
    },
    
    showSpotDetails: async function(spotId) {
        const spot = this.data.parkingSpaces.find(s => s.id === spotId);
        if (!spot) {
            App.showError('Place non trouvée');
            return;
        }
        
        const modal = document.getElementById('spotModal');
        const details = document.getElementById('spotDetails');
        
        let actions = '';
        if (spot.status === 'free') {
            actions = `
                <div class="form-actions">
                    <button class="btn-success" onclick="ParkingPage.openAssignModal(${spot.id})">
                        <i class="fas fa-car"></i> Assigner véhicule
                    </button>
                    <button class="btn-outline" onclick="ParkingPage.closeSpotModal()">
                        <i class="fas fa-times"></i> Fermer
                    </button>
                </div>
            `;
        } else if (spot.status === 'occupied') {
            actions = `
                <div class="form-actions">
                    <button class="btn-warning" style="background: #ffc107; color: #212529;" onclick="ParkingPage.releaseSpot(${spot.id})">
                        <i class="fas fa-undo"></i> Libérer place
                    </button>
                    <button class="btn-outline" onclick="ParkingPage.closeSpotModal()">
                        <i class="fas fa-times"></i> Fermer
                    </button>
                </div>
            `;
        } else {
            actions = `
                <div class="form-actions">
                    <button class="btn-outline" onclick="ParkingPage.closeSpotModal()">
                        <i class="fas fa-times"></i> Fermer
                    </button>
                </div>
            `;
        }
        
        details.innerHTML = `
            <div class="details-grid">
                <div class="detail-section">
                    <h4><i class="fas fa-info-circle"></i> Informations place</h4>
                    <div class="detail-row">
                        <span class="detail-label">Numéro:</span>
                        <span class="detail-value"><strong>${spot.spaceNumber}</strong></span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Étage:</span>
                        <span class="detail-value">${spot.floorNumber === 0 ? 'RDC' : `Étage ${spot.floorNumber}`}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Zone:</span>
                        <span class="detail-value">Zone ${spot.section}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Statut:</span>
                        <span class="detail-value">
                            ${spot.status === 'free' ? '<i class="fas fa-circle" style="color: #28a745;"></i> Libre' : 
                              spot.status === 'occupied' ? '<i class="fas fa-circle" style="color: #dc3545;"></i> Occupé' : 
                              '<i class="fas fa-circle" style="color: #ffc107;"></i> Réservé'}
                        </span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Tarif horaire:</span>
                        <span class="detail-value">${App.formatCFA(spot.hourlyRate)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Accessible:</span>
                        <span class="detail-value">${spot.isHandiAccessible ? '<i class="fas fa-wheelchair"></i> Oui' : 'Non'}</span>
                    </div>
                </div>
                ${spot.currentVehicle ? `
                    <div class="detail-section">
                        <h4><i class="fas fa-car"></i> Véhicule actuel</h4>
                        <div class="detail-row">
                            <span class="detail-label">Plaque:</span>
                            <span class="detail-value">${spot.currentVehicle.licensePlate}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Marque/Modèle:</span>
                            <span class="detail-value">${spot.currentVehicle.brand} ${spot.currentVehicle.model}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Couleur:</span>
                            <span class="detail-value">${spot.currentVehicle.color}</span>
                        </div>
                    </div>
                ` : ''}
            </div>
            ${actions}
        `;
        
        modal.classList.add('active');
    },
    
    closeSpotModal: function() {
        document.getElementById('spotModal').classList.remove('active');
    },
    
    openAssignModal: async function(spotId) {
        await this.loadVehicles();
        await this.loadClients();
        this.populateSelects();
        
        document.getElementById('assignSpotId').value = spotId;
        document.getElementById('assignVehicleModal').classList.add('active');
        this.closeSpotModal();
    },
    
    closeAssignModal: function() {
        document.getElementById('assignVehicleModal').classList.remove('active');
        document.getElementById('assignForm').reset();
    },
    
    assignVehicle: async function() {
        const spotId = document.getElementById('assignSpotId').value;
        const vehicleId = document.getElementById('vehicleSelect').value;
        
        if (!vehicleId) {
            App.showError('Veuillez sélectionner un véhicule');
            return;
        }
        
        const spot = this.data.parkingSpaces.find(s => s.id == spotId);
        const vehicle = this.data.vehicles.find(v => v.id == vehicleId);
        
        if (!spot || !vehicle) {
            App.showError('Place ou véhicule non trouvé');
            return;
        }
        
        try {
            const updateData = {
                ...spot,
                status: 'occupied',
                currentVehicle: vehicle,
                lastUpdated: new Date()
            };
            
            const result = await api.updateParkingSpace(spot.id, updateData);
            
            if (result.success) {
                spot.status = 'occupied';
                spot.currentVehicle = vehicle;
                spot.lastUpdated = new Date();
                
                App.showSuccess(`Véhicule ${vehicle.licensePlate} assigné à la place ${spot.spaceNumber}`);
                this.closeAssignModal();
                this.renderParkingGrid();
            } else {
                App.showError(result.error || 'Erreur lors de l\'assignation');
            }
        } catch (error) {
            App.showError('Erreur lors de l\'assignation');
        }
    },
    
    releaseSpot: async function(spotId) {
        if (!confirm('Libérer cette place ?')) return;
        
        const spot = this.data.parkingSpaces.find(s => s.id === spotId);
        if (!spot) return;
        
        try {
            const updateData = { ...spot, status: 'free', currentVehicle: null, lastUpdated: new Date() };
            const result = await api.updateParkingSpace(spot.id, updateData);
            
            if (result.success) {
                spot.status = 'free';
                spot.currentVehicle = null;
                spot.lastUpdated = new Date();
                
                App.showSuccess(`Place ${spot.spaceNumber} libérée`);
                this.closeSpotModal();
                this.renderParkingGrid();
            } else {
                App.showError(result.error || 'Erreur lors de la libération');
            }
        } catch (error) {
            App.showError('Erreur lors de la libération');
        }
    },
    
    openAddSpotModal: function() {
        document.getElementById('addSpotForm').reset();
        document.getElementById('addSpotModal').classList.add('active');
    },
    
    closeAddSpotModal: function() {
        document.getElementById('addSpotModal').classList.remove('active');
    },
    
    saveNewSpot: async function() {
        const spotData = {
            spaceNumber: document.getElementById('spaceNumber').value,
            floorNumber: parseInt(document.getElementById('floorNumber').value),
            section: document.getElementById('section').value,
            isHandiAccessible: document.getElementById('isHandiAccessible').checked,
            hourlyRate: parseFloat(document.getElementById('hourlyRate').value),
            latitude: 0,
            longitude: 0,
            status: 'free'
        };
        
        if (!spotData.spaceNumber) {
            App.showError('Veuillez saisir un numéro de place');
            return;
        }
        
        try {
            const result = await api.createParkingSpace(spotData);
            if (result.success) {
                App.showSuccess(`Place ${spotData.spaceNumber} ajoutée`);
                this.closeAddSpotModal();
                await this.loadData();
            } else {
                App.showError(result.error || 'Erreur lors de la création');
            }
        } catch (error) {
            App.showError('Erreur lors de la création');
        }
    },
    
    exportMap: function() {
        App.showSuccess('Export de la carte en cours...');
    },
    
    refreshData: function() {
        this.loadData();
    },
    
    startRealTimeUpdates: function() {
        this.updateInterval = setInterval(() => {
            this.loadParkingSpaces().then(() => {
                this.renderParkingGrid();
                this.updateStats();
                this.updateTime();
            }).catch(err => console.error('Erreur mise à jour:', err));
        }, 30000);
    },
    
    stopRealTimeUpdates: function() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    },
    
    updateTime: function() {
        const timeEl = document.getElementById('updateTime');
        if (timeEl) {
            const now = new Date();
            timeEl.innerHTML = `<i class="fas fa-clock"></i> Mis à jour à ${now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
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
                if (userRoleEl) userRoleEl.innerHTML = '<i class="fas fa-user-circle"></i> ' + (user.role || 'Administrateur principal');
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
    ParkingPage.init();
});

window.addEventListener('beforeunload', () => {
    ParkingPage.stopRealTimeUpdates();
});

window.ParkingPage = ParkingPage;