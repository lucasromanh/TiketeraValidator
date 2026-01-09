
// URL Base de la API. 
// En producción (mismo dominio), es /api
// En desarrollo (Vite port 3000 -> PHP port 80), necesitamos configurar proxy en vite o hardcodear la URL de tu server PHP local si tuvieras.
// Asumimos deploy:
const API_URL = '/api';

export const api = {
    async login(pin: string) {
        const res = await fetch(`${API_URL}/login.php`, {
            method: 'POST',
            body: JSON.stringify({ pin }),
        });
        return res.json();
    },

    async getInitialData(userId: string, role?: string) {
        const url = role
            ? `${API_URL}/get_data.php?userId=${userId}&role=${role}`
            : `${API_URL}/get_data.php?userId=${userId}`;
        const res = await fetch(url);
        return res.json();
    },

    async validateTicket(code: string, eventId: string, mode: string, staffId: string) {
        const res = await fetch(`${API_URL}/validate.php`, {
            method: 'POST',
            body: JSON.stringify({ code, eventId, mode, staffId }),
        });
        return res.json();
    },

    async syncUserTickets(userId: string) {
        const res = await fetch(`${API_URL}/sync.php?userId=${userId}`);
        return res.json();
    }
};
