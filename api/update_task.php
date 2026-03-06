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

// Get input
$id = $_POST['id'] ?? null;
$title = trim($_POST['title'] ?? '');
$description = trim($_POST['description'] ?? '');
$due_date = $_POST['due_date'] ?? null;
$priority = $_POST['priority'] ?? 'Medium';
$is_completed = $_POST['is_completed'] ?? 0;

// Validate ID
if (!$id || !is_numeric($id)) {
    sendResponse(false, 'Valid task ID is required');
}

// Check if we're updating completion status only or full task
if (isset($_POST['title'])) {
    // Full task update
    if (empty($title)) {
        sendResponse(false, 'Task title is required');
    }
    
    // Validate priority
    $validPriorities = ['Low', 'Medium', 'High'];
    if (!in_array($priority, $validPriorities)) {
        $priority = 'Medium';
    }
    
    $stmt = $conn->prepare("UPDATE tasks SET title = ?, description = ?, due_date = ?, priority = ?, is_completed = ? WHERE id = ?");
    $stmt->bind_param("ssssii", $title, $description, $due_date, $priority, $is_completed, $id);
} else {
    // Only completion status update
    $stmt = $conn->prepare("UPDATE tasks SET is_completed = ? WHERE id = ?");
    $stmt->bind_param("ii", $is_completed, $id);
}

// Execute and respond
if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        sendResponse(true, 'Task updated successfully');
    } else {
        sendResponse(false, 'No task found with that ID');
    }
} else {
    sendResponse(false, 'Failed to update task: ' . $stmt->error);
}

$stmt->close();
$conn->close();
?>