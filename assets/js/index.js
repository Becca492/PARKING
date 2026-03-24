// assets/js/index.js
console.log('Index JS chargé');

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const phone = document.getElementById('phoneNumber').value;
            const password = document.getElementById('password').value;
            const errorDiv = document.getElementById('errorMessage');
            
            if (phone && password) {
                localStorage.setItem('token', 'demo-token-123');
                localStorage.setItem('user', JSON.stringify({
                    fullName: 'Rebecca KANGBE',
                    role: 'Administrateur',
                    phone: phone
                }));
                
                window.location.href = 'dashboard.html';
            } else {
                errorDiv.textContent = 'Veuillez remplir tous les champs';
                errorDiv.style.display = 'block';
            }
        });
    }
});