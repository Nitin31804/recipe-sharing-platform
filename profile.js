document.addEventListener('DOMContentLoaded', () => {
    
    // Check if the user is an admin
    const isAdmin = localStorage.getItem('isAdminLoggedIn') === 'true';

    // Populate profile details
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const avatar = document.querySelector('.admin-stats-card > div'); // The circular div

    if (isAdmin) {
        profileName.textContent = 'Admin User';
        profileEmail.textContent = 'admin@admin.com';
        avatar.textContent = 'A';
    } else {
        profileName.textContent = 'Test User';
        profileEmail.textContent = 'user@example.com';
        avatar.textContent = 'U';
    }

    // Populate recipe count
    const recipeCount = document.getElementById('recipeCount');
    const storedRecipes = localStorage.getItem('myRecipes');
    if (storedRecipes) {
        const recipes = JSON.parse(storedRecipes);
        recipeCount.textContent = recipes.length;
    } else {
        // Fallback to default count if not initialized yet
        recipeCount.textContent = '3';
    }

});
