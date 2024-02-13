const socket = io();

async function fetchMessages() {
  const response = await fetch('/api/messages');
  const data = await response.json();
  return data.messages;
}

async function renderMessages() {
  const messages = await fetchMessages();
  const messagesDiv = document.getElementById('messages');
  messagesDiv.innerHTML = '';

  messages.forEach(message => {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    messageDiv.innerHTML = `<span class="timestamp">${formatTimestamp(message.createdAt)}</span> ${message.text}`;
    messagesDiv.appendChild(messageDiv);
  });

  // Scroll to bottom
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

async function sendMessage() {
  const messageInput = document.getElementById('messageInput');
  const message = messageInput.value;

  const response = await fetch('/api/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text: message })
  });

  if (response.ok) {
    messageInput.value = '';
    renderMessages();
  } else {
    console.error('Error sending message');
  }
}

function formatTimestamp(timestamp) {
  return new Date(timestamp).toLocaleString();
}

// Initial render
renderMessages();

// WebSocket events
socket.on('newMessage', renderMessages);