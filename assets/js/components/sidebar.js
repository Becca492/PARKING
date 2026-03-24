// assets/js/components/sidebar.js
document.addEventListener('DOMContentLoaded', function() {
    const sidebarContainer = document.getElementById('sidebar-container');
    
    if (sidebarContainer) {
        fetch('../components/sidebar.html')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Sidebar non trouvée');
                }
                return response.text();
            })
            .then(html => {
                sidebarContainer.innerHTML = html;
                
                // Mettre en surbrillance la page active
                const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
                const activeLink = document.querySelector(`a[data-page="${currentPage}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
                
                // Gestionnaire de déconnexion
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
            })
            .catch(error => {
                console.error('Erreur chargement sidebar:', error);
                // Fallback : sidebar minimale
                sidebarContainer.innerHTML = `
                    <aside class="sidebar">
                        <div class="sidebar-logo">
                            <img src="../assets/img/2.png" alt="Logo">
                        </div>
                        <a href="dashbord.html" class="nav-item">Dashboard</a>
                        <a href="park.html" class="nav-item">Parking</a>
                    </aside>
                `;
            });
    }
});