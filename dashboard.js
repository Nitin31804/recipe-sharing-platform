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

    // Cache for API data
    let allIndianMeals = [
        { title: "Chicken Tikka Masala", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&q=80", id: "Chicken Tikka Masala", isGlobal: true },
        { title: "Palak Paneer", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&q=80", id: "Palak Paneer", isGlobal: true },
        { title: "Biryani", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&q=80", id: "Biryani", isGlobal: true },
        { title: "Dal Makhani", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&q=80", id: "Dal Makhani", isGlobal: true },
        { title: "Samosa", image: "https://images.unsplash.com/photo-1601050690117-94f5f6af8bc7?w=500&q=80", id: "Samosa", isGlobal: true },
        { title: "Chole Bhature", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&q=80", id: "Chole Bhature", isGlobal: true }
    ];

    // Render recipes to the grid
    async function renderRecipes(searchTerm = "") {
        recipeGrid.innerHTML = '';
        if (loadingIndicator) loadingIndicator.classList.add('d-none');
        
        let localRecipes = getRecipes();
        
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
            
            // If search doesn't perfectly match existing items, add an "AI Generate" card!
            if (!allIndianMeals.some(r => r.title.toLowerCase() === lowerTerm)) {
                filteredAPI.unshift({
                    title: `Cook "${searchTerm}" with AI ✨`,
                    image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=500&q=80",
                    id: searchTerm,
                    isGlobal: true
                });
            }
        }
        
        // Merge and render
        const allRecipes = [...filteredLocal, ...filteredAPI];

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

    async function openDetailedRecipe(dishName) {
        // Reset modal UI
        document.getElementById('detailImage').src = "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=1000&q=80";
        document.getElementById('detailTitle').textContent = `AI is cooking ${dishName}...`;
        document.getElementById('detailArea').textContent = "Ollama Local AI";
        document.getElementById('detailInstructions').innerHTML = `<div class="ai-loader" style="text-align:center; padding: 2rem;">Generating authentic recipe using local AI...<br><small style="opacity:0.7">This may take a few seconds.</small></div>`;
        document.getElementById('detailIngredients').innerHTML = '';
        detailedModal.classList.add('active');
        
        try {
            const prompt = `You are a master Indian chef. Provide a recipe for ${dishName}. Return ONLY a raw JSON object (no markdown, no backticks, no other text) with exactly this structure: {"title": "${dishName}", "ingredients": [{"item": "ingredient 1", "measure": "measure 1"}], "instructions": "Step 1...\\nStep 2..."}`;
            
            // Note: Defaulting to llama3, user can change this if needed.
            const res = await fetch(`http://localhost:11434/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'llama3',
                    prompt: prompt,
                    stream: false,
                    format: 'json'
                })
            });
            
            const data = await res.json();
            const recipeData = JSON.parse(data.response);
            
            document.getElementById('detailTitle').textContent = recipeData.title;
            document.getElementById('detailInstructions').textContent = recipeData.instructions;
            
            // Extract ingredients
            const ul = document.getElementById('detailIngredients');
            ul.innerHTML = '';
            recipeData.ingredients.forEach(ing => {
                const li = document.createElement('li');
                li.style.padding = '0.5rem 0';
                li.style.borderBottom = '1px solid rgba(0,0,0,0.05)';
                li.innerHTML = `<strong>${ing.measure}</strong> ${ing.item}`;
                ul.appendChild(li);
            });
        } catch (err) {
            console.error("Failed to load details from Ollama:", err);
            document.getElementById('detailInstructions').innerHTML = `<p style="color: red;">Failed to connect to local Ollama AI. Please ensure Ollama is running on your computer with CORS enabled:</p><pre style="background:#eee; padding:1rem;">$env:OLLAMA_ORIGINS="*"<br>ollama serve</pre>`;
        }
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
