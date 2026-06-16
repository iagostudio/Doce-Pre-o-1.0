import { getQuoteIngredientUsage, numberValue } from './calculations.js';
import { createId, todayISO } from './storage.js';

export function packagingName(ingredient) {
  return ingredient?.tipoEmbalagem || ingredient?.unidadeEstoque || 'embalagem';
}

export function stockCurrent(ingredient) {
  return numberValue(ingredient?.estoqueAtual);
}

export function stockMinimum(ingredient) {
  return numberValue(ingredient?.estoqueMinimo);
}

export function stockPackageEquivalent(ingredient, quantity = stockCurrent(ingredient)) {
  const packageQty = numberValue(ingredient?.quantidadeEmbalagem);
  if (!packageQty) return 0;
  return numberValue(quantity) / packageQty;
}

export function formatStockQuantity(ingredient, quantity = stockCurrent(ingredient)) {
  const baseQty = numberValue(quantity);
  const unit = ingredient?.unidadeUso || '';
  const packageQty = numberValue(ingredient?.quantidadeEmbalagem);
  const packageLabel = packagingName(ingredient);

  if (!packageQty) {
    return `${baseQty.toLocaleString('pt-BR')} ${unit}`.trim();
  }

  const packages = baseQty / packageQty;
  const rounded = Number.isInteger(packages) ? packages : Number(packages.toFixed(2));
  return `${baseQty.toLocaleString('pt-BR')} ${unit} • ${rounded.toLocaleString('pt-BR')} ${packageLabel}${rounded === 1 ? '' : 's'}`.trim();
}

export function stockStatus(ingredient) {
  const current = stockCurrent(ingredient);
  const minimum = stockMinimum(ingredient);

  if (!minimum) return { label: 'Sem mínimo', tone: 'neutral' };
  if (current <= 0) return { label: 'Sem estoque', tone: 'danger' };
  if (current < minimum) return { label: 'Estoque baixo', tone: 'warning' };
  return { label: 'OK', tone: 'success' };
}

export function getLowStockItems(ingredients = []) {
  return ingredients
    .filter((ingredient) => stockMinimum(ingredient) > 0 && stockCurrent(ingredient) < stockMinimum(ingredient))
    .map((ingredient) => {
      const needed = Math.max(stockMinimum(ingredient) - stockCurrent(ingredient), 0);
      const packageQty = numberValue(ingredient.quantidadeEmbalagem);
      const packagesToBuy = packageQty ? Math.ceil(needed / packageQty) : 0;
      return { ingredient, needed, packagesToBuy };
    });
}

export function stockValue(ingredients = []) {
  return ingredients.reduce((sum, ingredient) => {
    const packageQty = numberValue(ingredient.quantidadeEmbalagem);
    const unitCost = packageQty ? numberValue(ingredient.precoEmbalagem) / packageQty : 0;
    return sum + stockCurrent(ingredient) * unitCost;
  }, 0);
}

export function registerPurchase(db, { ingredientId, packages, packagePrice, fornecedor, observacao }) {
  const ingredient = db.ingredients.find((item) => item.id === ingredientId);
  if (!ingredient) return db;

  const packageQty = numberValue(ingredient.quantidadeEmbalagem);
  const packagesNumber = numberValue(packages);
  const quantityToAdd = packagesNumber * packageQty;
  const priceNumber = numberValue(packagePrice);
  const date = todayISO();

  return {
    ...db,
    ingredients: db.ingredients.map((item) => {
      if (item.id !== ingredientId) return item;
      return {
        ...item,
        estoqueAtual: stockCurrent(item) + quantityToAdd,
        precoEmbalagem: priceNumber || item.precoEmbalagem,
        dataAtualizacao: date
      };
    }),
    stockMovements: [
      {
        id: createId('mov'),
        ingredientId,
        tipo: 'Entrada de compra',
        quantidade: quantityToAdd,
        data: date,
        descricao: `${packagesNumber} ${packagingName(ingredient)}${packagesNumber === 1 ? '' : 's'} comprada(s)${fornecedor ? ` • ${fornecedor}` : ''}${observacao ? ` • ${observacao}` : ''}`,
        valorUnitarioEmbalagem: priceNumber || ingredient.precoEmbalagem
      },
      ...(db.stockMovements || [])
    ]
  };
}

export function manualStockMovement(db, { ingredientId, tipo, quantidade, descricao }) {
  const ingredient = db.ingredients.find((item) => item.id === ingredientId);
  if (!ingredient) return db;

  const qty = numberValue(quantidade);
  const date = todayISO();
  const isAdjustment = tipo === 'Ajuste de estoque';
  const signedQty = tipo === 'Entrada manual' ? qty : -qty;
  const newStock = isAdjustment ? qty : stockCurrent(ingredient) + signedQty;
  const movementQty = isAdjustment ? newStock - stockCurrent(ingredient) : signedQty;

  return {
    ...db,
    ingredients: db.ingredients.map((item) => item.id === ingredientId ? { ...item, estoqueAtual: newStock } : item),
    stockMovements: [
      {
        id: createId('mov'),
        ingredientId,
        tipo,
        quantidade: movementQty,
        data: date,
        descricao: descricao || tipo
      },
      ...(db.stockMovements || [])
    ]
  };
}

export function deductStockForQuote(db, quoteId) {
  const quote = (db.quotes || []).find((item) => item.id === quoteId);
  if (!quote || quote.estoqueBaixado) return db;

  const usage = getQuoteIngredientUsage(quote, db);
  if (!usage.length) {
    return {
      ...db,
      quotes: db.quotes.map((item) => item.id === quoteId ? { ...item, estoqueBaixado: true, dataBaixaEstoque: todayISO() } : item)
    };
  }

  const date = todayISO();
  const client = (db.clients || []).find((item) => item.id === quote.clienteId);
  const movements = usage.map((item) => ({
    id: createId('mov'),
    ingredientId: item.ingredientId,
    tipo: 'Saída por pedido',
    quantidade: -numberValue(item.quantidade),
    data: date,
    quoteId,
    descricao: `Baixa automática${client?.nome ? ` • ${client.nome}` : ''}`
  }));

  return {
    ...db,
    ingredients: db.ingredients.map((ingredient) => {
      const used = usage.find((item) => item.ingredientId === ingredient.id);
      if (!used) return ingredient;
      return {
        ...ingredient,
        estoqueAtual: stockCurrent(ingredient) - numberValue(used.quantidade)
      };
    }),
    quotes: db.quotes.map((item) => item.id === quoteId ? { ...item, estoqueBaixado: true, dataBaixaEstoque: date } : item),
    stockMovements: [...movements, ...(db.stockMovements || [])]
  };
}
