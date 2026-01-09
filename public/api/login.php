<?php
include_once 'db.php';

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->pin)) {
    echo json_encode(["status" => "error", "message" => "Falta PIN"]);
    exit;
}

$pin = $data->pin;

try {
    $stmt = $conn->prepare("SELECT id, name, role, pin FROM users WHERE pin = :pin LIMIT 1");
    $stmt->bindParam(':pin', $pin);
    $stmt->execute();
    
    $user = $stmt->fetch();

    if ($user) {
        // No devolver el pin por seguridad en una app real, pero para mantener compatibilidad con types:
        echo json_encode([
            "status" => "success", 
            "data" => $user
        ]);
    } else {
        echo json_encode(["status" => "error", "message" => "PIN Incorrecto"]);
    }

} catch(PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
