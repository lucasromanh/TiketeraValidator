import { io } from 'socket.io-client';

declare global {
    interface Window {
        APP_CONFIG?: {
            BACKEND_URL?: string;
        };
    }
}

// Configuración de la URL del Backend
const getBackendUrl = () => {
    // 0. Si hay una configuración explicita en el HTML de Hostinger, usala.
    if (window.APP_CONFIG?.BACKEND_URL && window.APP_CONFIG.BACKEND_URL !== "AUTO") {
        console.log('Socket.io: Usando configuración manual:', window.APP_CONFIG.BACKEND_URL);
        return window.APP_CONFIG.BACKEND_URL;
    }

    const hostname = window.location.hostname;

    // 1. Desarrollo Local
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3000';
    }

    // 2. Acceso por IP en Red Local (ej: 192.168.x.x)
    if (hostname.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)) {
        return `http://${hostname}:3000`;
    }

    // 3. Producción por Defecto (Intenta mismo dominio)
    // Esto fallará en Hostinger estático, pero permite funcionalidad básica.
    return window.location.origin;
};

export const socket = io(getBackendUrl(), {
    autoConnect: true,
    reconnection: true,
    transports: ['websocket', 'polling']
});
