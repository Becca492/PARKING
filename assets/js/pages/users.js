// assets/js/pages/users.js
const UsersPage = {
    data: {
        users: [],
        currentView: 'grid'
    },
    
    filters: {
        search: '',
        role: 'all',
        status: 'all',
        sort: 'name'
    },
    
    init: function() {
        this.loadData();
        this.setupEventListeners();
        this.updateUserName();
    },
    
    loadData: async function() {
        try {
            const result = await api.getUsers();
            if (result.success) {
                this.data.users = result.data || [];
                this.renderView();
                this.updateStats();
            }
        } catch (error) {
            console.error('Erreur chargement utilisateurs:', error);
            App.showError('Impossible de charger les utilisateurs');
            this.loadMockData(); // Fallback
        }
    },
    
    loadMockData: function() {
        // Données de secours pour le développement
        this.data.users = [
            {
                id: 1,
                fullName: 'Rebecca KANGBE',
                email: 'rebecca.kangbe@email.com',
                phoneNumber: '+225 07 07 07 07',
                role: 'Administrateur',
                isActive: true,
                driverLicense: 'LIC-123456',
                address: 'Cocody, Abidjan',
                createdOn: '2024-01-15T10:30:00',
                lastLoginDate: '2024-03-18T08:45:00',
                reservationsCount: 156
            },
            {
                id: 2,
                fullName: 'Jean Kouassi',
                email: 'jean.kouassi@email.com',
                phoneNumber: '+225 01 02 03 04',
                role: 'Utilisateur',
                isActive: true,
                driverLicense: 'LIC-789012',
                address: 'Plateau, Abidjan',
                createdOn: '2024-02-01T14:20:00',
                lastLoginDate: '2024-03-17T16:30:00',
                reservationsCount: 23
            },
            {
                id: 3,
                fullName: 'Marie Konan',
                email: 'marie.konan@email.com',
                phoneNumber: '+225 05 06 07 08',
                role: 'Utilisateur',
                isActive: false,
                driverLicense: 'LIC-345678',
                address: 'Yopougon, Abidjan',
                createdOn: '2024-01-20T09:15:00',
                lastLoginDate: '2024-03-10T11:20:00',
                reservationsCount: 45
            },
            {
                id: 4,
                fullName: 'Paul Yao',
                email: 'paul.yao@email.com',
                phoneNumber: '+225 09 08 07 06',
                role: 'Administrateur',
                isActive: true,
                driverLicense: 'LIC-901234',
                address: 'Treichville, Abidjan',
                createdOn: '2023-12-05T13:40:00',
                lastLoginDate: '2024-03-18T09:15:00',
                reservationsCount: 89
            }
        ];
        this.renderView();
        this.updateStats();
    },
    
    renderView: function() {
        const container = document.getElementById('usersContainer');
        if (!container) return;
        
        if (this.currentView === 'grid') {
            container.innerHTML = this.renderGridView();
        } else {
            container.innerHTML = this.renderListView();
        }
    },
    
    renderGridView: function() {
        const filteredUsers = this.getFilteredUsers();
        
        if (filteredUsers.length === 0) {
            return '<div class="text-center"><i class="fas fa-users" style="font-size: 48px; opacity: 0.3; margin-bottom: 20px;"></i><br>Aucun utilisateur trouvé</div>';
        }
        
        return `
            <div class="users-grid">
                ${filteredUsers.map(user => `
                    <div class="user-card ${user.role === 'Administrateur' ? 'admin' : 'user'}">
                        <div class="user-status">
                            <span class="user-badge ${user.isActive ? 'badge-active' : 'badge-inactive'}">
                                <i class="fas ${user.isActive ? 'fa-circle' : 'fa-circle'}"></i>
                                ${user.isActive ? ' Actif' : ' Inactif'}
                            </span>
                        </div>
                        
                        <div class="user-avatar">
                            ${this.getInitials(user.fullName)}
                        </div>
                        
                        <div class="user-info">
                            <h3>${user.fullName}</h3>
                            <div class="user-email">
                                <i class="fas fa-envelope"></i> ${user.email}
                            </div>
                            <div class="user-phone">
                                <i class="fas fa-phone"></i> ${user.phoneNumber}
                            </div>
                            
                            <div class="user-badges">
                                <span class="user-badge ${user.role === 'Administrateur' ? 'badge-admin' : 'badge-user'}">
                                    <i class="fas ${user.role === 'Administrateur' ? 'fa-user-tie' : 'fa-user'}"></i>
                                    ${user.role}
                                </span>
                                <span class="user-badge-icon">
                                    <i class="fas fa-calendar-check"></i> ${user.reservationsCount || 0}
                                </span>
                            </div>
                            
                            <div class="last-login">
                                <i class="fas fa-clock"></i>
                                Dernière connexion: ${this.formatLastLogin(user.lastLoginDate)}
                            </div>
                        </div>
                        
                        <div class="user-actions">
                            <button class="btn-icon" onclick="UsersPage.viewUser(${user.id})">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn-icon" onclick="UsersPage.editUser(${user.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon" onclick="UsersPage.toggleUserStatus(${user.id})">
                                <i class="fas ${user.isActive ? 'fa-lock' : 'fa-lock-open'}"></i>
                            </button>
                            <button class="btn-icon" onclick="UsersPage.resetPassword(${user.id})">
                                <i class="fas fa-key"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },
    
    renderListView: function() {
        const filteredUsers = this.getFilteredUsers();
        
        if (filteredUsers.length === 0) {
            return '<div class="text-center">Aucun utilisateur trouvé</div>';
        }
        
        return `
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th><i class="fas fa-user"></i> Utilisateur</th>
                            <th><i class="fas fa-phone"></i> Contact</th>
                            <th><i class="fas fa-user-tag"></i> Rôle</th>
                            <th><i class="fas fa-toggle-on"></i> Statut</th>
                            <th><i class="fas fa-calendar-check"></i> Réservations</th>
                            <th><i class="fas fa-clock"></i> Dernière connexion</th>
                            <th><i class="fas fa-cog"></i> Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredUsers.map(user => `
                            <tr>
                                <td>
                                    <strong>${user.fullName}</strong><br>
                                    <small><i class="fas fa-envelope"></i> ${user.email}</small>
                                </td>
                                <td><i class="fas fa-phone"></i> ${user.phoneNumber}</td>
                                <td>
                                    <span class="user-badge ${user.role === 'Administrateur' ? 'badge-admin' : 'badge-user'}">
                                        <i class="fas ${user.role === 'Administrateur' ? 'fa-user-tie' : 'fa-user'}"></i>
                                        ${user.role}
                                    </span>
                                </td>
                                <td>
                                    <span class="status-badge ${user.isActive ? 'status-active' : 'status-inactive'}">
                                        <i class="fas ${user.isActive ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                                        ${user.isActive ? 'Actif' : 'Inactif'}
                                    </span>
                                </td>
                                <td><i class="fas fa-calendar-check"></i> ${user.reservationsCount || 0}</td>
                                <td><i class="fas fa-clock"></i> ${this.formatLastLogin(user.lastLoginDate)}</td>
                                <td class="table-actions">
                                    <button class="btn-icon" onclick="UsersPage.viewUser(${user.id})">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button class="btn-icon" onclick="UsersPage.editUser(${user.id})">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn-icon" onclick="UsersPage.toggleUserStatus(${user.id})">
                                        <i class="fas ${user.isActive ? 'fa-lock' : 'fa-lock-open'}"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },
    
    getFilteredUsers: function() {
        return this.data.users.filter(user => {
            let match = true;
            
            if (this.filters.search) {
                const searchLower = this.filters.search.toLowerCase();
                match = match && (
                    (user.fullName && user.fullName.toLowerCase().includes(searchLower)) ||
                    (user.email && user.email.toLowerCase().includes(searchLower)) ||
                    (user.phoneNumber && user.phoneNumber.includes(this.filters.search))
                );
            }
            
            if (this.filters.role !== 'all') {
                match = match && user.role === this.filters.role;
            }
            
            if (this.filters.status !== 'all') {
                match = match && (
                    (this.filters.status === 'active' && user.isActive) ||
                    (this.filters.status === 'inactive' && !user.isActive)
                );
            }
            
            return match;
        }).sort((a, b) => {
            if (this.filters.sort === 'name') {
                return (a.fullName || '').localeCompare(b.fullName || '');
            } else if (this.filters.sort === 'date') {
                return new Date(b.createdOn || 0) - new Date(a.createdOn || 0);
            } else {
                return (b.reservationsCount || 0) - (a.reservationsCount || 0);
            }
        });
    },
    
    updateStats: function() {
        const total = this.data.users.length;
        const admins = this.data.users.filter(u => u.role === 'Administrateur').length;
        const active = this.data.users.filter(u => u.isActive).length;
        const newUsers = this.data.users.filter(u => {
            if (!u.createdOn) return false;
            const date = new Date(u.createdOn);
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return date > monthAgo;
        }).length;
        
        document.getElementById('totalUsers').textContent = total;
        document.getElementById('totalAdmins').textContent = admins;
        document.getElementById('activeUsers').textContent = active;
        document.getElementById('newUsers').textContent = newUsers;
    },
    
    getInitials: function(name) {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    },
    
    formatLastLogin: function(dateStr) {
        if (!dateStr) return 'Jamais';
        const date = new Date(dateStr);
        const now = new Date();
        const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
        
        if (diff === 0) return "Aujourd'hui";
        if (diff === 1) return 'Hier';
        if (diff < 7) return `Il y a ${diff} jours`;
        return date.toLocaleDateString('fr-FR');
    },
    
    setupEventListeners: function() {
        document.getElementById('searchInput')?.addEventListener('input', (e) => {
            this.filters.search = e.target.value;
            this.renderView();
        });
        
        document.getElementById('roleFilter')?.addEventListener('change', (e) => {
            this.filters.role = e.target.value;
            this.renderView();
        });
        
        document.getElementById('statusFilter')?.addEventListener('change', (e) => {
            this.filters.status = e.target.value;
            this.renderView();
        });
        
        document.getElementById('sortFilter')?.addEventListener('change', (e) => {
            this.filters.sort = e.target.value;
            this.renderView();
        });
        
        document.getElementById('userForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveUser();
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
    
    openModal: function(user = null) {
        const modal = document.getElementById('userModal');
        const passwordField = document.getElementById('passwordField');
        const passwordSection = document.getElementById('passwordSection');
        
        if (user) {
            document.getElementById('modalTitle').innerHTML = '<i class="fas fa-user-edit"></i> Modifier utilisateur';
            document.getElementById('userId').value = user.id;
            document.getElementById('fullName').value = user.fullName || '';
            document.getElementById('email').value = user.email || '';
            document.getElementById('phoneNumber').value = user.phoneNumber || '';
            document.getElementById('role').value = user.role || 'Utilisateur';
            document.getElementById('isActive').value = user.isActive ? '1' : '0';
            document.getElementById('driverLicense').value = user.driverLicense || '';
            document.getElementById('address').value = user.address || '';
            
            passwordField.style.display = 'none';
            passwordSection.style.display = 'block';
            document.getElementById('password').required = false;
        } else {
            document.getElementById('userForm').reset();
            document.getElementById('modalTitle').innerHTML = '<i class="fas fa-user-plus"></i> Nouvel utilisateur';
            document.getElementById('userId').value = '';
            
            passwordField.style.display = 'block';
            passwordSection.style.display = 'none';
            document.getElementById('password').required = true;
        }
        
        modal.classList.add('active');
    },
    
    closeModal: function() {
        document.getElementById('userModal').classList.remove('active');
    },
    
    viewUser: async function(id) {
        try {
            const result = await api.getUserById(id);
            if (result.success) {
                const user = result.data;
                const modal = document.getElementById('userDetailsModal');
                const details = document.getElementById('userDetails');
                
                details.innerHTML = `
                    <div class="user-details">
                        <div class="detail-row">
                            <div class="detail-label"><i class="fas fa-user"></i> Nom complet</div>
                            <div class="detail-value"><strong>${user.fullName || 'N/A'}</strong></div>
                        </div>
                        <div class="detail-row">
                            <div class="detail-label"><i class="fas fa-envelope"></i> Email</div>
                            <div class="detail-value">${user.email || 'N/A'}</div>
                        </div>
                        <div class="detail-row">
                            <div class="detail-label"><i class="fas fa-phone"></i> Téléphone</div>
                            <div class="detail-value">${user.phoneNumber || 'N/A'}</div>
                        </div>
                        <div class="detail-row">
                            <div class="detail-label"><i class="fas fa-user-tag"></i> Rôle</div>
                            <div class="detail-value">
                                <span class="user-badge ${user.role === 'Administrateur' ? 'badge-admin' : 'badge-user'}">
                                    <i class="fas ${user.role === 'Administrateur' ? 'fa-user-tie' : 'fa-user'}"></i>
                                    ${user.role || 'Utilisateur'}
                                </span>
                            </div>
                        </div>
                        <div class="detail-row">
                            <div class="detail-label"><i class="fas fa-toggle-on"></i> Statut</div>
                            <div class="detail-value">
                                <span class="status-badge ${user.isActive ? 'status-active' : 'status-inactive'}">
                                    <i class="fas ${user.isActive ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                                    ${user.isActive ? 'Actif' : 'Inactif'}
                                </span>
                            </div>
                        </div>
                        <div class="detail-row">
                            <div class="detail-label"><i class="fas fa-id-card"></i> Permis</div>
                            <div class="detail-value">${user.driverLicense || 'Non renseigné'}</div>
                        </div>
                        <div class="detail-row">
                            <div class="detail-label"><i class="fas fa-map-marker-alt"></i> Adresse</div>
                            <div class="detail-value">${user.address || 'Non renseignée'}</div>
                        </div>
                        <div class="detail-row">
                            <div class="detail-label"><i class="fas fa-calendar-plus"></i> Inscription</div>
                            <div class="detail-value">${App.formatDate(user.createdOn)}</div>
                        </div>
                        <div class="detail-row">
                            <div class="detail-label"><i class="fas fa-clock"></i> Dernière connexion</div>
                            <div class="detail-value">${this.formatLastLogin(user.lastLoginDate)}</div>
                        </div>
                        <div class="detail-row">
                            <div class="detail-label"><i class="fas fa-calendar-check"></i> Réservations</div>
                            <div class="detail-value">${user.reservations?.length || 0} réservations</div>
                        </div>
                    </div>
                    <div class="form-actions">
                        <button class="btn-secondary" onclick="UsersPage.closeDetailsModal()">
                            <i class="fas fa-times"></i> Fermer
                        </button>
                        <button class="btn-primary" onclick="UsersPage.editUser(${user.id})">
                            <i class="fas fa-edit"></i> Modifier
                        </button>
                    </div>
                `;
                
                modal.classList.add('active');
            }
        } catch (error) {
            App.showError('Erreur lors du chargement des détails');
        }
    },
    
    closeDetailsModal: function() {
        document.getElementById('userDetailsModal').classList.remove('active');
    },
    
    editUser: function(id) {
        const user = this.data.users.find(u => u.id === id);
        if (user) {
            this.closeDetailsModal();
            this.openModal(user);
        }
    },
    
    toggleUserStatus: async function(id) {
        const user = this.data.users.find(u => u.id === id);
        if (!user) return;
        
        const action = user.isActive ? 'désactiver' : 'activer';
        if (confirm(`Voulez-vous ${action} cet utilisateur ?`)) {
            try {
                const updatedUser = { 
                    ...user, 
                    isActive: !user.isActive 
                };
                
                const result = await api.updateUser(id, updatedUser);
                
                if (result.success) {
                    user.isActive = !user.isActive;
                    App.showSuccess(`Utilisateur ${action} avec succès`);
                    this.renderView();
                    this.updateStats();
                }
            } catch (error) {
                App.showError(`Erreur lors de ${action} de l'utilisateur`);
            }
        }
    },
    
    resetPassword: function(id) {
        if (confirm('Envoyer un lien de réinitialisation de mot de passe ?')) {
            // À implémenter avec ton API
            App.showSuccess('Email de réinitialisation envoyé');
        }
    },
    
    saveUser: async function() {
        const id = document.getElementById('userId').value;
        const userData = {
            fullName: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            phoneNumber: document.getElementById('phoneNumber').value,
            role: document.getElementById('role').value,
            isActive: document.getElementById('isActive').value === '1',
            driverLicense: document.getElementById('driverLicense').value,
            address: document.getElementById('address').value
        };
        
        try {
            let result;
            
            if (id) {
                // Modification
                result = await api.updateUser(parseInt(id), userData);
                if (result.success) {
                    const index = this.data.users.findIndex(u => u.id == id);
                    if (index !== -1) {
                        this.data.users[index] = { ...this.data.users[index], ...userData };
                    }
                    App.showSuccess('Utilisateur modifié avec succès');
                }
            } else {
                // Nouvel utilisateur
                const password = document.getElementById('password').value;
                if (!password || password.length < 8) {
                    App.showError('Le mot de passe doit contenir au moins 8 caractères');
                    return;
                }
                
                // Ajouter le mot de passe aux données
                const newUserData = { ...userData, password };
                result = await api.createUser(newUserData);
                
                if (result.success) {
                    this.data.users.push(result.data);
                    App.showSuccess('Utilisateur créé avec succès');
                }
            }
            
            this.closeModal();
            this.renderView();
            this.updateStats();
        } catch (error) {
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
    UsersPage.init();
});

window.UsersPage = UsersPage;