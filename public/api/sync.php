<?php
include_once 'db.php';

$userId = isset($_GET['userId']) ? $_GET['userId'] : null;

// timestamp para polling optimizado (opcional, en esta demo simple podemos devolver todo y que react compare)
// $lastSync = isset($_GET['lastSync']) ? $_GET['lastSync'] : '1970-01-01 00:00:00';

try {
    if (!$userId) { echo json_encode([]); exit; }

    // Traer solo tickets USED recientemente o todos los tickets del usuario
    // Para asegurar sincronización perfecta, traemos todos los tickets del usuario.
    // Como son pocos, no importa.
    
    $stmt = $conn->prepare("SELECT id, status, usedAt, usedInMode, type, metadata_detail FROM tickets WHERE ownerUserId = :uid");
    $stmt->bindParam(':uid', $userId);
    $stmt->execute();
    $tickets = $stmt->fetchAll();

     foreach ($tickets as &$t) {
        $t['metadata'] = ["detail" => $t['metadata_detail']];
        unset($t['metadata_detail']);
    }

    echo json_encode([
        "status" => "success",
        "tickets" => $tickets
    ]);

} catch(PDOException $e) {
    echo json_encode(["status" => "error"]);
}
?>
