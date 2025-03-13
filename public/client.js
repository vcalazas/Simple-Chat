// Initialize socket connection
const socket = io();

// DOM Elements
const usernameModal = document.getElementById('usernameModal');
const usernameForm = document.getElementById('usernameForm');
const usernameInput = document.getElementById('usernameInput');
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');
const chatContainer = document.getElementById('chatContainer');
const connectionStatus = document.getElementById('connectionStatus');

// Current user's username
let currentUsername = '';

// Handle username submission
usernameForm.addEventListener('submit', (e) => {
    e.preventDefault();
    currentUsername = usernameInput.value.trim();
    if (currentUsername) {
        socket.emit('join', currentUsername);
        usernameModal.style.display = 'none';
        messageInput.focus();
    }
});

// Handle message submission
messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value.trim();
    if (message) {
        socket.emit('message', { message });
        messageInput.value = '';
        messageInput.focus();
    }
});

// Handle received messages
socket.on('message', (data) => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    
    const isOwnMessage = data.username === currentUsername;
    const messageBubble = document.createElement('div');
    messageBubble.classList.add('message-bubble', isOwnMessage ? 'sent' : 'received');
    
    // Create message content
    const messageContent = document.createElement('div');
    if (!isOwnMessage) {
        const username = document.createElement('div');
        username.classList.add('text-sm', 'font-semibold', 'mb-1');
        username.textContent = data.username;
        messageContent.appendChild(username);
    }
    
    const messageText = document.createElement('div');
    messageText.textContent = data.message;
    messageContent.appendChild(messageText);
    
    // Add timestamp
    const timestamp = document.createElement('div');
    timestamp.classList.add('text-xs', 'opacity-75', 'mt-1');
    timestamp.textContent = new Date(data.timestamp).toLocaleTimeString();
    messageContent.appendChild(timestamp);
    
    messageBubble.appendChild(messageContent);
    messageElement.appendChild(messageBubble);
    chatContainer.appendChild(messageElement);
    
    // Scroll to bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;
});

// Handle system messages
socket.on('system message', (message) => {
    const systemMessage = document.createElement('div');
    systemMessage.classList.add('system-message');
    systemMessage.textContent = message;
    chatContainer.appendChild(systemMessage);
    chatContainer.scrollTop = chatContainer.scrollHeight;
});

// Connection status handling
socket.on('connect', () => {
    updateConnectionStatus(true);
});

socket.on('disconnect', () => {
    updateConnectionStatus(false);
});

function updateConnectionStatus(connected) {
    connectionStatus.textContent = connected ? 'Connected' : 'Disconnected';
    connectionStatus.className = connected ? 'connected' : 'disconnected';
}

// Error handling
socket.on('error', (error) => {
    console.error('Socket error:', error);
    const errorMessage = document.createElement('div');
    errorMessage.classList.add('system-message', 'text-red-500');
    errorMessage.textContent = 'Error: ' + error;
    chatContainer.appendChild(errorMessage);
});

// Initialize connection status
updateConnectionStatus(socket.connected);
