import { useState } from 'react';
import { Badge, Button, Card, EmptyState, Field, PageHeader } from '../components/UI.jsx';
import { createId, todayISO } from '../utils/storage.js';
import { ingredientUnitCost, money, numberValue } from '../utils/calculations.js';
import { formatStockQuantity, stockStatus } from '../utils/stock.js';

const categories = [
  'Massas e farinhas',
  'Leites e derivados',
  'Chocolates',
  'Frutas',
  'Açúcares',
  'Recheios',
  'Coberturas',
  'Decoração',
  'Embalagens',
  'Topos de bolo',
  'Descartáveis',
  'Outros'
];

const units = ['g', 'kg', 'ml', 'L', 'unidade', 'caixa', 'pacote', 'bandeja'];
const packageTypes = ['caixa', 'pacote', 'bandeja', 'unidade', 'dúzia', 'barra', 'pote', 'garrafa', 'saco', 'rolo', 'outro'];

const emptyIngredient = {
  nome: '',
  marca: '',
  categoria: 'Outros',
  unidadeUso: 'g',
  precoEmbalagem: '',
  quantidadeEmbalagem: '',
  tipoEmbalagem: 'caixa',
  unidadeEstoque: 'caixa',
  estoqueAtual: '',
  estoqueMinimo: '',
  dataAtualizacao: todayISO(),
  observacao: ''
};

