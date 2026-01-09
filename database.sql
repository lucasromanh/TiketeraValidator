-- TABLA DE USUARIOS
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    pin VARCHAR(10) NULL,
    role VARCHAR(20) NOT NULL, -- 'ADMIN', 'STAFF', 'ASSISTANT'
    email VARCHAR(100) NULL,
    isActive BOOLEAN DEFAULT TRUE
);

-- TABLA DE EVENTOS
CREATE TABLE IF NOT EXISTS events (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    date DATETIME NOT NULL, -- mapea a dateTimeStart
    dateTimeEnd DATETIME NULL,
    venue VARCHAR(100) NOT NULL,
    operation_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE'
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

-- Limpiar tablas si existen datos previos (para re-importar limpio)
TRUNCATE TABLE tickets;
DELETE FROM events;
DELETE FROM users;

-- 1. USUARIOS (Datos del Usuario)
INSERT INTO users (id, name, email, role, isActive, pin) VALUES 
('u1', 'Celeste Peralta', 'celeste@test.com', 'ASSISTANT', 1, NULL),
('s1', 'Staff Validador', NULL, 'STAFF', 1, '5555'),
('a1', 'Super Admin', NULL, 'ADMIN', 1, '1234');

-- 2. EVENTOS
INSERT INTO events (id, operation_type, name, venue, date, dateTimeEnd, status) VALUES
('e1', 'BOLICHE', 'Fiesta Noche Retro 90s', 'Salta Capital', '2024-06-15 23:30:00', '2024-06-16 06:00:00', 'ACTIVE'),
('e2', 'CINE', 'The Batman: Estreno', 'Cine Hoyts Salta', '2024-06-22 20:00:00', '2024-06-22 23:00:00', 'UPCOMING');

-- 3. TICKETS
INSERT INTO tickets (id, eventId, code, ownerUserId, status, type, metadata_detail, usedAt, usedInMode) VALUES 
-- Celeste Peralta Tickets
('t1', 'e1', 'ENTRY-90S-SALTA', 'u1', 'VALID', 'ENTRY', 'Acceso General', NULL, NULL),
('t2', 'e1', 'DRK-FERNET-01', 'u1', 'VALID', 'DRINK', 'FERNET CON COCA', NULL, NULL),
('t3', 'e1', 'DRK-FERNET-02', 'u1', 'VALID', 'DRINK', 'FERNET CON COCA', NULL, NULL),
('t4', 'e1', 'USED-DRK-BEER', 'u1', 'USED', 'DRINK', 'CERVEZA', '2024-06-15 23:45:00', 'DRINK');
