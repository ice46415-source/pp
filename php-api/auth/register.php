<?php
include_once '../config/cors.php';
include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->name) && !empty($data->email) && !empty($data->password)) {
    $db->beginTransaction();

    try {
        $insertUser = "INSERT INTO User (Name, Email, PhoneNumber) VALUES (:name, :email, :phone)";
        $stmt = $db->prepare($insertUser);
        $stmt->bindParam(":name", $data->name);
        $stmt->bindParam(":email", $data->email);
        $phone = isset($data->phone) ? $data->phone : null;
        $stmt->bindParam(":phone", $phone);
        $stmt->execute();

        $userId = $db->lastInsertId();

        $hashedPassword = password_hash($data->password, PASSWORD_DEFAULT);
        $insertAccount = "INSERT INTO Account (UserID, PhoneNumber, Password) VALUES (:userId, :phone, :password)";
        $stmt = $db->prepare($insertAccount);
        $stmt->bindParam(":userId", $userId);
        $stmt->bindParam(":phone", $phone);
        $stmt->bindParam(":password", $hashedPassword);
        $stmt->execute();

        $insertCustomer = "INSERT INTO Customer (UserID) VALUES (:userId)";
        $stmt = $db->prepare($insertCustomer);
        $stmt->bindParam(":userId", $userId);
        $stmt->execute();

        $db->commit();

        http_response_code(201);
        echo json_encode([
            'success' => true,
            'user' => [
                'id' => $userId,
                'name' => $data->name,
                'email' => $data->email,
                'phone' => $phone,
                'role' => 'CUSTOMER'
            ]
        ]);
    } catch(Exception $e) {
        $db->rollBack();
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Registration failed: ' . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Name, email and password required']);
}
?>