 // Simple message sending functionality
    document.addEventListener('DOMContentLoaded', function() {
      const messageInput = document.querySelector('.message-input');
      const sendButton = document.querySelector('.send-btn');
      const chatMessages = document.querySelector('.chat-messages');
      
      // Auto-resize textarea
      messageInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
      });
      
      // Send message
      sendButton.addEventListener('click', function() {
        const messageText = messageInput.value.trim();
        
        if (messageText) {
          // Create sent message element
          const messageDiv = document.createElement('div');
          messageDiv.className = 'd-flex justify-content-end';
          messageDiv.innerHTML = `
            <div>
              <div class="message-bubble sent">${messageText}</div>
              <div class="message-time text-end">Just now</div>
            </div>
          `;
          
          // Add to chat
          chatMessages.appendChild(messageDiv);
          
          // Clear input
          messageInput.value = '';
          messageInput.style.height = 'auto';
          
          // Scroll to bottom
          chatMessages.scrollTop = chatMessages.scrollHeight;
        }
      });
      
      // Send on Enter (but allow Shift+Enter for new line)
      messageInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendButton.click();
        }
      });
    });