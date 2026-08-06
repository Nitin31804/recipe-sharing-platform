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

    // Default mock data removed to focus purely on Indian cuisine
    
    // Wipe old dummy recipes to start fresh with Indian cuisine
    if (!localStorage.getItem('indianCuisineWipeDone')) {
        localStorage.removeItem('myRecipes');
        localStorage.setItem('indianCuisineWipeDone', 'true');
    }

    // Load local user-added recipes
    function getRecipes() {
        const stored = localStorage.getItem('myRecipes');
        if (stored) {
            return JSON.parse(stored);
        } else {
            return [];
        }
    }

    function saveRecipes(recipes) {
        localStorage.setItem('myRecipes', JSON.stringify(recipes));
    }

    let allIndianMeals = []; // Cache for API data

    // Render recipes to the grid
    async function renderRecipes(searchTerm = "") {
        recipeGrid.innerHTML = '';
        if (loadingIndicator) loadingIndicator.classList.remove('d-none');
        
        let localRecipes = getRecipes();
        
        // Fetch Indian Recipes from TheMealDB if not cached
        if (allIndianMeals.length === 0) {
            try {
                const res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?a=Indian`);
                const data = await res.json();
                if (data.meals) {
                    allIndianMeals = data.meals.map(meal => ({
                        title: meal.strMeal,
                        image: meal.strMealThumb,
                        id: meal.idMeal,
                        isGlobal: true
                    }));
                }
            } catch (err) {
                console.error("Failed to fetch Indian recipes:", err);
            }
        }

        if (loadingIndicator) loadingIndicator.classList.add('d-none');
        
        // Filter logic
        const lowerTerm = searchTerm.toLowerCase();
        
        let filteredLocal = localRecipes;
        if (searchTerm) {
            filteredLocal = localRecipes.filter(r => {
                const ings = r.ingredients || [];
                return (r.title && r.title.toLowerCase().includes(lowerTerm)) || 
                       ings.some(ing => ing && ing.toLowerCase().includes(lowerTerm));
            });
        }
        
        let filteredAPI = allIndianMeals;
        if (searchTerm) {
            filteredAPI = allIndianMeals.filter(r => r.title.toLowerCase().includes(lowerTerm));
        }
        
        // Merge and render
        const allRecipes = [...filteredLocal, ...filteredAPI];

        if (allRecipes.length === 0) {
            recipeGrid.innerHTML = '<p style="color: var(--text-secondary); grid-column: 1 / -1; text-align: center;">No Indian recipes found. Try a different search!</p>';
            return;
        }

        allRecipes.forEach(recipe => {
            const card = document.createElement('div');
            card.className = 'recipe-card';
            card.style.cursor = 'pointer'; // Make it look clickable
            
            // Only add click listener to API recipes for now, since local recipes don't have an ID in the DB
            if (recipe.isGlobal) {
                card.onclick = () => openDetailedRecipe(recipe.id);
            }

            let imageHTML = '';
            if (recipe.image) {
                imageHTML = `<img src="${recipe.image}" alt="${recipe.title}" class="recipe-card-img" style="height: 250px;" onerror="this.style.display='none'">`;
            }

            card.innerHTML = `
                ${imageHTML}
                <div class="recipe-card-content">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <h3 class="recipe-title" style="margin-bottom: 0;">${recipe.title}</h3>
                    </div>
                </div>
            `;
            recipeGrid.appendChild(card);
        });
    }

    // Detailed Recipe Logic
    const detailedModal = document.getElementById('detailedRecipeModal');
    const closeDetailedBtn = document.getElementById('closeDetailedBtn');
    
    closeDetailedBtn.addEventListener('click', () => {
        detailedModal.classList.remove('active');
    });

    detailedModal.addEventListener('click', (e) => {
        if (e.target === detailedModal) {
            detailedModal.classList.remove('active');
        }
    });

    async function openDetailedRecipe(id) {
        if (loadingIndicator) loadingIndicator.classList.remove('d-none');
        try {
            const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
            const data = await res.json();
            if (data.meals && data.meals.length > 0) {
                const meal = data.meals[0];
                
                document.getElementById('detailImage').src = meal.strMealThumb;
                document.getElementById('detailTitle').textContent = meal.strMeal;
                document.getElementById('detailInstructions').textContent = meal.strInstructions;
                
                // Extract ingredients
                const ul = document.getElementById('detailIngredients');
                ul.innerHTML = '';
                for (let i = 1; i <= 20; i++) {
                    if (meal[`strIngredient${i}`] && meal[`strIngredient${i}`].trim() !== '') {
                        const li = document.createElement('li');
                        li.style.padding = '0.5rem 0';
                        li.style.borderBottom = '1px solid rgba(0,0,0,0.05)';
                        li.innerHTML = `<strong>${meal[`strMeasure${i}`]}</strong> ${meal[`strIngredient${i}`]}`;
                        ul.appendChild(li);
                    }
                }
                
                detailedModal.classList.add('active');
            }
        } catch (err) {
            console.error("Failed to load details:", err);
            alert("Failed to load recipe details. Please try again.");
        }
        if (loadingIndicator) loadingIndicator.classList.add('d-none');
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
