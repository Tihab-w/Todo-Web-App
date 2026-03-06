<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../db_connect.php';

try {
    $sql = "SELECT * FROM tasks ORDER BY 
            CASE priority 
                WHEN 'High' THEN 1
                WHEN 'Medium' THEN 2
                WHEN 'Low' THEN 3
            END,
            due_date ASC, 
            created_at DESC";
    
    $result = $conn->query($sql);
    
    if ($result) {
        $tasks = [];
        while ($row = $result->fetch_assoc()) {
            // Convert boolean values
            $row['is_completed'] = (bool)$row['is_completed'];
            $tasks[] = $row;
        }
        
        sendResponse(true, '', ['tasks' => $tasks]);
    } else {
        sendResponse(false, 'Failed to fetch tasks: ' . $conn->error);
    }
} catch (Exception $e) {
    sendResponse(false, 'Error: ' . $e->getMessage());
}

$conn->close();
?>