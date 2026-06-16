import { useMemo, useState } from 'react';
import { Badge, Button, Card, EmptyState, Field, PageHeader, StatCard } from '../components/UI.jsx';
import { formatDate, money, numberValue } from '../utils/calculations.js';
import {
  formatStockQuantity,
  getLowStockItems,
  manualStockMovement,
  packagingName,
  registerPurchase,
  stockCurrent,
  stockMinimum,
  stockPackageEquivalent,
  stockStatus,
  stockValue
} from '../utils/stock.js';

const movementTypes = ['Saída manual', 'Perda/descarte', 'Entrada manual', 'Ajuste de estoque'];

export default function Stock({ database, updateDatabase, onNavigate }) {
  const ingredients = database.ingredients || [];
  const firstIngredient = ingredients[0]?.id || '';
  const [purchaseForm, setPurchaseForm] = useState({
    ingredientId: firstIngredient,
    packages: '',
    packagePrice: '',
    fornecedor: '',
    observacao: ''
  });
  const [movementForm, setMovementForm] = useState({
    ingredientId: firstIngredient,
    tipo: 'Saída manual',
    quantidade: '',
    descricao: ''
  });
  const [search, setSearch] = useState('');

  const lowStock = useMemo(() => getLowStockItems(ingredients), [ingredients]);
  const filteredIngredients = ingredients.filter((ingredient) => {
    const term = `${ingredient.nome} ${ingredient.marca} ${ingredient.categoria}`.toLowerCase();
    return term.includes(search.toLowerCase());
  });

  const selectedPurchaseIngredient = ingredients.find((item) => item.id === purchaseForm.ingredientId) || ingredients[0];
  const selectedMovementIngredient = ingredients.find((item) => item.id === movementForm.ingredientId) || ingredients[0];
  const purchaseBaseQuantity = selectedPurchaseIngredient
    ? numberValue(purchaseForm.packages) * numberValue(selectedPurchaseIngredient.quantidadeEmbalagem)
    : 0;

  function updatePurchase(field, value) {
    setPurchaseForm((current) => ({ ...current, [field]: value }));
  }

  function updateMovement(field, value) {
    setMovementForm((current) => ({ ...current, [field]: value }));
  }

  function submitPurchase(event) {
    event.preventDefault();
    if (!purchaseForm.ingredientId || !numberValue(purchaseForm.packages)) return;

    updateDatabase((db) => registerPurchase(db, purchaseForm));
    setPurchaseForm((current) => ({ ...current, packages: '', packagePrice: '', fornecedor: '', observacao: '' }));
  }

  function submitMovement(event) {
    event.preventDefault();
    if (!movementForm.ingredientId && ingredients.length) return;
    if (!numberValue(movementForm.quantidade) && movementForm.tipo !== 'Ajuste de estoque') return;

    updateDatabase((db) => manualStockMovement(db, movementForm));
    setMovementForm((current) => ({ ...current, quantidade: '', descricao: '' }));
  }

  return (
    <div className="page stack">
      <PageHeader
        title="Controle de estoque"
        subtitle="Registre compras, faça baixas, acompanhe estoque mínimo e gere lista de compras."
        action={<Button onClick={() => onNavigate('ingredientes')}>Cadastrar ingrediente</Button>}
      />

      <div className="statsGrid stockStats">
        <StatCard label="Ingredientes" value={ingredients.length} hint="Itens cadastrados" />
        <StatCard label="Estoque baixo" value={lowStock.length} hint="Abaixo do mínimo" />
        <StatCard label="Valor em estoque" value={money(stockValue(ingredients))} hint="Estimativa pelo preço atual" />
        <StatCard label="Movimentações" value={(database.stockMovements || []).length} hint="Entradas e saídas" />
      </div>

      <div className="twoColumns">
        <Card>
          <h3>Registrar compra</h3>
          <form className="formGrid compact" onSubmit={submitPurchase}>
            <Field label="Ingrediente">
              <select value={purchaseForm.ingredientId} onChange={(event) => updatePurchase('ingredientId', event.target.value)}>
                {ingredients.map((ingredient) => <option key={ingredient.id} value={ingredient.id}>{ingredient.nome} {ingredient.marca ? `• ${ingredient.marca}` : ''}</option>)}
              </select>
            </Field>
            <Field label={`Quantidade comprada (${selectedPurchaseIngredient ? packagingName(selectedPurchaseIngredient) : 'embalagem'})`}>
              <input type="number" step="0.01" value={purchaseForm.packages} onChange={(event) => updatePurchase('packages', event.target.value)} placeholder="Ex: 12" />
            </Field>
            <Field label="Preço unitário da embalagem">
              <input type="number" step="0.01" value={purchaseForm.packagePrice} onChange={(event) => updatePurchase('packagePrice', event.target.value)} placeholder="Ex: 6.70" />
            </Field>
            <Field label="Fornecedor/local">
              <input value={purchaseForm.fornecedor} onChange={(event) => updatePurchase('fornecedor', event.target.value)} placeholder="Ex: Supermercado BH" />
            </Field>
            <Field label="Observação">
              <input value={purchaseForm.observacao} onChange={(event) => updatePurchase('observacao', event.target.value)} placeholder="Ex: promoção" />
            </Field>
            <div className="formulaBox">
              <strong>Entrada calculada</strong>
              <p>{selectedPurchaseIngredient ? `${purchaseBaseQuantity.toLocaleString('pt-BR')} ${selectedPurchaseIngredient.unidadeUso}` : 'Selecione um ingrediente'}</p>
              <small>O app soma essa quantidade ao estoque e atualiza o preço da embalagem, se informado.</small>
            </div>
            <div className="formActions">
              <Button type="submit">Salvar compra</Button>
            </div>
          </form>
        </Card>

        <Card>
          <h3>Baixa ou ajuste manual</h3>
          <form className="formGrid compact" onSubmit={submitMovement}>
            <Field label="Ingrediente">
              <select value={movementForm.ingredientId} onChange={(event) => updateMovement('ingredientId', event.target.value)}>
                {ingredients.map((ingredient) => <option key={ingredient.id} value={ingredient.id}>{ingredient.nome} {ingredient.marca ? `• ${ingredient.marca}` : ''}</option>)}
              </select>
            </Field>
            <Field label="Tipo de movimentação">
              <select value={movementForm.tipo} onChange={(event) => updateMovement('tipo', event.target.value)}>
                {movementTypes.map((type) => <option key={type}>{type}</option>)}
              </select>
            </Field>
            <Field label={`${movementForm.tipo === 'Ajuste de estoque' ? 'Novo estoque' : 'Quantidade'} (${selectedMovementIngredient?.unidadeUso || ''})`}>
              <input type="number" step="0.01" value={movementForm.quantidade} onChange={(event) => updateMovement('quantidade', event.target.value)} placeholder="Ex: 395" />
            </Field>
            <Field label="Motivo/observação">
              <input value={movementForm.descricao} onChange={(event) => updateMovement('descricao', event.target.value)} placeholder="Ex: usado em teste, perda, correção..." />
            </Field>
            <div className="formulaBox">
              <strong>Estoque atual</strong>
              <p>{selectedMovementIngredient ? formatStockQuantity(selectedMovementIngredient) : 'Selecione um ingrediente'}</p>
              <small>Use ajuste para corrigir a quantidade real encontrada na cozinha.</small>
            </div>
            <div className="formActions">
              <Button type="submit">Salvar movimentação</Button>
            </div>
          </form>
        </Card>
      </div>

      <div className="twoColumns wideLeft">
        <Card>
          <div className="sectionTitle">
            <h3>Ingredientes em estoque</h3>
            <input className="searchInput" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar ingrediente" />
          </div>

          {filteredIngredients.length === 0 ? (
            <EmptyState title="Nenhum ingrediente encontrado" text="Cadastre ingredientes para controlar o estoque." />
          ) : (
            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>Ingrediente</th>
                    <th>Estoque atual</th>
                    <th>Estoque mínimo</th>
                    <th>Status</th>
                    <th>Embalagem</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIngredients.map((ingredient) => {
                    const status = stockStatus(ingredient);
                    return (
                      <tr key={ingredient.id}>
                        <td>
                          <strong>{ingredient.nome}</strong>
                          <small>{ingredient.marca || ingredient.categoria}</small>
                        </td>
                        <td>
                          {formatStockQuantity(ingredient)}
                          <small>{stockPackageEquivalent(ingredient).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} {packagingName(ingredient)}(s)</small>
                        </td>
                        <td>{stockMinimum(ingredient) ? formatStockQuantity(ingredient, stockMinimum(ingredient)) : 'Não definido'}</td>
                        <td><Badge tone={status.tone}>{status.label}</Badge></td>
                        <td>
                          {ingredient.quantidadeEmbalagem}{ingredient.unidadeUso}
                          <small>{packagingName(ingredient)}</small>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card>
          <h3>Lista de compras</h3>
          {lowStock.length === 0 ? (
            <EmptyState title="Estoque em dia" text="Nenhum ingrediente está abaixo do estoque mínimo." />
          ) : (
            <div className="list">
              {lowStock.map(({ ingredient, needed, packagesToBuy }) => (
                <div className="listItem" key={`buy_${ingredient.id}`}>
                  <div>
                    <strong>{ingredient.nome}</strong>
                    <p>Comprar: {needed.toLocaleString('pt-BR')} {ingredient.unidadeUso}</p>
                    <small>Sugestão: {packagesToBuy} {packagingName(ingredient)}{packagesToBuy === 1 ? '' : 's'} para voltar ao mínimo.</small>
                  </div>
                  <Badge tone="warning">Comprar</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card>
        <div className="sectionTitle">
          <h3>Histórico de movimentações</h3>
          <span className="muted">Últimas 20 alterações</span>
        </div>
        {(database.stockMovements || []).length === 0 ? (
          <EmptyState title="Nenhuma movimentação ainda" text="Compras, baixas e ajustes aparecerão aqui." />
        ) : (
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Ingrediente</th>
                  <th>Tipo</th>
                  <th>Quantidade</th>
                  <th>Descrição</th>
                </tr>
              </thead>
              <tbody>
                {(database.stockMovements || []).slice(0, 20).map((movement) => {
                  const ingredient = ingredients.find((item) => item.id === movement.ingredientId);
                  return (
                    <tr key={movement.id}>
                      <td>{formatDate(movement.data)}</td>
                      <td>{ingredient?.nome || 'Ingrediente removido'}</td>
                      <td>{movement.tipo}</td>
                      <td className={numberValue(movement.quantidade) < 0 ? 'negativeText' : 'positiveText'}>
                        {numberValue(movement.quantidade) > 0 ? '+' : ''}{numberValue(movement.quantidade).toLocaleString('pt-BR')} {ingredient?.unidadeUso || ''}
                      </td>
                      <td>{movement.descricao || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
