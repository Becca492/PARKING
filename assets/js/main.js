// js/main.js
const App = {
    config: {
        apiUrl: 'http://localhost:7001/api',
        debug: true
    },
    
    user: null,
    token: null,
    
    init: function() {
        this.loadUser();
        this.checkAuth();
        this.initEventListeners();
    },
    
    loadUser: function() {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        this.token = token;
        
        if (userStr) {
            try {
                this.user = JSON.parse(userStr);
            } catch (e) {
                console.error('Erreur parsing user:', e);
            }
        }
    },
    
    checkAuth: function() {
        const currentPath = window.location.pathname;
        const currentPage = currentPath.split('/').pop() || 'index.html';
        const publicPages = ['index.html', ''];
        
        if (!this.token && !publicPages.includes(currentPage)) {
            window.location.href = 'index.html';
            return false;
        }
        
        if (this.token && currentPage === 'index.html') {
            window.location.href = 'dashboard.html';
            return false;
        }
        
        return true;
    },
    
    initEventListeners: function() {
        // Délégation d'événements pour les boutons de déconnexion
        document.addEventListener('click', (e) => {
            if (e.target.closest('#logoutBtn')) {
                e.preventDefault();
                this.logout();
            }
        });
    },
    
    logout: function() {
        if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'index.html';
        }
    },
    
    formatCFA: function(amount) {
        if (!amount && amount !== 0) return '0 FCFA';
        return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + ' FCFA';
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
    
    showSuccess: function(message) {
        alert(message); // À remplacer par un toast plus tard
    },
    
    showError: function(message) {
        alert('Erreur: ' + message);
    }
};

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Rendre App accessible globalement
window.App = App;