<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// CONFIGURACIÓN DE BASE DE DATOS
// CAMBIAR ESTOS VALORES POR LOS DE HOSTINGER
$host = "localhost";
$db_name = "u123456789_tiketera"; // Tu nombre de base de datos
$username = "u123456789_admin";       // Tu usuario
$password = "PASSWORD_DE_DB";         // Tu contraseña

try {
    $conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name, $username, $password);
    $conn->exec("set names utf8");
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // Modo fetch objetos
    $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch(PDOException $exception) {
    echo json_encode(["status" => "error", "message" => "Connection error: " . $exception->getMessage()]);
    exit;
}
?>
