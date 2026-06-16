import { defaultSettings, seedIngredients, seedRecipes } from '../data/seed.js';

const KEY = 'docepreco_mvp_database_v1';

export function createId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function toNumber(value, fallback = 0) {
  const parsed = Number(String(value ?? '').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeIngredient(ingredient) {
  const quantidadeEmbalagem = toNumber(ingredient.quantidadeEmbalagem || ingredient.quantidadePorEmbalagem, 0);
  const tipoEmbalagem = ingredient.tipoEmbalagem || ingredient.marca || 'embalagem';

  return {
    ...ingredient,
    tipoEmbalagem,
    unidadeEstoque: ingredient.unidadeEstoque || tipoEmbalagem,
    quantidadeEmbalagem,
    estoqueAtual: toNumber(ingredient.estoqueAtual, 0),
    estoqueMinimo: toNumber(ingredient.estoqueMinimo, 0)
  };
}

function normalizeDatabase(database) {
  return {
    settings: { ...defaultSettings, ...(database?.settings || {}) },
    clients: database?.clients || [],
    ingredients: (database?.ingredients || seedIngredients).map(normalizeIngredient),
    recipes: database?.recipes || seedRecipes,
    quotes: database?.quotes || [],
    stockMovements: database?.stockMovements || []
  };
}

export function loadDatabase() {
  const saved = localStorage.getItem(KEY);
  if (saved) {
    try {
      return normalizeDatabase(JSON.parse(saved));
    } catch (error) {
      console.error('Erro ao ler banco local:', error);
    }
  }

  return normalizeDatabase({
    settings: defaultSettings,
    clients: [],
    ingredients: seedIngredients,
    recipes: seedRecipes,
    quotes: [],
    stockMovements: []
  });
}

export function saveDatabase(database) {
  localStorage.setItem(KEY, JSON.stringify(normalizeDatabase(database)));
}

export function resetDatabase() {
  localStorage.removeItem(KEY);
}
