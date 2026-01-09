<?php
include_once 'db.php';

$userId = isset($_GET['userId']) ? $_GET['userId'] : die();

try {
    // 1. Obtener Eventos (Todos o filtrar si se quisiera)
    $stmtEvents = $conn->prepare("SELECT id, name, date, venue, operation_type as operationType FROM events");
    $stmtEvents->execute();
    $events = $stmtEvents->fetchAll();

    // 2. Obtener Tickets del Usuario (si es assistant) O Todos (si es admin/staff)
    // Para simplificar esta demo, si pasamos userId trae los del usuario. Si no pasamos nada o es admin, podriamos traer todo.
    // Vamos a asumir que el frontend pide los tickets relevantes.
    
    // Check user role first
    $stmtUser = $conn->prepare("SELECT role FROM users WHERE id = :id");
    $stmtUser->bindParam(':id', $userId);
    $stmtUser->execute();
    $role = $stmtUser->fetchColumn();

    $tickets = [];
    
    if ($role === 'ASSISTANT') {
        // Solo mis tickets
        $stmtTickets = $conn->prepare("SELECT id, eventId, code, ownerUserId, status, type, metadata_detail, usedAt, usedInMode FROM tickets WHERE ownerUserId = :uid");
        $stmtTickets->bindParam(':uid', $userId);
        $stmtTickets->execute();
        $tickets = $stmtTickets->fetchAll();
    } else {
        // Admin/Staff necesita todos los tickets para validar (scanning busca localmente en la app actual)
        // OJO: Si son muchos tickets, esto no escala. Pero para demo está bien.
        $stmtTickets = $conn->prepare("SELECT id, eventId, code, ownerUserId, status, type, metadata_detail, usedAt, usedInMode FROM tickets");
        $stmtTickets->execute();
        $tickets = $stmtTickets->fetchAll();
    }

    // Formatear metadata_detail a objeto metadata: { detail: ... } para compatibilidad frontend
    foreach ($tickets as &$t) {
        $t['metadata'] = ["detail" => $t['metadata_detail']];
        unset($t['metadata_detail']);
    }

    echo json_encode([
        "status" => "success",
        "events" => $events,
        "tickets" => $tickets
    ]);

} catch(PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
