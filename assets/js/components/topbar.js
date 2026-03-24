// js/components/topbar.js
const Topbar = {
    container: null,
    dropdownVisible: false,
    
    init: function() {
        this.container = document.getElementById('topbar-container');
        if (!this.container) return;
        
        this.load();
        this.setupEventListeners();
    },
    
    load: function() {
        fetch('../components/topbar.html')
            .then(response => response.text())
            .then(html => {
                this.container.innerHTML = html;
                this.updateUserInfo();
                this.updatePageTitle();
            })
            .catch(error => {
                console.error('Erreur chargement topbar:', error);
                this.loadFallback();
            });
    },
    
    loadFallback: function() {
        this.container.innerHTML = `
            <div class="topbar">
                <h1>${this.getPageTitle()}</h1>
                <div class="search">🔍 Recherche</div>
                <div class="user-info">
                    <div class="user-name">
                        <strong>${App.user?.fullName || 'Rebecca KANGBE'}</strong>
                        <span>👤 Administrateur</span>
                    </div>
                    <div class="avatar"></div>
                </div>
            </div>
        `;
    },
    
    getPageTitle: function() {
        const page = window.location.pathname.split('/').pop().replace('.html', '');
        const titles = {
            'dashboard': 'Tableau de bord',
            'park': 'Parking',
            'reservations': 'Réservations',
            'users': 'Utilisateurs',
            'vehicles': 'Véhicules',
            'promotions': 'Promotions',
            'payments': 'Paiements',
            'statistiques': 'Statistiques',
            'revenus': 'Revenus'
        };
        return titles[page] || 'Parking Management';
    },
    
    updatePageTitle: function() {
        const titleEl = document.getElementById('pageTitle');
        if (titleEl) {
            titleEl.textContent = this.getPageTitle();
        }
    },
    
    updateUserInfo: function() {
        if (App.user) {
            const userNameEl = document.getElementById('userName');
            const userRoleEl = document.getElementById('userRole');
            
            if (userNameEl) userNameEl.textContent = App.user.fullName;
            if (userRoleEl) userRoleEl.textContent = '👤 ' + (App.user.role || 'Administrateur');
        }
    },
    
    setupEventListeners: function() {
        // Toggle menu déroulant
        const userMenuTrigger = document.getElementById('userMenuTrigger');
        const userDropdown = document.getElementById('userDropdown');
        
        if (userMenuTrigger && userDropdown) {
            userMenuTrigger.addEventListener('click', (e) => {
                e.stopPropagation();
                this.dropdownVisible = !this.dropdownVisible;
                userDropdown.classList.toggle('show', this.dropdownVisible);
            });
            
            // Fermer en cliquant ailleurs
            document.addEventListener('click', (e) => {
                if (!userMenuTrigger.contains(e.target)) {
                    userDropdown.classList.remove('show');
                    this.dropdownVisible = false;
                }
            });
        }
        
        // Recherche globale
        const searchInput = document.getElementById('globalSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }
    },
    
    handleSearch: function(query) {
        // À implémenter selon la page
        console.log('Recherche:', query);
        // Déclencher un événement personnalisé
        const event = new CustomEvent('globalSearch', { detail: query });
        document.dispatchEvent(event);
    }
};

// Initialiser la topbar après le chargement
document.addEventListener('DOMContentLoaded', () => {
    Topbar.init();
});