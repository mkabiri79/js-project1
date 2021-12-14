import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime/runtime';
import * as model from './model.js';
import RecipeView from './views/recipeView.js';
import SearchView from './views/searchView.js';
import ResultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import BookmarkView from './views/bookmarkView.js';
import AddRecipeView from './views/addRecipeView.js';
import addRecipeView from './views/addRecipeView.js';
import recipeView from './views/recipeView.js';
import { MODAL_CLOSE_SEC } from './config.js';
// https://forkify-api.herokuapp.com/v2
//////////////////////////////////////////
// if (module.hot) {
//   module.hot.accept();
// }
///////////////////////////////////////
const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;

    RecipeView.renderSpinner();
    ResultsView.update(model.getSearchResultPage());
    BookmarkView.update(model.state.bookmarks);
    // 1) دریافت رسید
    await model.loadRecipe(id);
    const { recipe } = model.state;
    // console.log(recipe);

    // console.log(recipe.image);
    // 2)رندر کردن رسید
    RecipeView.render(model.state.recipe);

    // controlServings();
  } catch (err) {
    // alert(err);
    RecipeView.renderError();
  }
};
const controlSearchResults = async function () {
  try {
    ResultsView.renderSpinner();
    const query = SearchView.getQuery();
    if (!query) return;
    await model.loadSearchResult(query);
    // console.log(model.state.search.results);
    controlPagination(1);
    SearchView.clearInput();
  } catch (err) {
    console.log(err);
  }
};
const controlPagination = function (goToPage) {
  ResultsView.render(model.getSearchResultPage(goToPage));
  paginationView.render(model.state.search);
};
const controlServings = function (newServings) {
  model.updateServings(newServings);
  RecipeView.update(model.state.recipe);
};
const controlAddBookmark = function () {
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);
  // console.log(model.state.recipe);

  RecipeView.update(model.state.recipe);
  BookmarkView.render(model.state.bookmarks);
};
const controlBookmarks = function () {
  BookmarkView.render(model.state.bookmarks);
};
const controlAddRecipe = async function (newRecipe) {
  try {
    addRecipeView.renderSpinner();
    await model.uploadRecipe(newRecipe);
    recipeView.render(model.state.recipe);
    addRecipeView.renderMessage();
    BookmarkView.render(model.state.bookmarks);
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    setTimeout(function () {
      // addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error(`${err} :()`);
    addRecipeView.renderError(err.message);
  }
  // console.log(newRecipe);
};

const init = function () {
  BookmarkView.addHandlerRender(controlBookmarks);
  RecipeView.addHandlerRender(controlRecipes);
  RecipeView.addHandlerUpdateServings(controlServings);
  RecipeView.addHandlerAddBookmark(controlAddBookmark);
  SearchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  AddRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
