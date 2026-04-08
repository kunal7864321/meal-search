const DEFAULT_QUERY = "a";
const THEME_STORAGE_KEY = "meal-search-theme";

const searchInput = document.querySelector(".js-search-input");
const searchBtn = document.querySelector(".js-search-button");
const categorySelect = document.querySelector(".js-category-select");
const sortSelect = document.querySelector(".js-sort-select");
const themeToggleBtn = document.querySelector(".js-theme-toggle");
const resultsContainer = document.querySelector(".js-results");
const loadingText = document.querySelector(".js-loading");
const messageText = document.querySelector(".js-message");
const recipeModal = document.getElementById("recipeModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const recipeTitle = document.getElementById("recipeTitle");
const recipeImage = document.getElementById("recipeImage");
const recipeCategory = document.getElementById("recipeCategory");
const recipeArea = document.getElementById("recipeArea");
const recipeInstructions = document.getElementById("recipeInstructions");
const recipeVideo = document.getElementById("recipeVideo");

const state = {
  meals: [],
  searchTerm: "",
  category: "all",
  sort: "name-asc",
  theme: "light",
};

const setLoading = (isLoading) => {
  loadingText.classList.toggle("hidden", !isLoading);
};

const setMessage = (message) => {
  messageText.textContent = message;
};

const shortenText = (text, maxLength = 100) => {
  if (!text) {
    return "No instructions available.";
  }

  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};

const getSearchIndex = (meal) => {
  return [meal.strMeal, meal.strCategory, meal.strArea, meal.strInstructions]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
};

const matchesSearch = (meal) => {
  if (!state.searchTerm) {
    return true;
  }

  return getSearchIndex(meal).includes(state.searchTerm);
};

const matchesCategory = (meal) => {
  return state.category === "all" || meal.strCategory === state.category;
};

const sortMeals = (meals) => {
  const sortedMeals = [...meals];

  sortedMeals.sort((firstMeal, secondMeal) => {
    const firstName = (firstMeal.strMeal || "").toLowerCase();
    const secondName = (secondMeal.strMeal || "").toLowerCase();

    if (state.sort === "name-desc") {
      return secondName.localeCompare(firstName);
    }

    return firstName.localeCompare(secondName);
  });

  return sortedMeals;
};

const getVisibleMeals = () => {
  return sortMeals(
    state.meals.filter((meal) => matchesSearch(meal)).filter((meal) => matchesCategory(meal))
  );
};

const createTextElement = (tagName, className, text) => {
  const element = document.createElement(tagName);
  element.className = className;
  element.textContent = text;
  return element;
};

const createMealCard = (meal) => {
  const article = document.createElement("article");
  article.className =
    "app-card group overflow-hidden rounded-2xl shadow-2xl transition duration-300 hover:-translate-y-1.5";

  const imageWrap = document.createElement("div");
  imageWrap.className = "overflow-hidden";

  const image = document.createElement("img");
  image.src = meal.strMealThumb || "";
  image.alt = meal.strMeal || "Recipe image";
  image.loading = "lazy";
  image.className = "h-48 w-full object-cover transition duration-500 group-hover:scale-110";

  const content = document.createElement("div");
  content.className = "space-y-2 p-5";

  const title = createTextElement("h2", "app-card-title text-lg font-semibold", meal.strMeal || "Recipe");
  const category = createTextElement(
    "p",
    "app-card-copy text-sm",
    `Category: ${meal.strCategory || "N/A"}`
  );
  const area = createTextElement("p", "app-card-copy text-sm", `Area: ${meal.strArea || "N/A"}`);
  const instructions = createTextElement(
    "p",
    "app-card-copy pt-1 text-sm leading-relaxed",
    shortenText(meal.strInstructions, 100)
  );

  const button = document.createElement("button");
  button.type = "button";
  button.dataset.mealId = meal.idMeal;
  button.className =
    "js-meal-card-button app-card-action mt-2 inline-flex rounded-lg px-3 py-1.5 text-xs font-bold transition hover:opacity-95";
  button.textContent = "View Recipe";

  imageWrap.appendChild(image);
  content.appendChild(title);
  content.appendChild(category);
  content.appendChild(area);
  content.appendChild(instructions);
  content.appendChild(button);
  article.appendChild(imageWrap);
  article.appendChild(content);

  return article;
};

const renderMeals = (meals) => {
  resultsContainer.textContent = "";

  const fragment = document.createDocumentFragment();
  meals.forEach((meal) => {
    fragment.appendChild(createMealCard(meal));
  });

  resultsContainer.appendChild(fragment);
};

const updateCategoryOptions = (meals) => {
  const categories = meals.reduce((uniqueCategories, meal) => {
    if (meal.strCategory && !uniqueCategories.includes(meal.strCategory)) {
      uniqueCategories.push(meal.strCategory);
    }

    return uniqueCategories;
  }, []);

  categories.sort((firstCategory, secondCategory) => firstCategory.localeCompare(secondCategory));

  categorySelect.textContent = "";

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All categories";
  categorySelect.appendChild(allOption);

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });

  if (!categories.includes(state.category)) {
    state.category = "all";
  }

  categorySelect.value = state.category;
};

