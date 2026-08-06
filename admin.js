document.addEventListener('DOMContentLoaded', () => {
    // Authentication Check
    if (sessionStorage.getItem('isAdminLoggedIn') !== 'true') {
        window.location.href = 'login.html';
        return; // Stop execution
    }

    const totalUsersCount = document.getElementById('totalUsersCount');
    const usersTableBody = document.getElementById('usersTableBody');

    // Fetch users from local storage
    function getRegisteredUsers() {
        const stored = localStorage.getItem('registeredUsers');
        if (stored) {
            return JSON.parse(stored);
        }
        return [];
    }

    // Format ISO date to readable format
    function formatDate(isoString) {
        if (!isoString) return 'N/A';
        const date = new Date(isoString);
        return date.toLocaleString();
    }

    function renderAdminDashboard() {
        const users = getRegisteredUsers();
        
        // Update Statistics
        totalUsersCount.textContent = users.length;

        // Render Table
        usersTableBody.innerHTML = '';

        if (users.length === 0) {
            usersTableBody.innerHTML = `
                <tr>
                    <td colspan="3" style="text-align: center; color: var(--text-secondary); padding: 2rem;">
                        No users have registered yet.
                    </td>
                </tr>
            `;
            return;
        }

        // Sort users by newest first
        users.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        users.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-weight: 500;">${user.username}</td>
                <td>${user.email}</td>
                <td style="color: var(--text-secondary); font-size: 0.9rem;">${formatDate(user.timestamp)}</td>
            `;
            usersTableBody.appendChild(tr);
        });
    }

    // Initialize Dashboard
    renderAdminDashboard();

    // Logout Logic
    document.getElementById('adminLogoutBtn').addEventListener('click', () => {
        sessionStorage.removeItem('isAdminLoggedIn');
        window.location.href = 'login.html';
    });
});
