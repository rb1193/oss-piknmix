import AuthenticatedRequest from "../lib/AuthenticatedRequest"
import RecipeModel from "./RecipeModel"
import ApiResource from "../lib/ApiResource"
import RecipeSearch from "./RecipeSearch"
import RecipeEventEmitter from './RecipeEvents'
import ModelCollection from '../lib/ModelCollection'

async function store(req: AuthenticatedRequest) {
    const recipe = await req.user.$relatedQuery<RecipeModel>('recipes').insert(req.body)
    RecipeEventEmitter.emit('created', recipe)
    return ApiResource.item(recipe)
}

async function list(req: AuthenticatedRequest) {
    const hits = await RecipeSearch.byFulltext(req.query.query || '', req.user)
    const perPage = 10
    const recipes = await req.user.$relatedQuery<RecipeModel>('recipes').findByIds(hits.map((hit) => hit.id))
    const paginatedRecipes = ModelCollection.page(ModelCollection.sortBySearchScore(recipes, hits), perPage, req.query.page || 1)
    return ApiResource.paginatedCollection<RecipeModel>(paginatedRecipes, perPage, req.query.page)
}

async function show(req: AuthenticatedRequest) {
    const recipe = await req.user.$relatedQuery<RecipeModel>('recipes').findById(req.params.recipe).throwIfNotFound()
    return ApiResource.item(recipe)
}

async function update(req: AuthenticatedRequest) {
    const recipe = await req.user.$relatedQuery<RecipeModel>('recipes')
        .updateAndFetchById(req.params.recipe, req.body)
        .throwIfNotFound()
    RecipeEventEmitter.emit('updated', recipe)
    return ApiResource.item(recipe)
}

async function remove(req: AuthenticatedRequest) {
    const recipeId = await req.user.$relatedQuery('recipes').deleteById(req.params.recipe).throwIfNotFound()
    RecipeEventEmitter.emit('deleted', recipeId)
    return null
}

const RecipesController = {
    store: store,
    list: list,
    show: show,
    update: update,
    remove: remove,
}

export default RecipesController