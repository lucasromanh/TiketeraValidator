<?php
include_once 'db.php';

$data = json_decode(file_get_contents("php://input"));

try {
if (isset($data->pin)) {
    // LOGIN POR PIN
    $pin = $data->pin;
    $stmt = $conn->prepare("SELECT id, name, role, pin, email FROM users WHERE pin = :pin LIMIT 1");
    $stmt->bindParam(':pin', $pin);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

} elseif (isset($data->name) && isset($data->email)) {
    // LOGIN POR NOMBRE Y EMAIL (ASISTENTE)
    $name = $data->name;
    $email = $data->email;
    $stmt = $conn->prepare("SELECT id, name, role, pin, email FROM users WHERE name = :name AND email = :email LIMIT 1");
    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':email', $email);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
} else {
    echo json_encode(["status" => "error", "message" => "Credenciales incompletas"]);
    exit;
}

if ($user) {
    echo json_encode([
        "status" => "success", 
        "data" => $user
    ]);
} else {
    echo json_encode(["status" => "error", "message" => "Credenciales Incorrectas"]);
}

} catch(PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
