  // Tab functionality
    function showTab(tabName) {
      // Update active tab
      document.querySelectorAll('.tasks-tab').forEach(tab => {
        tab.classList.remove('active');
      });
      event.target.classList.add('active');
      
      // Show selected tab content
      document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
      });
      document.getElementById(tabName + 'Tab').style.display = 'block';
    }
    
    // Task button functionality
    document.addEventListener('DOMContentLoaded', function() {
      // Add click handlers to Complete Task buttons
      document.querySelectorAll('.btn-complete-task').forEach(button => {
        button.addEventListener('click', function() {
          markTaskComplete(this);
        });
      });
      
      // Add click handlers to View Details buttons
      document.querySelectorAll('.btn-view-details').forEach(button => {
        button.addEventListener('click', function() {
          const taskCard = this.closest('.task-card');
          const taskName = taskCard.querySelector('.task-pet-name').textContent;
          alert(`Viewing details for: ${taskName}`);
        });
      });
    });
    
    // Function to mark task as complete (from your image design)
    function markTaskComplete(button) {
      const taskCard = button.closest('.task-card');
      const taskName = taskCard.querySelector('.task-pet-name').textContent;
      
      // Update button state
      button.innerHTML = '<span class="check-icon">✓</span> Completed';
      button.classList.add('completed');
      button.disabled = true;
      
      // Update status badge
      const statusSection = taskCard.querySelector('.task-status-section');
      const statusBadge = statusSection.querySelector('.status-badge');
      if (statusBadge) {
        statusBadge.textContent = 'Completed';
        statusBadge.style.backgroundColor = '#e8f5e9';
        statusBadge.style.color = '#2e7d32';
      }
      
      // Remove or hide priority badge
      const priorityBadge = statusSection.querySelector('.priority-badge');
      if (priorityBadge) {
        priorityBadge.style.display = 'none';
      }
      
      // Show success message
      setTimeout(() => {
        alert(`"${taskName}" has been marked as completed! Points have been added to your account.`);
        
        // Optional: Move to completed tab after delay
        // showTab('completed');
      }, 300);
    }