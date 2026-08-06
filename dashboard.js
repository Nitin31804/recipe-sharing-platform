document.addEventListener('DOMContentLoaded', () => {
    const recipeGrid = document.getElementById('recipeGrid');
    const modal = document.getElementById('recipeModal');
    const addRecipeBtn = document.getElementById('addRecipeBtn');
    const adminPanelBtn = document.getElementById('adminPanelBtn');
    const searchInput = document.getElementById('searchInput');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const addRecipeForm = document.getElementById('addRecipeForm');

    // Check Admin Privileges
    if (localStorage.getItem('isAdminLoggedIn') === 'true') {
        adminPanelBtn.classList.remove('d-none');
    }

    // Default mock data
    const defaultRecipes = [
        {
            title: "Classic Margherita Pizza",
            desc: "A simple and delicious Neapolitan pizza with fresh tomatoes, mozzarella cheese, and basil.",
            image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&q=80",
            ingredients: ["Pizza Dough", "San Marzano Tomatoes", "Fresh Mozzarella", "Fresh Basil", "Olive Oil", "Salt"]
        },
        {
            title: "Avocado Toast",
            desc: "Healthy and quick breakfast option packed with good fats and flavor.",
            image: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=500&q=80",
            ingredients: ["Sourdough Bread", "Avocado", "Cherry Tomatoes", "Red Pepper Flakes", "Lemon Juice", "Sea Salt"]
        },
        {
            title: "Chocolate Chip Cookies",
            desc: "Soft and chewy on the inside, crispy on the edges. The perfect cookie.",
            image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500&q=80",
            ingredients: ["Butter", "Brown Sugar", "White Sugar", "Eggs", "Vanilla Extract", "Flour", "Baking Soda", "Chocolate Chips"]
        }
    ];

    // Load recipes from localStorage or use defaults
    function getRecipes() {
        const stored = localStorage.getItem('myRecipes');
        if (stored) {
            return JSON.parse(stored);
        } else {
            localStorage.setItem('myRecipes', JSON.stringify(defaultRecipes));
            return defaultRecipes;
        }
    }

    // Save recipes to localStorage
    function saveRecipes(recipes) {
        localStorage.setItem('myRecipes', JSON.stringify(recipes));
    }

    // Render recipes to the grid
    async function renderRecipes(searchTerm = "") {
        recipeGrid.innerHTML = '';
        if (loadingIndicator) loadingIndicator.classList.remove('d-none');
        
        let localRecipes = getRecipes();
        
        // Filter local logic
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            localRecipes = localRecipes.filter(r => 
                r.title.toLowerCase().includes(lowerTerm) || 
                r.ingredients.some(ing => ing.toLowerCase().includes(lowerTerm))
            );
        }

        // Fetch Global Recipes from TheMealDB
        let globalRecipes = [];
        try {
            const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${searchTerm}`);
            const data = await res.json();
            
            if (data.meals) {
                globalRecipes = data.meals.map(meal => {
                    // Extract ingredients up to 20
                    let ingredients = [];
                    for (let i = 1; i <= 20; i++) {
                        if (meal[`strIngredient${i}`]) {
                            ingredients.push(meal[`strIngredient${i}`].trim());
                        }
                    }
                    
                    return {
                        title: meal.strMeal,
                        desc: meal.strInstructions ? meal.strInstructions.substring(0, 100) + '...' : 'A delicious global dish.',
                        image: meal.strMealThumb,
                        ingredients: ingredients,
                        isGlobal: true // Flag to identify API recipes
                    };
                });
            }
        } catch (err) {
            console.error("Failed to fetch global recipes:", err);
        }

        if (loadingIndicator) loadingIndicator.classList.add('d-none');
        
        // Merge and render
        const allRecipes = [...localRecipes, ...globalRecipes];

        if (allRecipes.length === 0) {
            recipeGrid.innerHTML = '<p style="color: var(--text-secondary); grid-column: 1 / -1; text-align: center;">No recipes found. Try a different search!</p>';
            return;
        }

        allRecipes.forEach(recipe => {
            const card = document.createElement('div');
            card.className = 'recipe-card';
            
            let ingredientsHTML = '';
            // Limit to 5 ingredients for UI cleanliness, then add "..." if more
            const displayIngs = recipe.ingredients.slice(0, 5);
            displayIngs.forEach(ing => {
                if (ing) ingredientsHTML += `<li>${ing}</li>`;
            });
            if (recipe.ingredients.length > 5) {
                ingredientsHTML += `<li style="color: var(--text-secondary); font-style: italic;">+ ${recipe.ingredients.length - 5} more</li>`;
            }

            let imageHTML = '';
            if (recipe.image) {
                imageHTML = `<img src="${recipe.image}" alt="${recipe.title}" class="recipe-card-img" onerror="this.style.display='none'">`;
            }

            card.innerHTML = `
                ${imageHTML}
                <div class="recipe-card-content">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <h3 class="recipe-title">${recipe.title}</h3>
                        ${recipe.isGlobal ? '<span style="font-size: 0.7rem; background: var(--accent-color); color: white; padding: 0.2rem 0.5rem; border-radius: 1rem; white-space: nowrap;">Global</span>' : ''}
                    </div>
                    <p class="recipe-desc" style="font-size: 0.9rem;">${recipe.desc}</p>
                    <div class="recipe-ingredients">
                        <strong style="display:block; margin-bottom: 0.5rem; color: var(--text-primary); font-size: 0.85rem;">Key Ingredients:</strong>
                        <ul style="font-size: 0.85rem;">
                            ${ingredientsHTML}
                        </ul>
                    </div>
                </div>
            `;
            recipeGrid.appendChild(card);
        });
    }

    // Debounce search so we don't spam the API
    let searchTimeout;
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                renderRecipes(e.target.value);
            }, 500); // 500ms delay
        });
    }

    // Modal Logic
    addRecipeBtn.addEventListener('click', () => {
        modal.classList.add('active');
    });

    closeModalBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        addRecipeForm.reset();
    });

    // Close modal on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            addRecipeForm.reset();
        }
    });

    // Handle Form Submission
    addRecipeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const title = document.getElementById('recipeTitle').value;
        const desc = document.getElementById('recipeDesc').value;
        const imageUrl = document.getElementById('recipeImage') ? document.getElementById('recipeImage').value : '';
        const ingredientsInput = document.getElementById('recipeIngredients').value;
        
        const newRecipe = {
            title: title,
            desc: desc,
            image: imageUrl,
            ingredients: ingredientsInput.split(',').map(item => item.trim()).filter(item => item !== "")
        };

        const recipes = getRecipes();
        recipes.unshift(newRecipe); // Add to beginning of array
        saveRecipes(recipes);
        
        renderRecipes();
        
        modal.classList.remove('active');
        addRecipeForm.reset();
    });

    // Initial render
    renderRecipes();
});
