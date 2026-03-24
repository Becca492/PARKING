// assets/js/auth.js - Version simplifiée
document.addEventListener('DOMContentLoaded', function() {
    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem('token');
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';
    
    // Pages publiques (accessibles sans connexion)
    const publicPages = ['index.html', ''];
    
    // Redirection si non connecté
    if (!token && !publicPages.includes(currentPage)) {
        window.location.href = 'index.html';
        return;
    }
    
    // Redirection si déjà connecté vers dashboard
    if (token && currentPage === 'index.html') {
        window.location.href = 'dashbord.html';
        return;
    }
    
    // Afficher le nom de l'utilisateur
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            const nameElements = document.querySelectorAll('.user-name strong');
            nameElements.forEach(el => {
                el.textContent = user.fullName || 'Rebecca KANGBE';
            });
            
            const roleElements = document.querySelectorAll('.user-name span');
            roleElements.forEach(el => {
                if (el.textContent.includes('👤')) {
                    el.textContent = '👤 ' + (user.role || 'Administrateur');
                }
            });
        } catch (e) {
            console.error('Erreur parsing user:', e);
        }
    }
    
    // Gestion de la déconnexion
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = 'index.html';
            }
        });
    }
});