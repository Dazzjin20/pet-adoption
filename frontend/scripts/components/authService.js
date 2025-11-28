/**
 * Isang service sa frontend para makipag-usap sa backend authentication API.
 * HINDI ito ang backend service.
 */
class AuthService {
    constructor() {
        this.baseUrl = 'http://localhost:3000/api/auth';
    }

    /**
     * Kinukuha ang auth token mula sa localStorage.
     * @returns {string|null} Ang token, o null kung wala.
     */
    getToken() {
        return localStorage.getItem('authToken');
    }

    /**
     * Sine-save ang auth token sa localStorage.
     * @param {string} token Ang JWT token mula sa login.
     */
    setToken(token) {
        localStorage.setItem('authToken', token);
    }

    /**
     * Tinatanggal ang token para mag-logout.
     */
    logout() {
        localStorage.removeItem('authToken');
    }

    /**
     * Kinukuha ang profile ng kasalukuyang naka-log in na user.
     * @returns {Promise<Object>} Ang user data.
     */
    async getCurrentUser() {
        const token = this.getToken();
        if (!token) {
            // Walang token, kaya hindi pwedeng kunin ang user data.
            return Promise.reject('No authentication token found.');
        }

        const response = await fetch(`${this.baseUrl}/me`, { // Kailangan pa nating gawin ang endpoint na ito.
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user profile.');
        }

        return response.json();
    }
}

export default new AuthService();
