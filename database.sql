-- TABLA DE USUARIOS
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    pin VARCHAR(10) NOT NULL,
    role VARCHAR(20) NOT NULL -- 'ADMIN', 'STAFF', 'ASSISTANT'
);

-- TABLA DE EVENTOS
CREATE TABLE IF NOT EXISTS events (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    date DATETIME NOT NULL,
    venue VARCHAR(100) NOT NULL,
    operation_type VARCHAR(50) NOT NULL -- 'BOLICHE', 'EVENTO', etc.
);

-- TABLA DE TICKETS
CREATE TABLE IF NOT EXISTS tickets (
    id VARCHAR(50) PRIMARY KEY,
    eventId VARCHAR(50) NOT NULL,
    code VARCHAR(100) NOT NULL UNIQUE,
    ownerUserId VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'VALID', -- 'VALID', 'USED', 'BLOCKED'
    type VARCHAR(20) NOT NULL, -- 'ENTRY', 'VIP', 'DRINK'
    metadata_detail VARCHAR(100), -- 'Solo Ingreso', 'Fernet', etc.
    usedAt DATETIME NULL,
    usedInMode VARCHAR(50) NULL,
    
    FOREIGN KEY (eventId) REFERENCES events(id),
    FOREIGN KEY (ownerUserId) REFERENCES users(id)
);

-- TABLA DE LOGS DE ESCANEO
CREATE TABLE IF NOT EXISTS scan_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    result VARCHAR(20) NOT NULL,
    reason VARCHAR(50),
    operationType VARCHAR(50),
    mode VARCHAR(50),
    gate VARCHAR(50),
    staffUserId VARCHAR(50),
    ticketCode VARCHAR(100)
);

-- INSTALACIÓN DE DATOS MOCK (Iguales a constants.tsx)

-- 1. USUARIOS
INSERT INTO users (id, name, pin, role) VALUES 
('U1', 'Lucas Admin', '1234', 'ADMIN'),
('U2', 'Staff Barra', '0000', 'STAFF'),
('U3', 'Juan Perez', '1111', 'ASSISTANT'),
('U4', 'Maria Garcia', '2222', 'ASSISTANT');

-- 2. EVENTOS
INSERT INTO events (id, name, date, venue, operation_type) VALUES
('EV1', 'Amanecer Bailable', '2026-02-14 23:00:00', 'Club Central', 'BOLICHE'),
('EV2', 'Tech Conference', '2026-03-20 09:00:00', 'Centro Convenciones', 'EVENTO_GRANDE'),
('EV3', 'Cinema Night', '2026-01-15 20:00:00', 'Cine Hoyts', 'CINE');

-- 3. TICKETS
INSERT INTO tickets (id, eventId, code, ownerUserId, status, type, metadata_detail) VALUES 
-- Juan Perez Tickets
('T1', 'EV1', 'TICKET-001', 'U3', 'VALID', 'ENTRY', 'Acceso General'),
('T2', 'EV1', 'TICKET-002', 'U3', 'VALID', 'DRINK', 'Trago: Fernet'),
('T3', 'EV1', 'TICKET-003', 'U3', 'VALID', 'VIP', 'Acceso VIP'),

-- Maria Garcia Tickets
('T4', 'EV2', 'TICKET-004', 'U4', 'VALID', 'ENTRY', 'Full Pass'),
('T5', 'EV3', 'TICKET-005', 'U4', 'VALID', 'POPCORN', 'Combo Pochoclos');
