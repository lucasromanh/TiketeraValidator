<?php
include_once 'db.php';

$data = json_decode(file_get_contents("php://input"));

/* input esperado:
{
    "code": "TICKET-001",
    "staffId": "U1",
    "mode": "ENTRY",
    "gate": "GATE A",
    "eventId": "EV1" (opcional para verificar)
}
*/

if (!isset($data->code)) {
    echo json_encode(["status" => "error", "message" => "Falta código"]);
    exit;
}

try {
    $code = $data->code;
    
    // 1. Buscar Ticket
    $stmt = $conn->prepare("SELECT * FROM tickets WHERE code = :code LIMIT 1");
    $stmt->bindParam(':code', $code);
    $stmt->execute();
    $ticket = $stmt->fetch();

    if (!$ticket) {
        echo json_encode(["status" => "error", "reason" => "NOT_FOUND"]);
        // Logscan...
        exit;
    }

    // 2. Validaciones Lógicas
    if ($ticket['status'] === 'USED') {
         echo json_encode([
            "status" => "error", 
            "reason" => "USED",
            "details" => $ticket['usedInMode'] . " - " . $ticket['usedAt']
         ]);
         exit;
    }

    if ($ticket['status'] === 'BLOCKED') {
        echo json_encode(["status" => "error", "reason" => "BLOCKED"]);
        exit;
    }

    // Verificar Evento si se envió (Importante)
    if (isset($data->eventId) && $ticket['eventId'] !== $data->eventId) {
        echo json_encode(["status" => "error", "reason" => "WRONG_EVENT"]);
        exit;
    }

    // 3. ACTUALIZAR TICKET (VALIDAR)
    $now = date("Y-m-d H:i:s");
    $mode = isset($data->mode) ? $data->mode : 'ENTRY';

    $updateStmt = $conn->prepare("UPDATE tickets SET status = 'USED', usedAt = :now, usedInMode = :mode WHERE id = :id");
    $updateStmt->bindParam(':now', $now);
    $updateStmt->bindParam(':mode', $mode);
    $updateStmt->bindParam(':id', $ticket['id']);
    $updateStmt->execute();

    // 4. LOGGEAR EL INTENTO (Opcional, pero recomendado)
    // omitido por brevedad, pero idealmente insertar en scan_logs

    // 5. Responder Éxito con datos actualizados
    $ticket['status'] = 'USED';
    $ticket['usedAt'] = $now;
    $ticket['usedInMode'] = $mode;
    $ticket['metadata'] = ["detail" => $ticket['metadata_detail']];

    echo json_encode([
        "status" => "success",
        "ticket" => $ticket
    ]);

} catch(PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
