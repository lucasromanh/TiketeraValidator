-- TABLA DE USUARIOS
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    pin VARCHAR(10) NULL,
    role VARCHAR(20) NOT NULL,
    email VARCHAR(100) NULL,
    isActive BOOLEAN DEFAULT TRUE
);

-- TABLA DE EVENTOS
CREATE TABLE IF NOT EXISTS events (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    date DATETIME NOT NULL,
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
    status VARCHAR(20) NOT NULL DEFAULT 'VALID',
    type VARCHAR(20) NOT NULL,
    metadata_detail VARCHAR(100),
    usedAt DATETIME NULL,
    usedInMode VARCHAR(50) NULL,
    
    FOREIGN KEY (eventId) REFERENCES events(id),
    FOREIGN KEY (ownerUserId) REFERENCES users(id)
);

-- LIMPIEZA
TRUNCATE TABLE tickets;
DELETE FROM events;
DELETE FROM users;

-- 1. USUARIOS (Tus datos exactos)
-- Nota: Asigné PIN 1111 a Celeste y Maria para que puedan loguearse.
INSERT INTO users (id, name, email, role, isActive, pin) VALUES 
('a1', 'Super Admin', NULL, 'ADMIN', 1, '1234'),
('s1', 'Staff Validador', NULL, 'STAFF', 1, '5555'),
('U1', 'Celeste Peralta', 'celeste@test.com', 'ASSISTANT', 1, '1111'),
('U2', 'Staff Barra', NULL, 'STAFF', 1, '0000'),
('U3', 'Juan Perez', NULL, 'ASSISTANT', 1, '1111'),
('U4', 'Maria Garcia', NULL, 'ASSISTANT', 1, '2222');

-- 2. EVENTOS
INSERT INTO events (id, operation_type, name, venue, date, dateTimeEnd, status) VALUES
('e1', 'BOLICHE', 'Fiesta Noche Retro 90s', 'Salta Capital', '2024-06-15 23:30:00', '2024-06-16 06:00:00', 'ACTIVE'),
('e2', 'CINE', 'The Batman: Estreno', 'Cine Hoyts Salta', '2024-06-22 20:00:00', '2024-06-22 23:00:00', 'UPCOMING');

-- 3. TICKETS (Asociados a U1 - Celeste)
INSERT INTO tickets (id, eventId, code, ownerUserId, status, type, metadata_detail, usedAt, usedInMode) VALUES 
('t1', 'e1', 'ENTRY-90S-SALTA', 'U1', 'VALID', 'ENTRY', 'Acceso General', NULL, NULL),
('t2', 'e1', 'DRK-FERNET-01', 'U1', 'VALID', 'DRINK', 'FERNET CON COCA', NULL, NULL),
('t3', 'e1', 'DRK-FERNET-02', 'U1', 'VALID', 'DRINK', 'FERNET CON COCA', NULL, NULL),
('t4', 'e1', 'USED-DRK-BEER', 'U1', 'USED', 'DRINK', 'CERVEZA', '2024-06-15 23:45:00', 'DRINK');
