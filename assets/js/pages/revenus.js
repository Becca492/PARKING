// js/pages/revenus.js
const RevenusPage = {
    charts: {},
    currentPeriod: 'mois',
    currentPage: 1,
    itemsPerPage: 15,
    data: {
        transactions: [],
        revenueByType: {},
        revenueByPayment: {},
        dailyRevenue: []
    },
    
    init: function() {
        this.loadData();
        this.setupEventListeners();
    },
    
    loadData: function() {
        this.generateMockData();
        this.updateKPIs();
        this.renderCharts();
        this.renderTable();
    },
    
    generateMockData: function() {
        const now = new Date();
        
        // Générer les transactions
        this.data.transactions = [];
        const clients = ['Jean Kouassi', 'Marie Konan', 'Paul Yao', 'Sophie N\'Guessan', 'Marc Koffi', 'Alice Bédié', 'David Zadi'];
        const types = ['Horaire', 'Journalier', 'Hebdomadaire', 'Mensuel'];
        const methods = ['Espèces', 'Carte', 'Orange Money', 'MTN Money', 'Moov Money'];
        const places = ['A12', 'B03', 'C07', 'D15', 'E02', 'F08', 'G11', 'H04'];
        const statuses = ['completed', 'completed', 'completed', 'pending']; // 75% complété
        
        for (let i = 1; i <= 50; i++) {
            const date = new Date(now);
            date.setDate(date.getDate() - Math.floor(Math.random() * 30));
            date.setHours(Math.floor(Math.random() * 12) + 8, Math.floor(Math.random() * 60));
            
            const amount = Math.floor(Math.random() * 45000) + 5000;
            const duration = Math.floor(Math.random() * 8) + 1;
            
            this.data.transactions.push({
                id: i,
                date: date.toISOString(),
                reservationNumber: `RES-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(i).padStart(3, '0')}`,
                client: clients[Math.floor(Math.random() * clients.length)],
                type: types[Math.floor(Math.random() * types.length)],
                place: places[Math.floor(Math.random() * places.length)],
                duration: duration,
                amount: amount,
                method: methods[Math.floor(Math.random() * methods.length)],
                status: statuses[Math.floor(Math.random() * statuses.length)]
            });
        }
        
        // Trier par date décroissante
        this.data.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Données pour les graphiques
        this.data.revenueByType = {
            'Horaire': 0,
            'Journalier': 0,
            'Hebdomadaire': 0,
            'Mensuel': 0
        };
        
        this.data.revenueByPayment = {
            'Espèces': 0,
            'Carte': 0,
            'Orange Money': 0,
            'MTN Money': 0,
            'Moov Money': 0
        };
        
        this.data.dailyRevenue = [];
        const dailyMap = new Map();
        
        this.data.transactions.forEach(t => {
            const date = t.date.split('T')[0];
            
            // Par type
            if (this.data.revenueByType[t.type] !== undefined) {
                this.data.revenueByType[t.type] += t.amount;
            }
            
            // Par méthode
            if (this.data.revenueByPayment[t.method] !== undefined) {
                this.data.revenueByPayment[t.method] += t.amount;
            }
            
            // Par jour
            if (!dailyMap.has(date)) {
                dailyMap.set(date, {
                    date: date,
                    amount: 0,
                    count: 0
                });
            }
            const day = dailyMap.get(date);
            day.amount += t.amount;
            day.count++;
        });
        
        this.data.dailyRevenue = Array.from(dailyMap.values()).sort((a, b) => 
            new Date(a.date) - new Date(b.date)
        );
    },
    
    updateKPIs: function() {
        const total = this.data.transactions.reduce((sum, t) => {
            if (t.status === 'completed') return sum + t.amount;
            return sum;
        }, 0);
        
        const completedCount = this.data.transactions.filter(t => t.status === 'completed').length;
        const avgDaily = completedCount > 0 ? Math.round(total / 30) : 0;
        const avgTicket = completedCount > 0 ? Math.round(total / completedCount) : 0;
        const forecast = Math.round(avgDaily * 30 * 1.1); // +10% prévision
        
        document.getElementById('totalRevenue').textContent = App.formatCFA(total);
        document.getElementById('avgDaily').textContent = App.formatCFA(avgDaily);
        document.getElementById('avgTicket').textContent = App.formatCFA(avgTicket);
        document.getElementById('forecast').textContent = App.formatCFA(forecast);
        
        document.getElementById('tableTotal').textContent = App.formatCFA(total);
    },
    
    renderCharts: function() {
        this.destroyCharts();
        this.renderRevenueChart();
        this.renderTypeChart();
        this.renderPaymentChart();
    },
    
    destroyCharts: function() {
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
    },
    
    renderRevenueChart: function() {
        const ctx = document.getElementById('revenueChart').getContext('2d');
        const chartType = document.querySelector('.chart-type-select')?.value || 'line';
        
        const isArea = chartType === 'area';
        const type = isArea ? 'line' : chartType;
        
        const labels = this.data.dailyRevenue.slice(-15).map(d => {
            const date = new Date(d.date);
            return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
        });
        
        const data = this.data.dailyRevenue.slice(-15).map(d => d.amount);
        
        this.charts.revenue = new Chart(ctx, {
            type: type,
            data: {
                labels: labels,
                datasets: [{
                    label: 'Revenus',
                    data: data,
                    borderColor: '#2a4a3d',
                    backgroundColor: isArea ? 'rgba(42,74,61,0.1)' : '#2a4a3d',
                    tension: 0.4,
                    fill: isArea,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => App.formatCFA(context.raw)
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => App.formatCFA(value)
                        }
                    }
                }
            }
        });
    },
    
    renderTypeChart: function() {
        const ctx = document.getElementById('typeChart').getContext('2d');
        
        const colors = ['#2a4a3d', '#6e7848', '#8dc63f', '#a0a080'];
        const data = Object.values(this.data.revenueByType);
        const labels = Object.keys(this.data.revenueByType);
        const total = data.reduce((a, b) => a + b, 0);
        
        this.charts.type = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const value = context.raw;
                                const percentage = Math.round((value / total) * 100);
                                return `${context.label}: ${App.formatCFA(value)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
        
        // Légende personnalisée
        const legendHtml = labels.map((label, index) => {
            const percentage = Math.round((data[index] / total) * 100);
            return `
                <div class="legend-item">
                    <div class="legend-color" style="background: ${colors[index]}"></div>
                    <span>${label}: ${percentage}%</span>
                </div>
            `;
        }).join('');
        
        document.getElementById('typeLegend').innerHTML = legendHtml;
    },
    
    renderPaymentChart: function() {
        const ctx = document.getElementById('paymentChart').getContext('2d');
        
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
        const data = Object.values(this.data.revenueByPayment);
        const labels = Object.keys(this.data.revenueByPayment);
        const total = data.reduce((a, b) => a + b, 0);
        
        this.charts.payment = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const value = context.raw;
                                const percentage = Math.round((value / total) * 100);
                                return `${context.label}: ${App.formatCFA(value)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
        
        // Légende personnalisée
        const legendHtml = labels.map((label, index) => {
            const percentage = Math.round((data[index] / total) * 100);
            return `
                <div class="legend-item">
                    <div class="legend-color" style="background: ${colors[index]}"></div>
                    <span>${label}: ${percentage}%</span>
                </div>
            `;
        }).join('');
        
        document.getElementById('paymentLegend').innerHTML = legendHtml;
    },
    
    renderTable: function() {
        const tbody = document.getElementById('revenueTableBody');
        
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const pageTransactions = this.data.transactions.slice(start, end);
        
        if (pageTransactions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="text-center">Aucune transaction</td></tr>';
            return;
        }
        
        tbody.innerHTML = pageTransactions.map(t => {
            const statusClass = t.status === 'completed' ? 'status-completed' : 'status-pending';
            const statusText = t.status === 'completed' ? 'Complété' : 'En attente';
            
            return `
                <tr>
                    <td>${new Date(t.date).toLocaleDateString('fr-FR')}</td>
                    <td><strong>${t.reservationNumber}</strong></td>
                    <td>${t.client}</td>
                    <td>${t.type}</td>
                    <td>${t.place}</td>
                    <td>${t.duration}h</td>
                    <td><strong>${App.formatCFA(t.amount)}</strong></td>
                    <td>${t.method}</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                </tr>
            `;
        }).join('');
        
        const totalPages = Math.ceil(this.data.transactions.length / this.itemsPerPage);
        document.getElementById('pageInfo').textContent = `Page ${this.currentPage} sur ${totalPages}`;
    },
    
    changePeriod: function(period) {
        this.currentPeriod = period;
        
        document.querySelectorAll('.period-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        
        // Simuler le chargement de nouvelles données
        this.generateMockData();
        this.updateKPIs();
        this.renderCharts();
        this.renderTable();
        
        App.showSuccess(`Période changée : ${period}`);
    },
    
    changeChartType: function(type) {
        this.renderRevenueChart();
    },
    
    prevPage: function() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderTable();
        }
    },
    
    nextPage: function() {
        const totalPages = Math.ceil(this.data.transactions.length / this.itemsPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.renderTable();
        }
    },
    
    exportChart: function() {
        const canvas = document.getElementById('revenueChart');
        const link = document.createElement('a');
        link.download = `revenus_${this.currentPeriod}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        App.showSuccess('Graphique exporté');
    },
    
    exportToExcel: function() {
        // Créer CSV
        const headers = ['Date', 'Réservation', 'Client', 'Type', 'Place', 'Durée', 'Montant', 'Méthode', 'Statut'];
        const rows = this.data.transactions.map(t => [
            new Date(t.date).toLocaleDateString('fr-FR'),
            t.reservationNumber,
            t.client,
            t.type,
            t.place,
            t.duration + 'h',
            t.amount,
            t.method,
            t.status === 'completed' ? 'Complété' : 'En attente'
        ]);
        
        const csv = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');
        
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `revenus_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        App.showSuccess('Export Excel terminé');
    },
    
    exportToPDF: function() {
        App.showSuccess('Génération du PDF...');
        // À implémenter avec une bibliothèque PDF
    },
    
    setupEventListeners: function() {
        // Rafraîchir les graphiques au redimensionnement
        window.addEventListener('resize', () => {
            this.renderCharts();
        });
    }
};

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    if (App.checkAuth()) {
        RevenusPage.init();
    }
});

window.RevenusPage = RevenusPage;