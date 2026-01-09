import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*", // Permitir conexiones desde cualquier origen en red local
        methods: ["GET", "POST"]
    }
});

const PORT = 3000;

// Servir archivos estáticos del build de Vite
app.use(express.static(path.join(__dirname, 'dist')));

// Manejo de conexiones Socket.IO
io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);

    // Cuando un staff valida un ticket
    socket.on('ticket_validated', (data) => {
        console.log('Ticket validado:', data);
        // Retransmitir a TODOS los clientes conectados
        io.emit('ticket_validated', data);
    });

    socket.on('disconnect', () => {
        console.log('Cliente desconectado:', socket.id);
    });
});

// Para cualquier otra ruta, servir el index.html (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`
  🚀 Servidor corriendo en http://localhost:${PORT}
  
  Para acceder desde otro dispositivo en la misma red:
  1. Encuentra tu IP local (ej: ipconfig en windows)
  2. Abre http://TU_IP:${PORT} en tu celular
  `);
});