const applyFiltersAndRender = () => {
  const visibleMeals = getVisibleMeals();
  renderMeals(visibleMeals);

  if (visibleMeals.length === 0) {
    setMessage(
      state.meals.length === 0
        ? "No meals found. Try a different search."
        : "No meals match your current search or filters."
    );
    return;
  }

  setMessage("");
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

const fetchMeals = async (query) => {
  setLoading(true);
  setMessage("");

  try {
    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error("Request failed");
    }

    const data = await response.json();
    state.meals = data.meals || [];
    updateCategoryOptions(state.meals);
    applyFiltersAndRender();
  } catch (error) {
    state.meals = [];
    updateCategoryOptions(state.meals);
    renderMeals([]);
    setMessage("Something went wrong. Please try again.");
  } finally {
    setLoading(false);
  }
};

const handleSearchInput = () => {
  state.searchTerm = searchInput.value.trim().toLowerCase();
  applyFiltersAndRender();
};

const handleSearchSubmit = () => {
  const query = searchInput.value.trim() || DEFAULT_QUERY;
  fetchMeals(query);
};

const handleCategoryChange = () => {
  state.category = categorySelect.value;
  applyFiltersAndRender();
};

const handleSortChange = () => {
  state.sort = sortSelect.value;
  applyFiltersAndRender();
};

const applyTheme = (theme) => {
  state.theme = theme;
  const isDark = theme === "dark";

  document.body.classList.toggle("is-dark", isDark);
  themeToggleBtn.classList.toggle("is-active", isDark);
  themeToggleBtn.setAttribute("aria-pressed", String(isDark));
  themeToggleBtn.textContent = isDark ? "Switch to light mode" : "Switch to dark mode";
  localStorage.setItem(THEME_STORAGE_KEY, theme);
};

const initializeTheme = () => {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(storedTheme || (prefersDark ? "dark" : "light"));
};

const handleThemeToggle = () => {
  applyTheme(state.theme === "dark" ? "light" : "dark");
};

const handleResultsClick = (event) => {
  const targetButton = event.target.closest(".js-meal-card-button");

  if (!targetButton) {
    return;
  }

  const selectedMeal = state.meals.find((meal) => meal.idMeal === targetButton.dataset.mealId);

  if (selectedMeal) {
    openRecipeModal(selectedMeal);
  }
};

const initializeEventHandlers = () => {
  searchBtn.addEventListener("click", handleSearchSubmit);
  searchInput.addEventListener("input", handleSearchInput);
  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      handleSearchSubmit();
    }
  });
  categorySelect.addEventListener("change", handleCategoryChange);
  sortSelect.addEventListener("change", handleSortChange);
  themeToggleBtn.addEventListener("click", handleThemeToggle);
  resultsContainer.addEventListener("click", handleResultsClick);
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
};

const initializeApp = async () => {
  initializeTheme();
  initializeEventHandlers();
  await fetchMeals(DEFAULT_QUERY);
};

initializeApp();
