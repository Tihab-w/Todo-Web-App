<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../db_connect.php';

// Check if request is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Invalid request method');
}

// Get and validate ID
$id = $_POST['id'] ?? null;

if (!$id || !is_numeric($id)) {
    sendResponse(false, 'Valid task ID is required');
}

// Prepare and execute delete statement
$stmt = $conn->prepare("DELETE FROM tasks WHERE id = ?");
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        sendResponse(true, 'Task deleted successfully');
    } else {
        sendResponse(false, 'No task found with that ID');
    }
} else {
    sendResponse(false, 'Failed to delete task: ' . $stmt->error);
}

$stmt->close();
$conn->close();
?>