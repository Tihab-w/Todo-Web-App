// DOM Elements
const addTaskForm = document.getElementById('addTaskForm');
const editTaskForm = document.getElementById('editTaskForm');
const tasksContainer = document.getElementById('tasksContainer');
const filterButtons = document.querySelectorAll('.filter-btn');
const editModal = document.getElementById('editModal');
const closeModalBtn = document.querySelector('.close-modal');
const cancelEditBtn = document.querySelector('.btn-cancel');

// State variables
let currentFilter = 'all';
let tasks = [];

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadTasks();
    setupEventListeners();
});

// Set up event listeners
function setupEventListeners() {
    // Add task form submission
    addTaskForm.addEventListener('submit', function(e) {
        e.preventDefault();
        addTask();
    });

    // Filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Set current filter and render tasks
            currentFilter = this.getAttribute('data-filter');
            renderTasks();
        });
    });

    // Modal close buttons
    closeModalBtn.addEventListener('click', closeModal);
    cancelEditBtn.addEventListener('click', closeModal);
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === editModal) {
            closeModal();
        }
    });
}

// Load tasks from server
async function loadTasks() {
    try {
        const response = await fetch('api/get_tasks.php');
        const data = await response.json();
        
        if (data.success) {
            tasks = data.tasks;
            renderTasks();
            updateStats();
        } else {
            showMessage('Error loading tasks: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Failed to load tasks. Please check your connection.', 'error');
    }
}

// Render tasks based on current filter
function renderTasks() {
    // Clear container
    tasksContainer.innerHTML = '';
    
    if (tasks.length === 0) {
        tasksContainer.innerHTML = `
            <div class="no-tasks">
                <i class="fas fa-clipboard-list" style="font-size: 3rem; color: #bdc3c7; margin-bottom: 15px;"></i>
                <h3>No tasks found</h3>
                <p>Add a new task to get started!</p>
            </div>
        `;
        return;
    }
    
    // Filter tasks based on current filter
    let filteredTasks = tasks;
    
    if (currentFilter === 'active') {
        filteredTasks = tasks.filter(task => !task.is_completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.is_completed);
    }
    
    // Render each task
    filteredTasks.forEach(task => {
        const taskElement = createTaskElement(task);
        tasksContainer.appendChild(taskElement);
    });
}

// Create HTML for a task
function createTaskElement(task) {
    const taskItem = document.createElement('div');
    taskItem.className = `task-item ${task.is_completed ? 'completed' : ''} ${task.priority.toLowerCase()}-priority`;
    
    // Format date
    const dueDate = task.due_date ? new Date(task.due_date) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let dueDateHtml = '';
    if (dueDate) {
        const isOverdue = dueDate < today && !task.is_completed;
        const formattedDate = dueDate.toLocaleDateString('en-US', { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
        
        dueDateHtml = `
            <div class="due-date ${isOverdue ? 'overdue' : ''}">
                <i class="far fa-calendar-alt"></i>
                ${formattedDate} ${isOverdue ? '(Overdue)' : ''}
            </div>
        `;
    }
    
    // Priority badge
    const priorityColors = {
        'High': '#e74c3c',
        'Medium': '#f39c12',
        'Low': '#27ae60'
    };
    
    taskItem.innerHTML = `
        <div class="task-content">
            <div class="task-title ${task.is_completed ? 'completed' : ''}">
                <i class="fas fa-${task.is_completed ? 'check-circle' : 'circle'}"></i>
                ${task.title}
                <span class="priority-badge" style="background-color: ${priorityColors[task.priority]}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; margin-left: 10px;">
                    ${task.priority}
                </span>
            </div>
            ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
            <div class="task-meta">
                ${dueDateHtml}
                <div class="created">
                    <i class="far fa-clock"></i>
                    Created: ${new Date(task.created_at).toLocaleDateString()}
                </div>
            </div>
        </div>
        <div class="task-actions">
            <button class="action-btn complete-btn" data-id="${task.id}" title="${task.is_completed ? 'Mark as Incomplete' : 'Mark as Complete'}">
                <i class="fas fa-${task.is_completed ? 'undo' : 'check'}"></i>
            </button>
            <button class="action-btn edit-btn" data-id="${task.id}" title="Edit Task">
                <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn delete-btn" data-id="${task.id}" title="Delete Task">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    // Add event listeners to action buttons
    const completeBtn = taskItem.querySelector('.complete-btn');
    const editBtn = taskItem.querySelector('.edit-btn');
    const deleteBtn = taskItem.querySelector('.delete-btn');
    
    completeBtn.addEventListener('click', () => toggleTaskCompletion(task.id));
    editBtn.addEventListener('click', () => openEditModal(task.id));
    deleteBtn.addEventListener('click', () => deleteTask(task.id));
    
    return taskItem;
}

// Add a new task
async function addTask() {
    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDescription').value;
    const dueDate = document.getElementById('dueDate').value;
    const priority = document.getElementById('priority').value;
    
    // Validate
    if (!title.trim()) {
        showMessage('Task title is required', 'error');
        return;
    }
    
    // Create form data
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('due_date', dueDate);
    formData.append('priority', priority);
    
    try {
        const response = await fetch('api/add_task.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Reset form
            addTaskForm.reset();
            document.getElementById('priority').value = 'Medium';
            
            // Reload tasks
            loadTasks();
            showMessage('Task added successfully!', 'success');
        } else {
            showMessage('Error adding task: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Failed to add task. Please try again.', 'error');
    }
}

// Toggle task completion status
async function toggleTaskCompletion(taskId) {
    try {
        const task = tasks.find(t => t.id == taskId);
        if (!task) return;
        
        const formData = new FormData();
        formData.append('id', taskId);
        formData.append('is_completed', task.is_completed ? '0' : '1');
        
        const response = await fetch('api/update_task.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            loadTasks();
            showMessage(`Task marked as ${task.is_completed ? 'incomplete' : 'complete'}!`, 'success');
        } else {
            showMessage('Error updating task: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Failed to update task. Please try again.', 'error');
    }
}

// Open edit modal with task data
function openEditModal(taskId) {
    const task = tasks.find(t => t.id == taskId);
    if (!task) return;
    
    // Fill form with task data
    document.getElementById('editTaskId').value = task.id;
    document.getElementById('editTaskTitle').value = task.title;
    document.getElementById('editTaskDescription').value = task.description || '';
    document.getElementById('editDueDate').value = task.due_date || '';
    document.getElementById('editPriority').value = task.priority;
    document.getElementById('editIsCompleted').checked = task.is_completed;
    
    // Show modal
    editModal.style.display = 'flex';
}

// Close edit modal
function closeModal() {
    editModal.style.display = 'none';
    editTaskForm.reset();
}

// Save edited task
editTaskForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const taskId = document.getElementById('editTaskId').value;
    const title = document.getElementById('editTaskTitle').value;
    const description = document.getElementById('editTaskDescription').value;
    const dueDate = document.getElementById('editDueDate').value;
    const priority = document.getElementById('editPriority').value;
    const isCompleted = document.getElementById('editIsCompleted').checked ? '1' : '0';
    
    // Validate
    if (!title.trim()) {
        showMessage('Task title is required', 'error');
        return;
    }
    
    // Create form data
    const formData = new FormData();
    formData.append('id', taskId);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('due_date', dueDate);
    formData.append('priority', priority);
    formData.append('is_completed', isCompleted);
    
    try {
        const response = await fetch('api/update_task.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            closeModal();
            loadTasks();
            showMessage('Task updated successfully!', 'success');
        } else {
            showMessage('Error updating task: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Failed to update task. Please try again.', 'error');
    }
});

// Delete a task
async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('id', taskId);
        
        const response = await fetch('api/delete_task.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            loadTasks();
            showMessage('Task deleted successfully!', 'success');
        } else {
            showMessage('Error deleting task: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Failed to delete task. Please try again.', 'error');
    }
}

// Update statistics
function updateStats() {
    const totalTasks = tasks.length;
    const activeTasks = tasks.filter(task => !task.is_completed).length;
    const completedTasks = tasks.filter(task => task.is_completed).length;
    
    document.getElementById('totalTasks').textContent = totalTasks;
    document.getElementById('activeTasks').textContent = activeTasks;
    document.getElementById('completedTasks').textContent = completedTasks;
}

// Show message to user
function showMessage(message, type) {
    // Remove existing message
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.innerHTML = `
        <span>${message}</span>
        <button class="close-message">&times;</button>
    `;
    
    // Add styles for message
    const styles = document.createElement('style');
    styles.textContent = `
        .message {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 10px;
            color: white;
            font-weight: 500;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 1001;
            display: flex;
            align-items: center;
            justify-content: space-between;
            min-width: 300px;
            max-width: 500px;
            animation: slideIn 0.3s ease;
        }
        
        .message.success {
            background-color: #2ecc71;
        }
        
        .message.error {
            background-color: #e74c3c;
        }
        
        .close-message {
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            margin-left: 15px;
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    
    document.head.appendChild(styles);
    document.body.appendChild(messageDiv);
    
    // Add close button event
    const closeBtn = messageDiv.querySelector('.close-message');
    closeBtn.addEventListener('click', () => messageDiv.remove());
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}