<?php
header('Access-Control-Allow-Origin: *'); 
header('Access-Control-Allow-Methods: POST, OPTIONS'); 
header('Access-Control-Allow-Headers: Content-Type'); 
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204); 
    exit;
}

$apilink = "http://192.168.126.9:5177/api/Pizza";
header('Content-Type: application/json');

try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $input = $_POST['orderData'];
    $data = json_decode($input, true);

    if (!isset($data['ids']) || !isset($data['total'])) {
        throw new Exception("Invalid input data");
    }

    $ids = json_encode($data['ids']); 
    $total = $data['total'];
    $date = date('Y/m/d h:i:s a', time());
    $stmt = $conn->prepare("INSERT INTO orders (id, total, date) VALUES (:ids, :total, :date)");
    $stmt->bindParam(':ids', $ids);
    $stmt->bindParam(':total', $total);
    $stmt->bindParam(':date', $date);
    $stmt->execute();

    header("Location: thanks.html"); 
    exit; 
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
