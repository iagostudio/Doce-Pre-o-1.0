import { useMemo, useState } from 'react';
import { Badge, Button, Card, EmptyState, Field, PageHeader } from '../components/UI.jsx';
import { createId } from '../utils/storage.js';
import { money, numberValue, recipeIngredientCost, recipeLaborCost } from '../utils/calculations.js';

const recipeTypes = ['Massa', 'Recheio', 'Cobertura', 'Decoração', 'Embalagem', 'Docinho Gourmet', 'Extra'];

const emptyRecipe = {
  nome: '',
  tipo: 'Recheio',
  tamanhoPessoas: '',
  pesoUnidadeGramas: '',
  rendimentoUnidades: '',
  tempoPreparoHoras: '',
  ingredientes: []
};

export default function Recipes({ database, updateDatabase }) {
  const [form, setForm] = useState(emptyRecipe);
  const [editingId, setEditingId] = useState(null);
  const [typeFilter, setTypeFilter] = useState('Todos');

  const filteredRecipes = useMemo(() => {
    if (typeFilter === 'Todos') return database.recipes || [];
    return (database.recipes || []).filter((recipe) => recipe.tipo === typeFilter);
  }, [database.recipes, typeFilter]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function addIngredientLine() {
    setForm((current) => ({
      ...current,
      ingredientes: [...(current.ingredientes || []), { ingredienteId: database.ingredients[0]?.id || '', quantidade: '' }]
    }));
  }

  function updateIngredientLine(index, field, value) {
    setForm((current) => ({
      ...current,
      ingredientes: current.ingredientes.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item)
    }));
  }

  function removeIngredientLine(index) {
    setForm((current) => ({
      ...current,
      ingredientes: current.ingredientes.filter((_, itemIndex) => itemIndex !== index)
    }));
  }

  function saveRecipe(event) {
    event.preventDefault();
    if (!form.nome.trim()) return;

    const payload = {
      ...form,
      tamanhoPessoas: numberValue(form.tamanhoPessoas),
      pesoUnidadeGramas: numberValue(form.pesoUnidadeGramas),
      rendimentoUnidades: numberValue(form.rendimentoUnidades),
      tempoPreparoHoras: numberValue(form.tempoPreparoHoras),
      ingredientes: (form.ingredientes || []).filter((item) => item.ingredienteId && numberValue(item.quantidade) > 0).map((item) => ({
        ingredienteId: item.ingredienteId,
        quantidade: numberValue(item.quantidade)
      }))
    };

    updateDatabase((db) => {
      if (editingId) {
        return {
          ...db,
          recipes: db.recipes.map((recipe) => recipe.id === editingId ? { ...payload, id: editingId } : recipe)
        };
      }

      return {
        ...db,
        recipes: [{ ...payload, id: createId('rec') }, ...db.recipes]
      };
    });

    setForm(emptyRecipe);
    setEditingId(null);
  }

  function editRecipe(recipe) {
    setForm(recipe);
    setEditingId(recipe.id);
  }

  function removeRecipe(id) {
    if (!confirm('Excluir esta receita/produto?')) return;
    updateDatabase((db) => ({ ...db, recipes: db.recipes.filter((recipe) => recipe.id !== id) }));
  }

  const ingredientsCost = recipeIngredientCost(form, database.ingredients);
  const laborCost = recipeLaborCost(form, database.settings.custoHora);

  return (
    <div className="page stack">
      <PageHeader
        title="Receitas / Produtos"
        subtitle="Monte módulos reutilizáveis: massas, recheios, coberturas, decorações, embalagens e docinhos gourmet."
      />

      <div className="twoColumns wideLeft">
        <Card>
          <h3>{editingId ? 'Editar receita/produto' : 'Cadastrar receita/produto'}</h3>
          <form className="formGrid" onSubmit={saveRecipe}>
            <Field label="Nome">
              <input value={form.nome} onChange={(event) => updateField('nome', event.target.value)} placeholder="Ex: Recheio de Ninho" />
            </Field>
            <Field label="Tipo">
              <select value={form.tipo} onChange={(event) => updateField('tipo', event.target.value)}>
                {recipeTypes.map((type) => <option key={type}>{type}</option>)}
              </select>
            </Field>
            <Field label="Tamanho do bolo em pessoas">
              <input type="number" value={form.tamanhoPessoas} onChange={(event) => updateField('tamanhoPessoas', event.target.value)} placeholder="Ex: 50" />
            </Field>
            <Field label="Peso da unidade do docinho">
              <select value={form.pesoUnidadeGramas} onChange={(event) => updateField('pesoUnidadeGramas', event.target.value)}>
                <option value="">Não se aplica</option>
                <option value="12">12g</option>
                <option value="20">20g</option>
              </select>
            </Field>
            <Field label="Rendimento em unidades">
              <input type="number" value={form.rendimentoUnidades} onChange={(event) => updateField('rendimentoUnidades', event.target.value)} placeholder="Ex: 50 ou 100" />
            </Field>
            <Field label="Tempo de preparo em horas">
              <input type="number" step="0.1" value={form.tempoPreparoHoras} onChange={(event) => updateField('tempoPreparoHoras', event.target.value)} placeholder="Ex: 1.5" />
            </Field>

            <div className="fullWidth ingredientBuilder">
              <div className="sectionTitle">
                <h4>Ingredientes usados</h4>
                <Button type="button" variant="secondary" onClick={addIngredientLine}>Adicionar ingrediente</Button>
              </div>

              {(form.ingredientes || []).length === 0 ? (
                <p className="muted">Nenhum ingrediente adicionado ainda.</p>
              ) : (
                (form.ingredientes || []).map((item, index) => {
                  const ingredient = database.ingredients.find((ing) => ing.id === item.ingredienteId);
                  return (
                    <div className="ingredientLine" key={`${item.ingredienteId}_${index}`}>
                      <select value={item.ingredienteId} onChange={(event) => updateIngredientLine(index, 'ingredienteId', event.target.value)}>
                        <option value="">Selecione</option>
                        {database.ingredients.map((ingredientOption) => (
                          <option key={ingredientOption.id} value={ingredientOption.id}>{ingredientOption.nome} {ingredientOption.marca ? `• ${ingredientOption.marca}` : ''}</option>
                        ))}
                      </select>
                      <input type="number" step="0.01" value={item.quantidade} onChange={(event) => updateIngredientLine(index, 'quantidade', event.target.value)} placeholder={`Qtd ${ingredient?.unidadeUso || ''}`} />
                      <button type="button" className="dangerButton" onClick={() => removeIngredientLine(index)}>Remover</button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="formulaBox fullWidth">
              <strong>Prévia do custo</strong>
              <p>Ingredientes: {money(ingredientsCost)} • Mão de obra: {money(laborCost)} • Total: {money(ingredientsCost + laborCost)}</p>
              {form.tipo === 'Docinho Gourmet' && form.rendimentoUnidades ? (
                <small>Custo médio por unidade: {money((ingredientsCost + laborCost) / numberValue(form.rendimentoUnidades))}</small>
              ) : <small>O custo da mão de obra usa o valor/hora das configurações.</small>}
            </div>

            <div className="formActions">
              <Button type="submit">{editingId ? 'Salvar edição' : 'Cadastrar receita'}</Button>
              {editingId && <Button type="button" variant="ghost" onClick={() => { setEditingId(null); setForm(emptyRecipe); }}>Cancelar</Button>}
            </div>
          </form>
        </Card>

        <Card>
          <div className="sectionTitle">
            <h3>Receitas cadastradas</h3>
            <select className="compactSelect" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
              <option>Todos</option>
              {recipeTypes.map((type) => <option key={type}>{type}</option>)}
            </select>
          </div>

          {filteredRecipes.length === 0 ? (
            <EmptyState title="Nenhuma receita encontrada" text="Cadastre módulos para usar no orçamento." />
          ) : (
            <div className="list">
              {filteredRecipes.map((recipe) => {
                const ingredientCost = recipeIngredientCost(recipe, database.ingredients);
                const labor = recipeLaborCost(recipe, database.settings.custoHora);
                return (
                  <div className="listItem" key={recipe.id}>
                    <div>
                      <strong>{recipe.nome}</strong>
                      <p>
                        <Badge>{recipe.tipo}</Badge>
                        {recipe.tamanhoPessoas ? ` ${recipe.tamanhoPessoas} pessoas` : ''}
                        {recipe.pesoUnidadeGramas ? ` ${recipe.pesoUnidadeGramas}g` : ''}
                        {recipe.rendimentoUnidades ? ` • rende ${recipe.rendimentoUnidades} un.` : ''}
                      </p>
                      <small>Custo estimado: {money(ingredientCost + labor)}</small>
                    </div>
                    <div className="rowActions">
                      <button className="linkButton" onClick={() => editRecipe(recipe)}>Editar</button>
                      <button className="dangerButton" onClick={() => removeRecipe(recipe.id)}>Excluir</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
