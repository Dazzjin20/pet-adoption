const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Fetches all care tasks from the backend.
 * @param {Object} [params] - Optional query parameters to filter tasks.
 * @returns {Promise<Object>} The JSON response from the API.
 */
export async function getTasks(params = {}) {
    const token = localStorage.getItem('token');
    const query = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/tasks?${query}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch tasks: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error in getTasks:', error);
        throw error;
    }
}

/**
 * Creates a new care task.
 * @param {Object} taskData - The data for the new task.
 * @returns {Promise<Object>} The JSON response from the API.
 */
export async function createTask(taskData) {
    const token = localStorage.getItem('token');
    const url = `${API_BASE_URL}/tasks`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(taskData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to create task: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error in createTask:', error);
        throw error;
    }
}