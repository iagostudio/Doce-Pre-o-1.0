export function money(value) {
  const number = Number.isFinite(Number(value)) ? Number(value) : 0;
  return number.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

export function numberValue(value) {
  const parsed = Number(String(value ?? '').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function ingredientUnitCost(ingredient) {
  const qty = numberValue(ingredient.quantidadeEmbalagem);
  if (!qty) return 0;
  return numberValue(ingredient.precoEmbalagem) / qty;
}

export function recipeIngredientCost(recipe, ingredients) {
  if (!recipe) return 0;

  return (recipe.ingredientes || []).reduce((sum, item) => {
    const ingredient = ingredients.find((ing) => ing.id === item.ingredienteId);
    if (!ingredient) return sum;
    return sum + ingredientUnitCost(ingredient) * numberValue(item.quantidade);
  }, 0);
}

export function recipeLaborCost(recipe, custoHora, factor = 1) {
  if (!recipe) return 0;
  return numberValue(recipe.tempoPreparoHoras) * numberValue(custoHora) * factor;
}

export function recipeTotalCost(recipe, ingredients, custoHora, factor = 1) {
  const ingredientsCost = recipeIngredientCost(recipe, ingredients) * factor;
  const laborCost = recipeLaborCost(recipe, custoHora, factor);
  return {
    ingredientsCost,
    laborCost,
    total: ingredientsCost + laborCost
  };
}

export function docinhoItemCost(recipe, ingredients, custoHora, quantity) {
  if (!recipe) {
    return { ingredientsCost: 0, laborCost: 0, total: 0, unitCost: 0 };
  }

  const rendimento = numberValue(recipe.rendimentoUnidades) || 1;
  const qty = numberValue(quantity);
  const factor = qty / rendimento;
  const base = recipeTotalCost(recipe, ingredients, custoHora, factor);

  return {
    ...base,
    unitCost: qty ? base.total / qty : 0
  };
}


export function getQuoteIngredientUsage(quote, database) {
  const recipes = database.recipes || [];
  const ingredients = database.ingredients || [];
  const usageMap = new Map();

  function addIngredient(ingredientId, quantity, source) {
    if (!ingredientId || !numberValue(quantity)) return;
    const ingredient = ingredients.find((item) => item.id === ingredientId);
    const current = usageMap.get(ingredientId) || {
      ingredientId,
      nome: ingredient?.nome || 'Ingrediente removido',
      marca: ingredient?.marca || '',
      unidadeUso: ingredient?.unidadeUso || '',
      quantidade: 0,
      fontes: []
    };

    current.quantidade += numberValue(quantity);
    if (source) current.fontes.push(source);
    usageMap.set(ingredientId, current);
  }

  function addRecipeUsage(recipeId, source, factor = 1) {
    const recipe = recipes.find((item) => item.id === recipeId);
    if (!recipe) return;
    (recipe.ingredientes || []).forEach((item) => {
      addIngredient(item.ingredienteId, numberValue(item.quantidade) * numberValue(factor || 1), source || recipe.nome);
    });
  }

  if (quote?.tipoOrcamento === 'bolo' || quote?.tipoOrcamento === 'combo') {
    addRecipeUsage(quote.bolo?.massaId, 'Massa');
    addRecipeUsage(quote.bolo?.coberturaId, 'Cobertura');
    addRecipeUsage(quote.bolo?.embalagemId, 'Embalagem');

    (quote.bolo?.recheios || []).forEach((item, index) => {
      const factor = Math.max(numberValue(item.percentual), 0) / 100 || 1;
      addRecipeUsage(item.recipeId, `Recheio ${index + 1}`, factor);
    });

    (quote.bolo?.extras || []).forEach((id) => addRecipeUsage(id, 'Extra/Decoração'));
  }

  if (quote?.tipoOrcamento === 'docinhos' || quote?.tipoOrcamento === 'combo') {
    (quote.docinhos || []).forEach((item) => {
      const recipe = recipes.find((recipeItem) => recipeItem.id === item.recipeId);
      if (!recipe) return;
      const rendimento = numberValue(recipe.rendimentoUnidades) || 1;
      const factor = numberValue(item.quantidade) / rendimento;
      addRecipeUsage(item.recipeId, `${item.quantidade || 0} docinhos`, factor);
    });

    addRecipeUsage(quote.embalagemDocinhosId, 'Embalagem docinhos');
  }

  return Array.from(usageMap.values()).sort((a, b) => a.nome.localeCompare(b.nome));
}

export function calculateQuote(quote, database) {
  const settings = database.settings;
  const ingredients = database.ingredients;
  const recipes = database.recipes;
  const custoHora = numberValue(settings.custoHora);

  let custoIngredientes = 0;
  let custoMaoObra = 0;
  const breakdown = [];

  const addRecipe = (recipeId, label, factor = 1) => {
    const recipe = recipes.find((item) => item.id === recipeId);
    if (!recipe) return;
    const cost = recipeTotalCost(recipe, ingredients, custoHora, factor);
    custoIngredientes += cost.ingredientsCost;
    custoMaoObra += cost.laborCost;
    breakdown.push({
      label,
      nome: recipe.nome,
      tipo: recipe.tipo,
      factor,
      custoIngredientes: cost.ingredientsCost,
      custoMaoObra: cost.laborCost,
      total: cost.total
    });
  };

  if (quote.tipoOrcamento === 'bolo' || quote.tipoOrcamento === 'combo') {
    addRecipe(quote.bolo?.massaId, 'Massa');
    addRecipe(quote.bolo?.coberturaId, 'Cobertura');
    addRecipe(quote.bolo?.embalagemId, 'Embalagem');

    (quote.bolo?.recheios || []).forEach((item, index) => {
      const factor = Math.max(numberValue(item.percentual), 0) / 100;
      addRecipe(item.recipeId, `Recheio ${index + 1} (${numberValue(item.percentual)}%)`, factor || 1);
    });

    (quote.bolo?.extras || []).forEach((id) => {
      addRecipe(id, 'Extra/Decoração');
    });
  }

  if (quote.tipoOrcamento === 'docinhos' || quote.tipoOrcamento === 'combo') {
    (quote.docinhos || []).forEach((item) => {
      const recipe = recipes.find((recipeItem) => recipeItem.id === item.recipeId);
      if (!recipe) return;
      const cost = docinhoItemCost(recipe, ingredients, custoHora, item.quantidade);
      custoIngredientes += cost.ingredientsCost;
      custoMaoObra += cost.laborCost;
      breakdown.push({
        label: `${item.quantidade || 0} un.`,
        nome: `${recipe.nome} ${recipe.pesoUnidadeGramas || ''}g`,
        tipo: 'Docinho Gourmet',
        factor: numberValue(item.quantidade) / (numberValue(recipe.rendimentoUnidades) || 1),
        custoIngredientes: cost.ingredientsCost,
        custoMaoObra: cost.laborCost,
        total: cost.total
      });
    });

    addRecipe(quote.embalagemDocinhosId, 'Embalagem docinhos');
  }

  const taxaEntrega = numberValue(quote.taxaEntrega);
  const outrosCustos = numberValue(quote.outrosCustos);
  const desconto = numberValue(quote.desconto);
  const margemLucro = numberValue(quote.margemLucro ?? settings.margemPadrao);
  const custoTotal = custoIngredientes + custoMaoObra + taxaEntrega + outrosCustos;
  const precoSugerido = Math.max(custoTotal * (1 + margemLucro / 100) - desconto, 0);
  const lucroEstimado = precoSugerido - custoTotal;
  const receitaLiquida = precoSugerido;

  return {
    custoIngredientes,
    custoMaoObra,
    taxaEntrega,
    outrosCustos,
    desconto,
    custoTotal,
    margemLucro,
    precoSugerido,
    lucroEstimado,
    receitaLiquida,
    breakdown
  };
}

export function createWhatsAppMessage(quote, database, totals) {
  const client = database.clients.find((item) => item.id === quote.clienteId);
  const settings = database.settings;
  const lines = [];

  lines.push(`*Orçamento personalizado - ${settings.nomeConfeitaria || 'Confeitaria'}*`);
  lines.push('');
  if (client?.nome) lines.push(`Cliente: ${client.nome}`);
  if (quote.dataEntrega) lines.push(`Entrega: ${formatDate(quote.dataEntrega)}${quote.horarioEntrega ? ` às ${quote.horarioEntrega}` : ''}`);
  if (quote.tipoOrcamento) lines.push(`Tipo: ${labelTipoOrcamento(quote.tipoOrcamento)}`);
  lines.push('');

  if (quote.tipoOrcamento === 'bolo' || quote.tipoOrcamento === 'combo') {
    const massa = findRecipeName(database, quote.bolo?.massaId);
    const cobertura = findRecipeName(database, quote.bolo?.coberturaId);
    const recheios = (quote.bolo?.recheios || [])
      .map((item) => `${findRecipeName(database, item.recipeId)} (${item.percentual || 100}%)`)
      .filter(Boolean)
      .join(', ');
    const extras = (quote.bolo?.extras || [])
      .map((id) => findRecipeName(database, id))
      .filter(Boolean)
      .join(', ');

    lines.push('*Bolo*');
    if (quote.bolo?.tamanhoPessoas) lines.push(`Tamanho: ${quote.bolo.tamanhoPessoas} pessoas`);
    if (quote.tema) lines.push(`Tema: ${quote.tema}`);
    if (massa) lines.push(`Massa: ${massa}`);
    if (recheios) lines.push(`Recheios: ${recheios}`);
    if (cobertura) lines.push(`Cobertura: ${cobertura}`);
    if (extras) lines.push(`Decoração/extras: ${extras}`);
    lines.push('');
  }

  if (quote.tipoOrcamento === 'docinhos' || quote.tipoOrcamento === 'combo') {
    lines.push('*Docinhos gourmet*');
    (quote.docinhos || []).forEach((item) => {
      const recipe = database.recipes.find((rec) => rec.id === item.recipeId);
      if (recipe) lines.push(`- ${item.quantidade} un. de ${recipe.nome} ${recipe.pesoUnidadeGramas || ''}g`);
    });
    lines.push('');
  }

  if (quote.observacoes) {
    lines.push(`Observações: ${quote.observacoes}`);
    lines.push('');
  }

  lines.push(`*Valor total: ${money(totals.precoSugerido)}*`);
  if (settings.percentualSinal) {
    lines.push(`Sinal para reserva: ${settings.percentualSinal}% (${money(totals.precoSugerido * numberValue(settings.percentualSinal) / 100)})`);
  }
  if (settings.validadeOrcamentoDias) {
    lines.push(`Validade do orçamento: ${settings.validadeOrcamentoDias} dias.`);
  }
  if (settings.mensagemPadrao) lines.push(settings.mensagemPadrao);

  return lines.join('\n');
}

export function findRecipeName(database, recipeId) {
  return database.recipes.find((item) => item.id === recipeId)?.nome || '';
}

export function formatDate(dateString) {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

export function labelTipoOrcamento(tipo) {
  const labels = {
    bolo: 'Bolo',
    docinhos: 'Docinhos gourmet',
    combo: 'Bolo + Docinhos'
  };
  return labels[tipo] || tipo;
}
