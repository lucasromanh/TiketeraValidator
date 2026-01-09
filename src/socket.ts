import { io } from 'socket.io-client';

// Detectar si estamos en producción (served by node) o desarrollo (vite)
// Si estamos en desarrollo, asumimos que el usuario correrá el servidor en el puerto 3000 o similar
// Pero para simplificar en red local, intentamos conectar al host actual
const URL = window.location.hostname === 'localhost'
    ? `http://${window.location.hostname}:3000` // Asumimos puerto del servidor en dev
    : '/'; // En producción (mismo puerto que sirve los archivos)

export const socket = io(URL, {
    autoConnect: true,
    reconnection: true,
});
