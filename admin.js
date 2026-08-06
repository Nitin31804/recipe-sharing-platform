document.addEventListener('DOMContentLoaded', () => {
    // Authentication Check
    if (localStorage.getItem('isAdminLoggedIn') !== 'true') {
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

    // Save users to local storage
    function saveRegisteredUsers(users) {
        localStorage.setItem('registeredUsers', JSON.stringify(users));
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
                    <td colspan="4" style="text-align: center; color: var(--text-secondary); padding: 2rem;">
                        No users have registered yet.
                    </td>
                </tr>
            `;
            return;
        }

        // Sort users by newest first
        users.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        users.forEach((user, index) => {
            const tr = document.createElement('tr');
            if (user.isBlocked) {
                tr.style.opacity = '0.5';
                tr.style.background = 'rgba(239, 68, 68, 0.05)';
            }
            
            const blockAction = user.isBlocked ? 'Unblock' : 'Block';
            const blockColor = user.isBlocked ? '#10b981' : '#f59e0b';
            
            tr.innerHTML = `
                <td style="font-weight: 500;">
                    ${user.username}
                    ${user.isBlocked ? '<span style="color: #ef4444; font-size: 0.8rem; margin-left: 0.5rem;">(Blocked)</span>' : ''}
                </td>
                <td>${user.email}</td>
                <td style="color: var(--text-secondary); font-size: 0.9rem;">${formatDate(user.timestamp)}</td>
                <td>
                    <button onclick="window.blockUser('${user.email}')" style="background: ${blockColor}; color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 0.3rem; cursor: pointer; font-size: 0.8rem; font-family: 'Outfit', sans-serif; font-weight: 500; margin-right: 0.5rem;">${blockAction}</button>
                    <button onclick="window.removeUser('${user.email}')" style="background: #ef4444; color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 0.3rem; cursor: pointer; font-size: 0.8rem; font-family: 'Outfit', sans-serif; font-weight: 500;">Remove</button>
                </td>
            `;
            usersTableBody.appendChild(tr);
        });
    }

    // Global action handlers
    window.blockUser = function(email) {
        const users = getRegisteredUsers();
        const userIndex = users.findIndex(u => u.email === email);
        if (userIndex !== -1) {
            users[userIndex].isBlocked = !users[userIndex].isBlocked;
            saveRegisteredUsers(users);
            renderAdminDashboard();
        }
    };

    window.removeUser = function(email) {
        if (confirm('Are you sure you want to permanently remove this user?')) {
            let users = getRegisteredUsers();
            users = users.filter(u => u.email !== email);
            saveRegisteredUsers(users);
            renderAdminDashboard();
        }
    };

    // Initialize Dashboard
    renderAdminDashboard();

    // Logout Logic
    document.getElementById('adminLogoutBtn').addEventListener('click', () => {
        localStorage.removeItem('isAdminLoggedIn');
        window.location.href = 'login.html';
    });
});
