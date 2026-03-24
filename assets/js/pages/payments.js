// assets/js/pages/payments.js
const PaymentsPage = {
    data: {
        payments: [],
        reservations: [],
        users: [],
        currentPage: 1,
        itemsPerPage: 10,
        totalPages: 1
    },
    
    filters: {
        period: 'month',
        status: 'all',
        method: 'all',
        search: ''
    },
    
    init: function() {
        this.loadData();
        this.setupEventListeners();
        this.updateUserName();
    },
    
    loadData: async function() {
        try {
            await this.loadUsers();
            await this.loadReservations();
            await this.loadPayments();
            this.renderTable();
            this.updateStats();
        } catch (error) {
            console.error('❌ Erreur chargement paiements:', error);
            App.showError('Impossible de charger les paiements');
            this.loadMockData();
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
    
    loadReservations: async function() {
        try {
            const result = await api.getReservations();
            if (result.success) {
                this.data.reservations = result.data || [];
            }
        } catch (error) {
            console.error('❌ Erreur chargement réservations:', error);
        }
    },
    
    loadPayments: async function() {
        try {
            const result = await api.getPayments();
            console.log('📦 Paiements reçus:', result);
            
            if (result.success) {
                this.data.payments = result.data || [];
                this.enrichPaymentsData();
                this.totalPages = Math.ceil(this.data.payments.length / this.itemsPerPage);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('❌ Erreur chargement paiements:', error);
            throw error;
        }
    },
    
    enrichPaymentsData: function() {
        this.data.payments.forEach(payment => {
            const reservation = this.data.reservations.find(r => r.id === payment.reservationId);
            const user = reservation ? this.data.users.find(u => u.id === reservation.userId) : null;
            
            payment.client = user ? user.fullName : 'Client inconnu';
            payment.reservationNumber = reservation ? reservation.confirmationNumber : 'N/A';
        });
        
        console.log('📦 Paiements après enrichissement:', this.data.payments);
        this.data.payments.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));
    },
    
    loadMockData: function() {
        console.log('📦 Chargement données mock paiements');
        const clients = ['Jean Kouassi', 'Marie Konan', 'Paul Yao', 'Sophie N\'Guessan', 'Marc Koffi'];
        const methods = ['cash', 'card', 'mobile'];
        const statuses = ['completed', 'pending', 'failed', 'refunded'];
        
        this.data.payments = [];
        
        for (let i = 1; i <= 50; i++) {
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 30));
            date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
            
            const amount = Math.floor(Math.random() * 50000) + 5000;
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            
            this.data.payments.push({
                id: i,
                transactionId: `TXN-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(i).padStart(5, '0')}`,
                paymentDate: date.toISOString(),
                client: clients[Math.floor(Math.random() * clients.length)],
                reservationNumber: `RES-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(i).padStart(3, '0')}`,
                amount: amount,
                paymentMethod: methods[Math.floor(Math.random() * methods.length)],
                paymentStatus: status,
                cardLast4: status === 'completed' ? String(1000 + Math.floor(Math.random() * 9000)) : null,
                mobileOperator: Math.random() > 0.5 ? 'Orange' : 'MTN',
                failureReason: status === 'failed' ? 'Fonds insuffisants' : null,
                refundReason: status === 'refunded' ? 'Annulation client' : null
            });
        }
        
        this.data.payments.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));
        this.totalPages = Math.ceil(this.data.payments.length / this.itemsPerPage);
        this.renderTable();
        this.updateStats();
    },
    
   renderTable: function() {
    const tbody = document.getElementById('paymentsTableBody');
    if (!tbody) return;
    
    const filteredPayments = this.getFilteredPayments();
    console.log('📊 filteredPayments:', filteredPayments);
    
    if (filteredPayments.length === 0) {
        tbody.innerHTML = '的人<td colspan="9" class="text-center"><i class="fas fa-credit-card"></i><br>Aucun paiement trouvé</td>';
        return;
    }
    
    tbody.innerHTML = filteredPayments.map(payment => {
        const statusClass = this.getStatusClass(payment.paymentStatus);
        const statusText = this.getStatusText(payment.paymentStatus);
        const methodIcon = this.getMethodIcon(payment.paymentMethod);
        const methodName = this.getMethodName(payment.paymentMethod);
        
        return `
             <tr>
                 <td>#${payment.id}</td>
                 <td>${this.formatDate(payment.paymentDate)}</td>
                 <td>${payment.client || 'N/A'}</td>
                 <td>${payment.reservationNumber || 'N/A'}</td>
                 <td><strong>${this.formatCFA(payment.amount)}</strong></td>
                 <td class="payment-method">
                     <span class="payment-method-icon">${methodIcon}</span>
                     ${methodName}
                 </td>
                 <td>
                     <span class="status-badge ${statusClass}">
                         ${statusText}
                     </span>
                 </td>
                 <td><small>${payment.transactionId || 'N/A'}</small></td>
                 <td class="table-actions">
                     <button class="btn-icon" onclick="PaymentsPage.viewDetails(${payment.id})">
                         <i class="fas fa-eye"></i>
                     </button>
                     <button class="btn-icon" onclick="PaymentsPage.printReceipt(${payment.id})">
                         <i class="fas fa-print"></i>
                     </button>
                 </td>
             </tr>
        `;
    }).join('');
    
    document.getElementById('pageInfo').textContent = `Total: ${filteredPayments.length} paiement(s)`;
},
    getStatusClass: function(status) {
        const classes = {
            'completed': 'status-completed',
            'pending': 'status-pending',
            'failed': 'status-failed',
            'refunded': 'status-refunded'
        };
        // Si status est un nombre, le convertir en string
        if (typeof status === 'number') {
            const statusMap = {1: 'pending', 2: 'completed', 3: 'failed', 4: 'cancelled', 5: 'refunded'};
            const statusStr = statusMap[status] || 'pending';
            return classes[statusStr] || 'status-pending';
        }
        return classes[status] || 'status-pending';
    },
    
    getStatusText: function(status) {
        const texts = {
            'completed': 'Complété',
            'pending': 'En attente',
            'failed': 'Échoué',
            'refunded': 'Remboursé'
        };
        if (typeof status === 'number') {
            const statusMap = {1: 'pending', 2: 'completed', 3: 'failed', 4: 'cancelled', 5: 'refunded'};
            const statusStr = statusMap[status] || 'pending';
            return texts[statusStr] || status;
        }
        return texts[status] || status;
    },
    
    getMethodIcon: function(method) {
        const icons = {
            'cash': '💵',
            'card': '💳',
            'mobile': '📱',
            1: '💵',
            2: '💳',
            3: '📱'
        };
        return icons[method] || '💰';
    },
    
    getMethodName: function(method) {
        const names = {
            'cash': 'Espèces',
            'card': 'Carte',
            'mobile': 'Mobile Money',
            1: 'Espèces',
            2: 'Carte',
            3: 'Mobile Money'
        };
        return names[method] || method;
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
    
    getFilteredPayments: function() {
    console.log('🔍 Filtres actuels:', this.filters);
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(now);
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    
    const filtered = this.data.payments.filter(payment => {
        let match = true;
        const paymentDate = new Date(payment.paymentDate);
        
        // Filtre période
        if (this.filters.period === 'today') {
            match = match && paymentDate >= today;
        } else if (this.filters.period === 'yesterday') {
            match = match && paymentDate >= yesterday && paymentDate < today;
        } else if (this.filters.period === 'week') {
            match = match && paymentDate >= weekAgo;
        } else if (this.filters.period === 'month') {
            match = match && paymentDate >= monthAgo;
        }
        
        // Filtre statut - CORRECTION ICI
        if (this.filters.status !== 'all') {
            // Convertir le statut numérique en string pour comparaison
            const statusMap = {1: 'pending', 2: 'completed', 3: 'failed', 4: 'cancelled', 5: 'refunded'};
            const paymentStatusStr = statusMap[payment.paymentStatus] || 'pending';
            console.log(`Statut paiement: ${payment.paymentStatus} -> ${paymentStatusStr}, filtre: ${this.filters.status}`);
            match = match && paymentStatusStr === this.filters.status;
        }
        
        // Filtre méthode
        if (this.filters.method !== 'all') {
            const methodMap = {1: 'cash', 2: 'card', 3: 'mobile'};
            const paymentMethodStr = methodMap[payment.paymentMethod] || payment.paymentMethod;
            match = match && paymentMethodStr === this.filters.method;
        }
        
        // Recherche
        if (this.filters.search) {
            const searchLower = this.filters.search.toLowerCase();
            match = match && (
                (payment.client && payment.client.toLowerCase().includes(searchLower)) ||
                (payment.reservationNumber && payment.reservationNumber.toLowerCase().includes(searchLower)) ||
                (payment.transactionId && payment.transactionId.toLowerCase().includes(searchLower))
            );
        }
        
        return match;
    });
    
    console.log('🔍 Résultats filtrés:', filtered);
    return filtered;
},
    updateStats: function() {
        const filtered = this.getFilteredPayments();
        
        const total = filtered.reduce((sum, p) => {
            const isCompleted = p.paymentStatus === 'completed' || p.paymentStatus === 2;
            if (isCompleted) return sum + p.amount;
            return sum;
        }, 0);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayTotal = filtered.filter(p => {
            const date = new Date(p.paymentDate);
            const isCompleted = p.paymentStatus === 'completed' || p.paymentStatus === 2;
            return date >= today && isCompleted;
        }).reduce((sum, p) => sum + p.amount, 0);
        
        const completed = filtered.filter(p => p.paymentStatus === 'completed' || p.paymentStatus === 2).length;
        const total_transactions = filtered.length;
        const successRate = total_transactions > 0 ? Math.round((completed / total_transactions) * 100) : 0;
        
        const avgTicket = completed > 0 ? Math.round(total / completed) : 0;
        
        document.getElementById('totalRevenue').textContent = this.formatCFA(total);
        document.getElementById('todayPayments').textContent = this.formatCFA(todayTotal);
        document.getElementById('successRate').textContent = successRate + '%';
        document.getElementById('averageTicket').textContent = this.formatCFA(avgTicket);
    },
    
    setupEventListeners: function() {
        document.getElementById('periodFilter')?.addEventListener('change', (e) => {
            this.filters.period = e.target.value;
            this.currentPage = 1;
            this.renderTable();
            this.updateStats();
        });
        
        document.getElementById('statusFilter')?.addEventListener('change', (e) => {
            this.filters.status = e.target.value;
            this.currentPage = 1;
            this.renderTable();
            this.updateStats();
        });
        
        document.getElementById('methodFilter')?.addEventListener('change', (e) => {
            this.filters.method = e.target.value;
            this.currentPage = 1;
            this.renderTable();
            this.updateStats();
        });
        
        document.getElementById('searchInput')?.addEventListener('input', (e) => {
            this.filters.search = e.target.value;
            this.currentPage = 1;
            this.renderTable();
            this.updateStats();
        });
        
        document.getElementById('refundForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.processRefund();
        });
        
        document.getElementById('paymentForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.savePayment();
        });
        
        this.setupReservationChangeListener();
    },
    
    setupReservationChangeListener: function() {
        const reservationSelect = document.getElementById('reservationId');
        if (reservationSelect) {
            reservationSelect.addEventListener('change', (e) => {
                const selectedOption = e.target.options[e.target.selectedIndex];
                const amount = selectedOption.getAttribute('data-amount');
                const clientName = selectedOption.getAttribute('data-user');
                
                document.getElementById('amount').value = amount || '';
                document.getElementById('clientName').value = clientName || '';
            });
        }
        
        const methodSelect = document.getElementById('paymentMethod');
        if (methodSelect) {
            methodSelect.addEventListener('change', (e) => {
                const mobileGroup = document.getElementById('mobileOperatorGroup');
                if (mobileGroup) {
                    mobileGroup.style.display = e.target.value === 'mobile' ? 'block' : 'none';
                }
            });
        }
    },
    
    changePage: function(direction) {
        const filteredCount = this.getFilteredPayments().length;
        const totalPages = Math.ceil(filteredCount / this.itemsPerPage);
        
        if (direction === 'prev' && this.currentPage > 1) {
            this.currentPage--;
            this.renderTable();
        } else if (direction === 'next' && this.currentPage < totalPages) {
            this.currentPage++;
            this.renderTable();
        }
    },
    
    openModal: async function() {
        await this.loadReservationsForPayment();
        
        const modal = document.getElementById('paymentModal');
        if (modal) {
            document.getElementById('paymentForm').reset();
            document.getElementById('reservationId').value = '';
            document.getElementById('clientName').value = '';
            document.getElementById('amount').value = '';
            document.getElementById('mobileOperatorGroup').style.display = 'none';
            modal.classList.add('active');
        }
    },
    
    closePaymentModal: function() {
        const modal = document.getElementById('paymentModal');
        if (modal) {
            modal.classList.remove('active');
        }
    },
    
    loadReservationsForPayment: async function() {
        try {
            const result = await api.getReservations();
            if (result.success) {
                this.data.reservations = result.data || [];
            } else {
                this.data.reservations = [];
            }
            
            console.log('🔍 Structure d\'une réservation:', this.data.reservations[0]);
            
            const payables = this.data.reservations.filter(r => r.isConfirmed === true);
            console.log('📦 Réservations payables:', payables);
            
            const select = document.getElementById('reservationId');
            if (!select) return;
            
            select.innerHTML = '<option value="">Sélectionner une réservation</option>';
            
            if (payables.length === 0) {
                select.innerHTML += '<option value="" disabled>Aucune réservation confirmée</option>';
            } else {
                for (const res of payables) {
                    const user = this.data.users.find(u => u.id === res.userId);
                    const userName = user ? user.fullName : 'Client inconnu';
                    select.innerHTML += `
                        <option value="${res.id}" data-amount="${res.totalAmount}" data-user="${userName}">
                            ${res.confirmationNumber} - ${userName} - ${this.formatCFA(res.totalAmount)}
                        </option>
                    `;
                }
            }
        } catch (error) {
            console.error('❌ Erreur chargement réservations:', error);
            App.showError('Impossible de charger les réservations');
        }
    },
    
    savePayment: async function() {
        const reservationId = document.getElementById('reservationId').value;
        const amount = parseFloat(document.getElementById('amount').value);
        const paymentMethodSelect = document.getElementById('paymentMethod').value;
        const currency = document.getElementById('currency').value;
        
        if (!reservationId) {
            App.showError('Veuillez sélectionner une réservation');
            return;
        }
        
        if (!amount || amount <= 0) {
            App.showError('Veuillez saisir un montant valide');
            return;
        }
        
        let paymentMethodId = 1;
        if (paymentMethodSelect === 'cash') paymentMethodId = 1;
        else if (paymentMethodSelect === 'card') paymentMethodId = 2;
        else if (paymentMethodSelect === 'mobile') paymentMethodId = 3;
        
        const paymentData = {
            reservationId: parseInt(reservationId),
            amount: amount,
            paymentMethod: paymentMethodId,
            currency: currency
        };
        
        console.log('📦 Données formatées pour l\'API:', paymentData);
        
        try {
            const result = await api.createPayment(paymentData);
            
            if (result.success) {
                App.showSuccess('Paiement enregistré avec succès');
                this.closePaymentModal();
                await this.loadData();
            } else {
                App.showError(result.error || 'Erreur lors de l\'enregistrement');
            }
        } catch (error) {
            console.error('❌ Erreur sauvegarde:', error);
            App.showError('Erreur lors de l\'enregistrement');
        }
    },
    
    viewDetails: async function(id) {
        let payment = this.data.payments.find(p => p.id === id);
        
        if (!payment) {
            try {
                const result = await api.getPaymentById(id);
                if (result.success) {
                    payment = result.data;
                    const reservation = this.data.reservations.find(r => r.id === payment.reservationId);
                    const user = reservation ? this.data.users.find(u => u.id === reservation.userId) : null;
                    payment.client = user ? user.fullName : 'Client inconnu';
                    payment.reservationNumber = reservation ? reservation.confirmationNumber : 'N/A';
                }
            } catch (error) {
                console.error('❌ Erreur chargement détail:', error);
            }
        }
        
        if (!payment) {
            App.showError('Paiement non trouvé');
            return;
        }
        
        const modal = document.getElementById('paymentDetailsModal');
        const details = document.getElementById('paymentDetails');
        const actions = document.getElementById('paymentActions');
        
        details.innerHTML = `
            <div class="details-grid">
                <div class="detail-section">
                    <h4><i class="fas fa-info-circle"></i> Informations générales</h4>
                    <div class="detail-row">
                        <span class="detail-label">ID Paiement</span>
                        <span class="detail-value">#${payment.id}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Transaction</span>
                        <span class="detail-value">${payment.transactionId || 'N/A'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Date</span>
                        <span class="detail-value">${this.formatDate(payment.paymentDate)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Statut</span>
                        <span class="detail-value">
                            <span class="status-badge ${this.getStatusClass(payment.paymentStatus)}">
                                ${this.getStatusText(payment.paymentStatus)}
                            </span>
                        </span>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4><i class="fas fa-user"></i> Client et réservation</h4>
                    <div class="detail-row">
                        <span class="detail-label">Client</span>
                        <span class="detail-value">${payment.client || 'N/A'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Réservation</span>
                        <span class="detail-value">${payment.reservationNumber || 'N/A'}</span>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4><i class="fas fa-credit-card"></i> Détails du paiement</h4>
                    <div class="detail-row">
                        <span class="detail-label">Montant</span>
                        <span class="detail-value"><strong>${this.formatCFA(payment.amount)}</strong></span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Méthode</span>
                        <span class="detail-value">
                            ${this.getMethodIcon(payment.paymentMethod)} ${this.getMethodName(payment.paymentMethod)}
                        </span>
                    </div>
                    ${payment.cardLast4 ? `
                        <div class="detail-row">
                            <span class="detail-label">Carte</span>
                            <span class="detail-value">**** **** **** ${payment.cardLast4}</span>
                        </div>
                    ` : ''}
                    ${payment.mobileOperator ? `
                        <div class="detail-row">
                            <span class="detail-label">Opérateur</span>
                            <span class="detail-value">${payment.mobileOperator}</span>
                        </div>
                    ` : ''}
                </div>
                
                ${payment.failureReason ? `
                    <div class="detail-section">
                        <h4><i class="fas fa-exclamation-triangle"></i> Raison de l'échec</h4>
                        <div class="detail-row">
                            <span class="detail-value" style="color: var(--danger);">${payment.failureReason}</span>
                        </div>
                    </div>
                ` : ''}
                
                ${payment.refundReason ? `
                    <div class="detail-section">
                        <h4><i class="fas fa-undo-alt"></i> Raison du remboursement</h4>
                        <div class="detail-row">
                            <span class="detail-value">${payment.refundReason}</span>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
        
        actions.innerHTML = `
            <button class="btn-secondary" onclick="PaymentsPage.printReceipt(${payment.id})">
                <i class="fas fa-print"></i> Imprimer reçu
            </button>
            ${payment.paymentStatus === 'completed' || payment.paymentStatus === 2 ? `
                <button class="btn-danger" onclick="PaymentsPage.openRefundModal(${payment.id})">
                    <i class="fas fa-undo-alt"></i> Rembourser
                </button>
            ` : ''}
            <button class="btn-primary" onclick="PaymentsPage.closeDetailsModal()">
                <i class="fas fa-times"></i> Fermer
            </button>
        `;
        
        modal.classList.add('active');
    },
    
    closeDetailsModal: function() {
        document.getElementById('paymentDetailsModal').classList.remove('active');
    },
    
    printReceipt: function(id) {
        const payment = this.data.payments.find(p => p.id === id);
        if (!payment) return;
        
        const modal = document.getElementById('receiptModal');
        const content = document.getElementById('receiptContent');
        
        content.innerHTML = `
            <div class="receipt">
                <div class="receipt-header">
                    <div class="receipt-logo">PARKING</div>
                    <div class="receipt-title">Reçu de paiement</div>
                </div>
                
                <div class="receipt-info">
                    <div class="receipt-row">
                        <span>N° Transaction:</span>
                        <span><strong>${payment.transactionId || 'N/A'}</strong></span>
                    </div>
                    <div class="receipt-row">
                        <span>Date:</span>
                        <span>${this.formatDate(payment.paymentDate)}</span>
                    </div>
                    <div class="receipt-row">
                        <span>Client:</span>
                        <span>${payment.client || 'N/A'}</span>
                    </div>
                    <div class="receipt-row">
                        <span>Réservation:</span>
                        <span>${payment.reservationNumber || 'N/A'}</span>
                    </div>
                    <div class="receipt-row">
                        <span>Méthode:</span>
                        <span>${this.getMethodName(payment.paymentMethod)}</span>
                    </div>
                    <div class="receipt-row receipt-total">
                        <span>TOTAL:</span>
                        <span>${this.formatCFA(payment.amount)}</span>
                    </div>
                </div>
                
                <div class="receipt-footer">
                    <p>Merci de votre confiance !</p>
                    <p>Reçu généré le ${new Date().toLocaleDateString('fr-FR')}</p>
                </div>
            </div>
        `;
        
        modal.classList.add('active');
    },
    
    closeReceiptModal: function() {
        document.getElementById('receiptModal').classList.remove('active');
    },
    
    openRefundModal: function(id) {
        const payment = this.data.payments.find(p => p.id === id);
        if (!payment) return;
        
        document.getElementById('refundPaymentId').value = id;
        document.getElementById('refundAmount').value = payment.amount;
        document.getElementById('refundModal').classList.add('active');
        this.closeDetailsModal();
    },
    
    closeRefundModal: function() {
        document.getElementById('refundModal').classList.remove('active');
        document.getElementById('refundForm').reset();
    },
    
    processRefund: async function() {
        const paymentId = document.getElementById('refundPaymentId').value;
        const amount = parseFloat(document.getElementById('refundAmount').value);
        const reason = document.getElementById('refundReason').value;
        const comments = document.getElementById('refundComments').value;
        
        const payment = this.data.payments.find(p => p.id == paymentId);
        if (!payment) return;
        
        try {
            const updateData = {
                ...payment,
                paymentStatus: 'refunded',
                refundReason: reason,
                refundComments: comments,
                refundDate: new Date().toISOString()
            };
            
            const result = await api.updatePayment(parseInt(paymentId), updateData);
            
            if (result.success) {
                payment.paymentStatus = 'refunded';
                payment.refundReason = reason;
                payment.refundComments = comments;
                payment.refundDate = new Date().toISOString();
                
                App.showSuccess(`Remboursement de ${this.formatCFA(amount)} effectué`);
                this.closeRefundModal();
                this.renderTable();
                this.updateStats();
            } else {
                App.showError(result.error || 'Erreur lors du remboursement');
            }
        } catch (error) {
            console.error('❌ Erreur remboursement:', error);
            App.showError('Erreur lors du remboursement');
        }
    },
    
    exportPayments: function() {
        const filtered = this.getFilteredPayments();
        
        const headers = ['ID', 'Date', 'Client', 'Réservation', 'Montant', 'Méthode', 'Statut', 'Transaction'];
        const rows = filtered.map(p => [
            p.id,
            new Date(p.paymentDate).toLocaleDateString('fr-FR'),
            p.client || 'N/A',
            p.reservationNumber || 'N/A',
            p.amount,
            this.getMethodName(p.paymentMethod),
            this.getStatusText(p.paymentStatus),
            p.transactionId || 'N/A'
        ]);
        
        const csv = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');
        
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `paiements_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        App.showSuccess('Export terminé');
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
    PaymentsPage.init();
});

window.PaymentsPage = PaymentsPage;