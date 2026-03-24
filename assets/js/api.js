// assets/js/api.js
const API_BASE_URL = 'https://localhost:7035/api';  // Port corrigé

class ApiClient {
    constructor() {
        this.baseUrl = API_BASE_URL;
        this.token = localStorage.getItem('token');
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        console.log('🌐 Appel API:', url);
        
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });
            
            console.log('📦 Status:', response.status);
            
            // Lire la réponse
            const data = await response.json();
            console.log('📦 Données reçues:', data);
            
            // Ton API retourne directement le tableau
            // Pas de wrapper { success, data }
            return {
                success: response.ok,
                data: data,
                error: response.ok ? null : 'Erreur API'
            };
            
        } catch (error) {
            console.error('❌ API Error:', error);
            return {
                success: false,
                data: null,
                error: error.message
            };
        }
    }

    /*test*/
    // assets/js/api.js - Version avec logs détaillés

async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    console.log('🌐 Appel API:', url, options.method || 'GET');
    console.log('📦 Données envoyées:', options.body);
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers
        });
        
        console.log('📦 Status:', response.status);
        console.log('📦 Status Text:', response.statusText);
        
        // Lire la réponse comme texte d'abord
        const responseText = await response.text();
        console.log('📄 Réponse brute:', responseText.substring(0, 200)); // Premiers 200 caractères
        
        // Essayer de parser en JSON
        try {
            const data = JSON.parse(responseText);
            console.log('✅ JSON parsé avec succès:', data);
            
            return {
                success: response.ok,
                data: data,
                error: response.ok ? null : (data.error || `Erreur ${response.status}`)
            };
        } catch (e) {
            console.error('❌ Erreur parsing JSON:', e);
            console.error('❌ La réponse n\'est pas du JSON valide');
            
            // Si c'est une erreur HTML, affiche un message plus clair
            if (responseText.includes('<!DOCTYPE html>')) {
                throw {
                    message: 'Le serveur a retourné une page HTML au lieu de JSON (probablement erreur 500)',
                    status: response.status
                };
            }
            
            throw {
                message: 'Format de réponse invalide',
                responseText: responseText.substring(0, 100)
            };
        }
        
    } catch (error) {
        console.error('❌ API Error:', error);
        throw error;
    }
} 

    // ==================== USERS ====================
    async getUsers() {
        return this.request('/User');
    }

    async getUserById(id) {
        return this.request(`/User/${id}`);
    }

    async createUser(userData) {
        return this.request('/User', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async updateUser(id, userData) {
        return this.request(`/User/${id}`, {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    }

    async deleteUser(id) {
        return this.request(`/User/${id}`, {
            method: 'DELETE'
        });
    }

// ==================== PARKING SPACES ====================
async getParkingSpaces() {
    return this.request('/ParkingSpace');
}

async getParkingSpaceById(id) {
    return this.request(`/ParkingSpace/${id}`);
}

async createParkingSpace(data) {
    return this.request('/ParkingSpace', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

async updateParkingSpace(id, data) {
    return this.request(`/ParkingSpace/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

async deleteParkingSpace(id) {
    return this.request(`/ParkingSpace/${id}`, {
        method: 'DELETE'
    });
}

   // ==================== RESERVATIONS ====================
async getReservations() {
    return this.request('/Reservation');
}

async getReservationById(id) {
    return this.request(`/Reservation/${id}`);
}

async createReservation(data) {
    return this.request('/Reservation', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

async updateReservation(id, data) {
    return this.request(`/Reservation/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

async deleteReservation(id) {
    return this.request(`/Reservation/${id}`, {
        method: 'DELETE'
    });
}


// ==================== VEHICLES ====================
async getVehicles() {
    return this.request('/Vehicules');
}

async getVehicleById(id) {
    return this.request(`/Vehicules/${id}`);
}

async createVehicle(data) {
    // Pour la création, on utilise l'endpoint POST /Vehicules
    return this.request('/Vehicules', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

async updateVehicle(id, data) {
    // Pour la modification, on utilise PUT /Vehicules/{id}
    return this.request(`/Vehicules/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

async deleteVehicle(id) {
    return this.request(`/Vehicules/${id}`, {
        method: 'DELETE'
    });
}

    // ==================== RESERVATION TYPES ====================
    async getReservationTypes() {
        return this.request('/ReservationType');
    }

   // ==================== PROMOTIONAL OFFERS ====================
async getPromotionalOffers() {
    return this.request('/PromotionalOffer');
}

async getPromotionalOfferById(id) {
    return this.request(`/PromotionalOffer/${id}`);
}

async createPromotionalOffer(data) {
    return this.request('/PromotionalOffer', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

async updatePromotionalOffer(id, data) {
    return this.request(`/PromotionalOffer/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

async deletePromotionalOffer(id) {
    return this.request(`/PromotionalOffer/${id}`, {
        method: 'DELETE'
    });
}
    // ==================== PAYMENTS ====================
async getPayments() {
    return this.request('/Payment');
}

async getPaymentById(id) {
    return this.request(`/Payment/${id}`);
}

async createPayment(data) {
    return this.request('/Payment', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

async updatePayment(id, data) {
    return this.request(`/Payment/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

async deletePayment(id) {
    return this.request(`/Payment/${id}`, {
        method: 'DELETE'
    });
}

    // ==================== DASHBOARD STATS ====================
    async getDashboardStats() {
        return this.request('/Dashboard/stats');
    }
}

// Instance globale
const api = new ApiClient();