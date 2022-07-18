const mealsEl = document.querySelector('#meals');
const favoriteContainer = document.querySelector('#fav-meals');
const searchTerm = document.querySelector('#search-term');
const searchBtn = document.querySelector('#search');
const mealPopup = document.querySelector('#meal-popup');
const mealInfoEl = document.querySelector('.meal-info');
const popupCloseBtn = document.querySelector('#close-popup');

getRandomMeal();
fetchFavMeals();

async function getRandomMeal() {
    const resp = await fetch("https://www.themealdb.com/api/json/v1/1/random.php");
    const respData = await resp.json();
    const randomMeal = respData.meals[0];
    console.log(respData);
    
    addMeal(randomMeal, true)
};

async function getMealById(id) {
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i='+id);
    const respData = await resp.json();
    const meal = respData.meals[0];

    return meal;

};

async function getMealsBySearch(term) {
   const resp = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=' +term);
   const respData = await resp.json();
   const meals = await respData.meals;
   return meals;
};

function addMeal(mealData, random = false) {

    const meal = document.createElement('div');
    meal.classList.add('meal');
    meal.innerHTML = `

    <div class="meal-header">

    ${random ? `
    <span class="random"> random recipe
    </span>` : ''};

        <img src='${mealData.strMealThumb}' alt = '${mealData.strMeal}'>
    </div>

    <div class="meal-body">
        <h4>'${mealData.strMeal}'</h4>
        <button class="fav-btn">
            <img src="./icons/heart.svg" alt="">
        </button>
    </div>

    `;

    const btn = meal.querySelector(".meal-body .fav-btn");
    console.log(btn)
    btn.addEventListener('click', () => {

        if(btn.classList.contains('active')) {
            removeMealLS(mealData.idMeal)
            btn.classList.remove('active');
        } else {
            addMealLS(mealData.idMeal)
            btn.classList.add('active');
        }

        fetchFavMeals();
    });

    meal.addEventListener('click', () => {
        showMealInfoEl(mealData);
    });

    mealsEl.appendChild(meal);
};

function addMealLS(mealId) {

    const mealIds = getMealsLS();
    localStorage.setItem('mealIds', JSON.stringify([...mealIds, mealId]));
};

function removeMealLS(mealId){

    const mealIds = getMealsLS();

    localStorage.setItem('mealIds', JSON.stringify(mealIds.filter((id) => id !== mealId)));
};

function getMealsLS() {

    const mealIds = JSON.parse(localStorage.getItem('mealIds'));

    return mealIds === null ? [] : mealIds;
};

async function fetchFavMeals() {

    favoriteContainer.innerHTML = '';  

    const mealIds = getMealsLS();

    for(let i = 0; i < mealIds.length; i++) {
        const mealId = mealIds[i]
        meal = await getMealById(mealId);
        
        addMealToFav(meal);
    }
    console.log(meal)
};

 function addMealToFav(mealData) {

     const favMeal = document.createElement('li');
     
     favMeal.innerHTML = `
     <img src="${mealData.strMealThumb}" 
     alt="${mealData.strMeal}">
     <span>${mealData.strMeal}</span>
     <button class="clear">&times</button>
    `;

    const clearBtn = favMeal.querySelector('.clear')

    clearBtn.addEventListener('click', () => {

        removeMealLS(mealData.idMeal);

        fetchFavMeals();
    });

    favMeal.addEventListener('click', () => {
        showMealInfoEl(mealData);
    });
    
     favoriteContainer.appendChild(favMeal);
 };

 function showMealInfoEl(mealData) {

    mealInfoEl.innerHTML = '';

    const mealEl = document.createElement('div');

    const ingredients = [];

    for(let i = 1; i < 20; i++) {

        if(mealData['strIngredient' + i]) {
            ingredients.push(`${mealData['strIngredient' + i]} - ${mealData['strMeasure' + i]}`)
        } else {
            break;
        }
    }

    mealEl.innerHTML = `
    
       <h1>${mealData.strMeal}</h1>
       <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
       <p>
       ${mealData.strInstructions}
       </p>
       <h3>Ingredients</h3>
       <ul>
         ${ingredients
        .map(
            (ing) => `
            <li>${ing}</li>
            `
        )
        .join('')}

       </ul>

     `;

    mealInfoEl.appendChild(mealEl);

    mealPopup.classList.remove('hidden');
 };

 searchBtn.addEventListener('click', async () => {

    mealsEl.innerHTML = '';

    const search = searchTerm.value;

    const meals = await getMealsBySearch(search);

    if(meals) {

        meals.forEach((meal) => {
            addMeal(meal);

        });
    }
    
 });

 popupCloseBtn.addEventListener('click', () => {
    mealPopup.classList.add('hidden');
 });