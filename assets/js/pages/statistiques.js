// js/pages/statistiques.js
const StatsPage = {
    charts: {},
    currentPeriod: 'week',
    data: {
        revenue: [],
        reservations: [],
        occupancy: {},
        topClients: [],
        averages: {},
        floorOccupancy: {},
        forecast: {}
    },
    
    init: function() {
        this.loadData();
        this.setupEventListeners();
    },
    
    loadData: function(period = 'week') {
        // Simuler le chargement des données
        this.generateMockData(period);
        this.updateKPIs();
        this.renderCharts();
        this.renderDetails();
        this.renderPerformanceTable();
    },
    
    generateMockData: function(period) {
        const now = new Date();
        let days = 7;
        
        switch(period) {
            case 'week': days = 7; break;
            case 'month': days = 30; break;
            case 'quarter': days = 90; break;
            case 'year': days = 365; break;
        }
        
        // Données de revenus
        this.data.revenue = [];
        this.data.reservations = [];
        
        for (let i = 0; i < days; i++) {
            const date = new Date(now);
            date.setDate(date.getDate() - (days - i - 1));
            
            // Variation aléatoire avec tendance
            const baseRevenue = 500000;
            const variation = Math.random() * 200000 - 100000;
            const weekend = date.getDay() === 0 || date.getDay() === 6;
            const weekendBonus = weekend ? 150000 : 0;
            
            this.data.revenue.push({
                date: date.toISOString().split('T')[0],
                amount: baseRevenue + variation + weekendBonus
            });
            
            this.data.reservations.push({
                date: date.toISOString().split('T')[0],
                count: Math.floor(Math.random() * 30) + 15
            });
        }
        
        // Données d'occupation par heure
        this.data.hourlyOccupancy = [
            { hour: '6-8h', rate: 25 },
            { hour: '8-10h', rate: 65 },
            { hour: '10-12h', rate: 85 },
            { hour: '12-14h', rate: 90 },
            { hour: '14-16h', rate: 80 },
            { hour: '16-18h', rate: 75 },
            { hour: '18-20h', rate: 55 },
            { hour: '20-22h', rate: 30 }
        ];
        
        // Données par jour de semaine
        this.data.weekdayOccupancy = [
            { day: 'Lundi', rate: 65 },
            { day: 'Mardi', rate: 70 },
            { day: 'Mercredi', rate: 75 },
            { day: 'Jeudi', rate: 80 },
            { day: 'Vendredi', rate: 90 },
            { day: 'Samedi', rate: 85 },
            { day: 'Dimanche', rate: 45 }
        ];
        
        // Répartition par type
        this.data.typeDistribution = {
            'Horaire': 45,
            'Journalier': 30,
            'Hebdomadaire': 15,
            'Mensuel': 10
        };
        
        // Top clients
        this.data.topClients = [
            { name: 'Jean Kouassi', reservations: 28, revenue: 425000 },
            { name: 'Marie Konan', reservations: 23, revenue: 389000 },
            { name: 'Paul Yao', reservations: 19, revenue: 312000 },
            { name: 'Sophie N\'Guessan', reservations: 17, revenue: 298000 },
            { name: 'Marc Koffi', reservations: 15, revenue: 256000 }
        ];
        
        // Moyennes
        this.data.averages = {
            dailyRevenue: 385000,
            dailyReservations: 24,
            ticketAmount: 12500,
            duration: '3.5h',
            satisfaction: '4.8/5'
        };
        
        // Occupation par étage
        this.data.floorOccupancy = {
            'RDC': 85,
            'Étage 1': 75,
            'Étage 2': 60,
            'Étage 3': 45,
            'Étage 4': 30
        };
        
        // Prévisions
        this.data.forecast = {
            nextWeek: '+15%',
            nextMonth: '+22%',
            nextQuarter: '+18%',
            bestDay: 'Vendredi',
            peakHour: '12-14h'
        };
    },
    
    updateKPIs: function() {
        const totalRevenue = this.data.revenue.reduce((sum, d) => sum + d.amount, 0);
        const totalReservations = this.data.reservations.reduce((sum, d) => sum + d.count, 0);
        const avgOccupancy = 68; // À calculer
        
        document.getElementById('totalRevenue').textContent = App.formatCFA(totalRevenue);
        document.getElementById('totalReservations').textContent = totalReservations;
        document.getElementById('occupancyRate').textContent = avgOccupancy + '%';
        document.getElementById('uniqueClients').textContent = 156; // À calculer
    },
    
    renderCharts: function() {
        this.destroyCharts();
        this.renderRevenueChart();
        this.renderTypeChart();
        this.renderHourlyChart();
        this.renderWeekdayChart();
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
        
        this.charts.revenue = new Chart(ctx, {
            type: type,
            data: {
                labels: this.data.revenue.map(d => {
                    const date = new Date(d.date);
                    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
                }),
                datasets: [{
                    label: 'Revenus',
                    data: this.data.revenue.map(d => d.amount),
                    borderColor: '#2a4a3d',
                    backgroundColor: isArea ? 'rgba(42,74,61,0.1)' : '#2a4a3d',
                    tension: 0.4,
                    fill: isArea
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
        
        this.charts.type = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(this.data.typeDistribution),
                datasets: [{
                    data: Object.values(this.data.typeDistribution),
                    backgroundColor: ['#2a4a3d', '#6e7848', '#8dc63f', '#a0a080'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    },
    
    renderHourlyChart: function() {
        const ctx = document.getElementById('hourlyChart').getContext('2d');
        
        this.charts.hourly = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.data.hourlyOccupancy.map(d => d.hour),
                datasets: [{
                    label: "Taux d'occupation",
                    data: this.data.hourlyOccupancy.map(d => d.rate),
                    borderColor: '#8dc63f',
                    backgroundColor: 'rgba(141,198,63,0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        min: 0,
                        max: 100,
                        ticks: {
                            callback: (value) => value + '%'
                        }
                    }
                }
            }
        });
    },
    
    renderWeekdayChart: function() {
        const ctx = document.getElementById('weekdayChart').getContext('2d');
        
        this.charts.weekday = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: this.data.weekdayOccupancy.map(d => d.day),
                datasets: [{
                    label: "Taux d'occupation",
                    data: this.data.weekdayOccupancy.map(d => d.rate),
                    backgroundColor: '#6e7848',
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        min: 0,
                        max: 100,
                        ticks: {
                            callback: (value) => value + '%'
                        }
                    }
                }
            }
        });
    },
    
    renderDetails: function() {
        // Top clients
        const topClientsHtml = this.data.topClients.map((client, index) => `
            <div class="ranking-item">
                <div class="ranking-position">${index + 1}</div>
                <div class="ranking-info">
                    <div class="ranking-name">${client.name}</div>
                    <div class="ranking-detail">${client.reservations} réservations</div>
                </div>
                <div class="ranking-value">${App.formatCFA(client.revenue)}</div>
            </div>
        `).join('');
        document.getElementById('topClients').innerHTML = topClientsHtml;
        
        // Moyennes
        const averagesHtml = `
            <div class="average-item">
                <span class="average-label">Revenu journalier</span>
                <span class="average-value">${App.formatCFA(this.data.averages.dailyRevenue)}</span>
            </div>
            <div class="average-item">
                <span class="average-label">Réservations/jour</span>
                <span class="average-value">${this.data.averages.dailyReservations}</span>
            </div>
            <div class="average-item">
                <span class="average-label">Ticket moyen</span>
                <span class="average-value">${App.formatCFA(this.data.averages.ticketAmount)}</span>
            </div>
            <div class="average-item">
                <span class="average-label">Durée moyenne</span>
                <span class="average-value">${this.data.averages.duration}</span>
            </div>
            <div class="average-item">
                <span class="average-label">Satisfaction</span>
                <span class="average-value">${this.data.averages.satisfaction}</span>
            </div>
        `;
        document.getElementById('averages').innerHTML = averagesHtml;
        
        // Occupation par étage
        const floorHtml = Object.entries(this.data.floorOccupancy).map(([floor, rate]) => `
            <div class="floor-item">
                <div class="floor-info">
                    <span class="floor-name">${floor}</span>
                    <span class="floor-percent">${rate}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${rate}%"></div>
                </div>
            </div>
        `).join('');
        document.getElementById('floorOccupancy').innerHTML = floorHtml;
        
        // Prévisions
        const forecastHtml = `
            <div class="forecast-item">
                <div class="forecast-icon">📈</div>
                <div class="forecast-content">
                    <div class="forecast-label">Semaine prochaine</div>
                    <div class="forecast-value">${this.data.forecast.nextWeek}</div>
                </div>
            </div>
            <div class="forecast-item">
                <div class="forecast-icon">📊</div>
                <div class="forecast-content">
                    <div class="forecast-label">Mois prochain</div>
                    <div class="forecast-value">${this.data.forecast.nextMonth}</div>
                </div>
            </div>
            <div class="forecast-item">
                <div class="forecast-icon">⏰</div>
                <div class="forecast-content">
                    <div class="forecast-label">Heure de pointe</div>
                    <div class="forecast-value">${this.data.forecast.peakHour}</div>
                </div>
            </div>
            <div class="forecast-item">
                <div class="forecast-icon">📅</div>
                <div class="forecast-content">
                    <div class="forecast-label">Meilleur jour</div>
                    <div class="forecast-value">${this.data.forecast.bestDay}</div>
                </div>
            </div>
        `;
        document.getElementById('forecast').innerHTML = forecastHtml;
    },
    
    renderPerformanceTable: function() {
        const tbody = document.getElementById('performanceBody');
        
        const rows = this.data.revenue.slice(-7).reverse().map((rev, index) => {
            const res = this.data.reservations[index];
            const date = new Date(rev.date);
            
            return `
                <tr>
                    <td>${date.toLocaleDateString('fr-FR')}</td>
                    <td>${res.count}</td>
                    <td>${App.formatCFA(rev.amount)}</td>
                    <td>${Math.floor(Math.random() * 30) + 50}%</td>
                    <td>${Math.floor(Math.random() * 10) + 3}</td>
                </tr>
            `;
        }).join('');
        
        tbody.innerHTML = rows;
    },
    
    changePeriod: function(period) {
        this.currentPeriod = period;
        
        document.querySelectorAll('.period-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        
        if (period === 'custom') {
            document.getElementById('customDateRange').style.display = 'flex';
        } else {
            document.getElementById('customDateRange').style.display = 'none';
            this.loadData(period);
        }
    },
    
    changeChartType: function(chartName, type) {
        this.renderCharts();
    },
    
    loadCustomData: function() {
        const start = document.getElementById('startDate').value;
        const end = document.getElementById('endDate').value;
        
        if (start && end) {
            App.showSuccess(`Chargement des données du ${start} au ${end}`);
            this.loadData('custom');
        } else {
            App.showError('Veuillez sélectionner une période');
        }
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
        StatsPage.init();
    }
});

window.StatsPage = StatsPage;