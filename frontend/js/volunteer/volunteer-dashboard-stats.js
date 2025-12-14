// volunteer-dashboard-stats.js - For general users
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard Stats Loaded - General Mode');
    
    const API_URL = 'http://localhost:3000/api';
    
    async function updateDashboardStats() {
        try {
            console.log('Fetching task data from:', `${API_URL}/tasks`);
            
            // Fetch all tasks from the API
            const response = await fetch(`${API_URL}/tasks`);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch tasks: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('API Response received');
            
            // Extract tasks from response
            const allTasks = extractTasks(data);
            console.log(`Total tasks in database: ${allTasks.length}`);
            
            if (allTasks.length === 0) {
                console.log('No tasks found in database');
                updateDashboardUI(0, 0);
                return;
            }
            
            // Get current month for filtering
            const now = new Date();
            const currentMonth = now.getMonth(); // 0-11
            const currentYear = now.getFullYear();
            
            // Filter for COMPLETED tasks THIS MONTH
            const completedTasksThisMonth = allTasks.filter(task => {
                if (!task || typeof task !== 'object') return false;
                
                // Check if task is completed
                const status = (task.status || '').toLowerCase();
                const isCompleted = status === 'completed' || status === 'done' || status === 'finished';
                
                if (!isCompleted) return false;
                
                // Check if completed/updated this month
                const completionDate = task.completedAt || task.updatedAt;
                if (!completionDate) return true; // Include if no date
                
                try {
                    const taskDate = new Date(completionDate);
                    const isThisMonth = taskDate.getMonth() === currentMonth && 
                                       taskDate.getFullYear() === currentYear;
                    return isThisMonth;
                } catch (e) {
                    console.error('Error parsing date:', completionDate, e);
                    return true; // Include if date parsing fails
                }
            });
            
            console.log(`Completed tasks this month: ${completedTasksThisMonth.length}`);
            
            // Calculate total tasks completed
            const tasksCompleted = completedTasksThisMonth.length;
            
            // Calculate total hours from completed tasks
            let totalHours = 0;
            
            completedTasksThisMonth.forEach(task => {
                // Add estimated hours (most reliable field based on your DB screenshot)
                if (task.estimatedHours) {
                    const hours = parseFloat(task.estimatedHours);
                    if (!isNaN(hours) && hours > 0) {
                        totalHours += hours;
                    }
                }
                
                // Also check for timeSpent (convert seconds to hours if available)
                if (task.timeSpent) {
                    const seconds = parseFloat(task.timeSpent);
                    if (!isNaN(seconds) && seconds > 0) {
                        totalHours += seconds / 3600;
                    }
                }
            });
            
            // Round to nearest whole number
            totalHours = Math.round(totalHours);
            
            // Ensure at least 1 hour if there are completed tasks
            if (tasksCompleted > 0 && totalHours < 1) {
                totalHours = tasksCompleted; // 1 hour per task minimum
            }
            
            console.log(`Stats calculated: ${tasksCompleted} tasks, ${totalHours} hours`);
            
            // Update the dashboard UI
            updateDashboardUI(tasksCompleted, totalHours);
            
        } catch (error) {
            console.error('Error updating dashboard stats:', error);
            // Keep existing values on error
            console.log('Using default/current values due to error');
        }
    }
    
    // Simple task extraction
    function extractTasks(data) {
        // If it's already an array of tasks
        if (Array.isArray(data)) {
            return data.filter(item => item && typeof item === 'object');
        }
        
        // If it's an object, look for tasks array
        if (data && typeof data === 'object') {
            // Try common structures
            if (Array.isArray(data.tasks)) return data.tasks;
            if (Array.isArray(data.data)) return data.data;
            if (Array.isArray(data.items)) return data.items;
            
            // Check for MongoDB structure (stroy_pets_odoption.tasks)
            if (data.stroy_pets_odoption && Array.isArray(data.stroy_pets_odoption.tasks)) {
                return data.stroy_pets_odoption.tasks;
            }
            
            // If it's an object with numeric keys (like MongoDB _id as key)
            const tasksArray = [];
            for (const key in data) {
                const item = data[key];
                if (item && typeof item === 'object' && 
                    (item.title || item.taskTitle || item.description || item.status)) {
                    tasksArray.push(item);
                }
            }
            
            if (tasksArray.length > 0) return tasksArray;
            
            // Last resort: return empty array
            return [];
        }
        
        return [];
    }
    
    // Update dashboard UI
    function updateDashboardUI(tasksCompleted, totalHours) {
        console.log(`Updating dashboard UI: ${tasksCompleted} tasks, ${totalHours} hours`);
        
        // 1. Update Tasks Completed
        const tasksElement = document.getElementById('tasksCompleted');
        if (tasksElement) {
            tasksElement.textContent = tasksCompleted;
            console.log('Updated tasks completed:', tasksCompleted);
        }
        
        // 2. Update Hours This Month
        const hoursElement = document.getElementById('hoursThisMonth');
        if (hoursElement) {
            hoursElement.textContent = totalHours;
            console.log('Updated hours this month:', totalHours);
        }
        
        // 3. Update Pets Helped (estimate based on tasks)
        const petsElement = document.getElementById('petsHelped');
        if (petsElement) {
            // Estimate: 2-4 pets helped per task (adjust as needed)
            const petsHelped = tasksCompleted > 0 ? Math.round(tasksCompleted * 3) : 0;
            petsElement.textContent = petsHelped;
        }
        
        // 4. Update Successful Adoptions (estimate based on tasks)
        const adoptionsElement = document.getElementById('successfulAdoptions');
        if (adoptionsElement) {
            // Estimate: 1 adoption per 5-6 tasks
            const adoptions = tasksCompleted > 0 ? Math.round(tasksCompleted / 5) : 0;
            adoptionsElement.textContent = adoptions > 0 ? adoptions : 0;
        }
        
        // 5. Update Performance List
        const performanceList = document.getElementById('performanceList');
        if (performanceList) {
            performanceList.innerHTML = '';
            
            if (tasksCompleted > 0) {
                performanceList.innerHTML = `
                    <li class="mb-2">✔ ${tasksCompleted} tasks completed this month</li>
                    <li class="mb-2">✔ ${totalHours} volunteer hours logged</li>
                    <li class="mb-2">✔ Excellent team contribution</li>
                    <li>✔ ${tasksCompleted >= 10 ? 'Outstanding performance!' : 'Maintaining great standards'}</li>
                `;
            } else {
                performanceList.innerHTML = `
                    <li class="mb-2">✔ Ready to start volunteering</li>
                    <li class="mb-2">✔ Check available tasks to begin</li>
                    <li>✔ Training and orientation available</li>
                `;
            }
        }
        
        // 6. Update Welcome Message
        const welcomeMessage = document.getElementById('volunteerWelcomeMessage');
        if (welcomeMessage) {
            if (tasksCompleted > 10) {
                welcomeMessage.textContent = 'Outstanding Volunteer Work!';
            } else if (tasksCompleted > 5) {
                welcomeMessage.textContent = 'Great Job This Month!';
            } else if (tasksCompleted > 0) {
                welcomeMessage.textContent = 'Thank You For Volunteering!';
            } else {
                welcomeMessage.textContent = 'Welcome Volunteer!';
            }
        }
        
        // 7. Update Subtitle
        const subtitle = document.getElementById('volunteerSubtitle');
        if (subtitle) {
            if (tasksCompleted > 0) {
                subtitle.textContent = `Team completed ${tasksCompleted} tasks and ${totalHours} hours this month`;
            } else {
                subtitle.textContent = 'Make a difference in pets\' lives today';
            }
        }
        
        console.log('Dashboard UI updated successfully');
    }
    
    // Initialize dashboard stats
    setTimeout(() => {
        updateDashboardStats();
        
        // Optional: Refresh stats every 60 seconds
        // setInterval(updateDashboardStats, 60000);
    }, 1000);
});