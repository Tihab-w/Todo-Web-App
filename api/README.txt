TODO LIST APPLICATION - SETUP INSTRUCTIONS
==========================================

Prerequisites:
1. XAMPP installed on your computer
2. Web browser (Chrome, Firefox, etc.)

Setup Steps:

1. START XAMPP SERVICES:
   - Open XAMPP Control Panel
   - Start Apache and MySQL services

2. CREATE DATABASE:
   - Open phpMyAdmin (http://localhost/phpmyadmin)
   - Create a new database named "todo_app"
   - Import the SQL from the provided SQL script or run:
     CREATE DATABASE todo_app;
     USE todo_app;
     CREATE TABLE tasks (
         id INT AUTO_INCREMENT PRIMARY KEY,
         title VARCHAR(255) NOT NULL,
         description TEXT,
         due_date DATE,
         priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
         is_completed BOOLEAN DEFAULT FALSE,
         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
     );

3. PLACE FILES:
   - Copy all the project files to: C:\xampp\htdocs\todo-app\
   - Or create a "todo-app" folder in htdocs and place files there

4. ACCESS THE APPLICATION:
   - Open your web browser
   - Go to: http://localhost/todo-app/

5. CONFIGURE DATABASE (if needed):
   - If your MySQL credentials are different, edit db_connect.php
   - Default credentials: username='root', password=''

File Structure:
- index.html          - Main application interface
- style.css           - Styling for the application
- script.js           - Client-side functionality
- db_connect.php      - Database connection settings
- api/                - API endpoints for CRUD operations
  - get_tasks.php     - Fetch all tasks
  - add_task.php      - Add new task
  - update_task.php   - Update task
  - delete_task.php   - Delete task

Features:
- Add, edit, delete tasks
- Mark tasks as complete/incomplete
- Set priority levels (High, Medium, Low)
- Set due dates
- Filter tasks (All, Active, Completed)
- Responsive design for mobile and desktop
- Persistent storage in MySQL database

Troubleshooting:
1. If you see "Connection failed" error:
   - Check if MySQL is running in XAMPP
   - Verify database credentials in db_connect.php

2. If tasks are not saving:
   - Check if the database table exists
   - Verify file permissions in the api folder

3. If styles are not loading:
   - Check browser console for errors
   - Ensure all files are in correct locations

For any issues, check the browser console (F12) for error messages.