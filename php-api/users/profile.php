<?php
include_once '../config/cors.php';
include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$userId = isset($_GET['id']) ? $_GET['id'] : null;

if ($userId) {
    $query = "SELECT u.UserID, u.Name, u.Email, u.PhoneNumber,
                     CASE
                         WHEN ad.AdminID IS NOT NULL THEN 'ADMIN'
                         WHEN rm.ManagerID IS NOT NULL THEN 'MANAGER'
                         WHEN rs.StaffID IS NOT NULL THEN 'STAFF'
                         ELSE 'CUSTOMER'
                     END as Role
              FROM User u
              LEFT JOIN Admin ad ON u.UserID = ad.UserID
              LEFT JOIN Customer c ON u.UserID = c.UserID
              LEFT JOIN RestaurantStaff rs ON u.UserID = rs.UserID
              LEFT JOIN RestaurantManager rm ON rs.StaffID = rm.StaffID
              WHERE u.UserID = :userId";

    $stmt = $db->prepare($query);
    $stmt->bindParam(":userId", $userId);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'user' => [
                'id' => $row['UserID'],
                'name' => $row['Name'],
                'full_name' => $row['Name'],
                'email' => $row['Email'],
                'phone' => $row['PhoneNumber'],
                'role' => $row['Role']
            ]
        ]);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'User not found']);
    }
} else {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'User ID required']);
}
?>