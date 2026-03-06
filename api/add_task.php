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

// Get and validate input
$title = trim($_POST['title'] ?? '');
$description = trim($_POST['description'] ?? '');
$due_date = $_POST['due_date'] ?? null;
$priority = $_POST['priority'] ?? 'Medium';

// Validate required fields
if (empty($title)) {
    sendResponse(false, 'Task title is required');
}

// Validate priority
$validPriorities = ['Low', 'Medium', 'High'];
if (!in_array($priority, $validPriorities)) {
    $priority = 'Medium';
}

// Prepare SQL statement
$stmt = $conn->prepare("INSERT INTO tasks (title, description, due_date, priority) VALUES (?, ?, ?, ?)");
$stmt->bind_param("ssss", $title, $description, $due_date, $priority);

// Execute and respond
if ($stmt->execute()) {
    sendResponse(true, 'Task added successfully', ['task_id' => $stmt->insert_id]);
} else {
    sendResponse(false, 'Failed to add task: ' . $stmt->error);
}

$stmt->close();
$conn->close();
?>