export default function Ingredients({ database, updateDatabase }) {
  const [form, setForm] = useState(emptyIngredient);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');

  const ingredients = (database.ingredients || []).filter((ingredient) => {
    const term = `${ingredient.nome} ${ingredient.marca} ${ingredient.categoria}`.toLowerCase();
    return term.includes(search.toLowerCase());
  });

  function updateField(field, value) {
    setForm((current) => {
      const next = { ...current, [field]: value };
      if (field === 'tipoEmbalagem' && !current.unidadeEstoque) next.unidadeEstoque = value;
      return next;
    });
  }

  function saveIngredient(event) {
    event.preventDefault();
    if (!form.nome.trim()) return;

    const payload = {
      ...form,
      precoEmbalagem: numberValue(form.precoEmbalagem),
      quantidadeEmbalagem: numberValue(form.quantidadeEmbalagem),
      estoqueAtual: numberValue(form.estoqueAtual),
      estoqueMinimo: numberValue(form.estoqueMinimo),
      tipoEmbalagem: form.tipoEmbalagem || 'embalagem',
      unidadeEstoque: form.unidadeEstoque || form.tipoEmbalagem || 'embalagem',
      dataAtualizacao: form.dataAtualizacao || todayISO()
    };

    updateDatabase((db) => {
      if (editingId) {
        return {
          ...db,
          ingredients: db.ingredients.map((ingredient) => ingredient.id === editingId ? { ...payload, id: editingId } : ingredient)
        };
      }

      return {
        ...db,
        ingredients: [{ ...payload, id: createId('ing') }, ...db.ingredients]
      };
    });

    setForm(emptyIngredient);
    setEditingId(null);
  }

  function editIngredient(ingredient) {
    setForm({
      ...emptyIngredient,
      ...ingredient,
      tipoEmbalagem: ingredient.tipoEmbalagem || 'embalagem',
      unidadeEstoque: ingredient.unidadeEstoque || ingredient.tipoEmbalagem || 'embalagem',
      estoqueAtual: ingredient.estoqueAtual ?? '',
      estoqueMinimo: ingredient.estoqueMinimo ?? ''
    });
    setEditingId(ingredient.id);
  }

  function removeIngredient(id) {
    if (!confirm('Excluir este ingrediente? Receitas que usam ele podem ficar incompletas.')) return;
    updateDatabase((db) => ({ ...db, ingredients: db.ingredients.filter((ingredient) => ingredient.id !== id) }));
  }

  const previewCost = ingredientUnitCost(form);
  const previewPackages = numberValue(form.quantidadeEmbalagem)
    ? numberValue(form.estoqueAtual) / numberValue(form.quantidadeEmbalagem)
    : 0;

  return (
    <div className="page stack">
      <PageHeader
        title="Ingredientes"
        subtitle="Cadastre preço, embalagem e estoque. O app calcula custo por uso e acompanha o que está acabando."
      />

      <div className="twoColumns wideLeft">
        <Card>
          <h3>{editingId ? 'Editar ingrediente' : 'Cadastrar ingrediente'}</h3>
          <form className="formGrid" onSubmit={saveIngredient}>
            <Field label="Nome do ingrediente">
              <input value={form.nome} onChange={(event) => updateField('nome', event.target.value)} placeholder="Ex: Leite condensado" />
            </Field>
            <Field label="Marca">
              <input value={form.marca} onChange={(event) => updateField('marca', event.target.value)} placeholder="Ex: Semil" />
            </Field>
            <Field label="Categoria">
              <select value={form.categoria} onChange={(event) => updateField('categoria', event.target.value)}>
                {categories.map((category) => <option key={category}>{category}</option>)}
              </select>
            </Field>
            <Field label="Unidade usada nas receitas">
              <select value={form.unidadeUso} onChange={(event) => updateField('unidadeUso', event.target.value)}>
                {units.map((unit) => <option key={unit}>{unit}</option>)}
              </select>
            </Field>
            <Field label="Tipo de embalagem">
              <select value={form.tipoEmbalagem} onChange={(event) => updateField('tipoEmbalagem', event.target.value)}>
                {packageTypes.map((type) => <option key={type}>{type}</option>)}
              </select>
            </Field>
            <Field label="Unidade de estoque">
              <input value={form.unidadeEstoque} onChange={(event) => updateField('unidadeEstoque', event.target.value)} placeholder="Ex: caixa, bandeja, pacote" />
            </Field>
            <Field label="Preço da embalagem">
              <input type="number" step="0.01" value={form.precoEmbalagem} onChange={(event) => updateField('precoEmbalagem', event.target.value)} placeholder="6.70" />
            </Field>
            <Field label={`Quantidade por embalagem (${form.unidadeUso})`}>
              <input type="number" step="0.01" value={form.quantidadeEmbalagem} onChange={(event) => updateField('quantidadeEmbalagem', event.target.value)} placeholder="395" />
            </Field>
            <Field label={`Estoque atual (${form.unidadeUso})`}>
              <input type="number" step="0.01" value={form.estoqueAtual} onChange={(event) => updateField('estoqueAtual', event.target.value)} placeholder="Ex: 3950" />
            </Field>
            <Field label={`Estoque mínimo (${form.unidadeUso})`}>
              <input type="number" step="0.01" value={form.estoqueMinimo} onChange={(event) => updateField('estoqueMinimo', event.target.value)} placeholder="Ex: 790" />
            </Field>
            <Field label="Última atualização">
              <input type="date" value={form.dataAtualizacao} onChange={(event) => updateField('dataAtualizacao', event.target.value)} />
            </Field>
            <Field label="Observação">
              <textarea value={form.observacao} onChange={(event) => updateField('observacao', event.target.value)} placeholder="Ex: preço em promoção, mercado, marca preferida..." />
            </Field>

            <div className="formulaBox">
              <strong>Custo e estoque automático</strong>
              <p>{previewCost ? `${money(previewCost)} por ${form.unidadeUso}` : 'Preencha preço e quantidade.'}</p>
              <small>
                {numberValue(form.estoqueAtual) && numberValue(form.quantidadeEmbalagem)
                  ? `Estoque atual equivale a aproximadamente ${previewPackages.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} ${form.unidadeEstoque || form.tipoEmbalagem}.`
                  : 'Exemplo: 10 caixas de leite condensado = 3.950g em estoque.'}
              </small>
            </div>

            <div className="formActions">
              <Button type="submit">{editingId ? 'Salvar edição' : 'Cadastrar ingrediente'}</Button>
              {editingId && <Button type="button" variant="ghost" onClick={() => { setEditingId(null); setForm(emptyIngredient); }}>Cancelar</Button>}
            </div>
          </form>
        </Card>

        <Card>
          <div className="sectionTitle">
            <h3>Lista de ingredientes</h3>
            <input className="searchInput" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar ingrediente" />
          </div>

          {ingredients.length === 0 ? (
            <EmptyState title="Nenhum ingrediente encontrado" text="Cadastre farinha, leite condensado, morango, chocolate, embalagens e topos." />
          ) : (
            <div className="list">
              {ingredients.map((ingredient) => {
                const status = stockStatus(ingredient);
                return (
                  <div className="listItem" key={ingredient.id}>
                    <div>
                      <strong>{ingredient.nome} {ingredient.marca ? `• ${ingredient.marca}` : ''}</strong>
                      <p>{money(ingredient.precoEmbalagem)} / {ingredient.quantidadeEmbalagem}{ingredient.unidadeUso} • {ingredient.tipoEmbalagem || 'embalagem'}</p>
                      <small>{ingredient.categoria} • custo: {money(ingredientUnitCost(ingredient))}/{ingredient.unidadeUso}</small>
                      <small>Estoque: {formatStockQuantity(ingredient)} • mínimo: {formatStockQuantity(ingredient, ingredient.estoqueMinimo)}</small>
                    </div>
                    <div className="rowActions">
                      <Badge tone={status.tone}>{status.label}</Badge>
                      <button className="linkButton" onClick={() => editIngredient(ingredient)}>Editar</button>
                      <button className="dangerButton" onClick={() => removeIngredient(ingredient.id)}>Excluir</button>
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
