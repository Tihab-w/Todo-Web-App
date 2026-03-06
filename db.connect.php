<?php
// Database configuration
$host = 'localhost';
$username = 'root';
$password = '';
$database = 'todo_app';

// Create connection
$conn = new mysqli($host, $username, $password, $database);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Set charset to UTF-8
$conn->set_charset("utf8mb4");

// Helper function to send JSON response
function sendResponse($success, $message = '', $data = null) {
    header('Content-Type: application/json');
    $response = ['success' => $success];
    
    if ($message) {
        $response['message'] = $message;
    }
    
    if ($data !== null) {
        $response = array_merge($response, $data);
    }
    
    echo json_encode($response);
    exit;
}
?>