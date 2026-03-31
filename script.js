const mealInput = document.getElementById("mealInput");
const searchBtn = document.getElementById("searchBtn");
const resultsContainer = document.getElementById("results");
const loadingText = document.getElementById("loading");
const messageText = document.getElementById("message");
const recipeModal = document.getElementById("recipeModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const recipeTitle = document.getElementById("recipeTitle");
const recipeImage = document.getElementById("recipeImage");
const recipeCategory = document.getElementById("recipeCategory");
const recipeArea = document.getElementById("recipeArea");
const recipeInstructions = document.getElementById("recipeInstructions");
const recipeVideo = document.getElementById("recipeVideo");

let currentMeals = [];

const setLoading = (isLoading) => {
  loadingText.classList.toggle("hidden", !isLoading);
};

const clearUI = () => {
  messageText.textContent = "";
  resultsContainer.innerHTML = "";
  currentMeals = [];
};

const openRecipeModal = (meal) => {
  recipeTitle.textContent = meal.strMeal || "Recipe";
  recipeImage.src = meal.strMealThumb || "";
  recipeImage.alt = meal.strMeal || "Recipe image";
  recipeCategory.textContent = `Category: ${meal.strCategory || "N/A"}`;
  recipeArea.textContent = `Area: ${meal.strArea || "N/A"}`;
  recipeInstructions.textContent = meal.strInstructions || "No instructions available.";

  if (meal.strYoutube) {
    recipeVideo.href = meal.strYoutube;
    recipeVideo.classList.remove("hidden");
  } else {
    recipeVideo.href = "#";
    recipeVideo.classList.add("hidden");
  }

  recipeModal.classList.remove("hidden");
  recipeModal.classList.add("flex");
};

const closeRecipeModal = () => {
  recipeModal.classList.add("hidden");
  recipeModal.classList.remove("flex");
};

const shortenText = (text, maxLength = 100) => {
  if (!text) {
    return "No instructions available.";
  }

  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};

const renderMeals = (meals) => {
  resultsContainer.innerHTML = meals
    .map(
      (meal) => `
        <article class="group overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-2xl shadow-slate-950/30 backdrop-blur-sm transition duration-300 hover:-translate-y-1.5 hover:border-amber-300/50">
          <div class="overflow-hidden">
          <img
            src="${meal.strMealThumb}"
            alt="${meal.strMeal}"
            class="h-48 w-full object-cover transition duration-500 group-hover:scale-110"
            loading="lazy"
          />
          </div>
          <div class="space-y-2 p-5 text-slate-100">
            <h2 class="text-lg font-semibold text-white">${meal.strMeal}</h2>
            <p class="text-sm text-slate-200"><span class="font-semibold text-amber-200">Category:</span> ${meal.strCategory || "N/A"}</p>
            <p class="text-sm text-slate-200"><span class="font-semibold text-cyan-200">Area:</span> ${meal.strArea || "N/A"}</p>
            <p class="pt-1 text-sm text-slate-200/90">${shortenText(meal.strInstructions, 100)}</p>
            <button
              type="button"
              data-meal-id="${meal.idMeal}"
              class="mt-2 inline-flex rounded-lg bg-amber-300/90 px-3 py-1.5 text-xs font-bold text-slate-900 transition hover:bg-amber-200"
            >
              View Recipe
            </button>
          </div>
        </article>
      `
    )
    .join("");
};

const searchMeals = async () => {
  const query = mealInput.value.trim();
  clearUI();

  if (!query) {
    messageText.textContent = "Please enter a meal name.";
    return;
  }

  setLoading(true);

  try {
    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error("Request failed");
    }

    const data = await response.json();
    const meals = data.meals;

    if (!meals) {
      messageText.textContent = "No meals found";
      return;
    }

    currentMeals = meals;
    renderMeals(meals);
  } catch (error) {
    messageText.textContent = "Something went wrong. Please try again.";
  } finally {
    setLoading(false);
  }
};

searchBtn.addEventListener("click", searchMeals);
mealInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    searchMeals();
  }
});

resultsContainer.addEventListener("click", (event) => {
  const targetButton = event.target.closest("[data-meal-id]");

  if (!targetButton) {
    return;
  }

  const selectedMeal = currentMeals.find((meal) => meal.idMeal === targetButton.dataset.mealId);

  if (selectedMeal) {
    openRecipeModal(selectedMeal);
  }
});

closeModalBtn.addEventListener("click", closeRecipeModal);

recipeModal.addEventListener("click", (event) => {
  if (event.target === recipeModal) {
    closeRecipeModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !recipeModal.classList.contains("hidden")) {
    closeRecipeModal();
  }
});
