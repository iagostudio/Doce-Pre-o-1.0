import { Card, EmptyState, PageHeader, StatCard, Button, Badge } from '../components/UI.jsx';
import { calculateQuote, formatDate, labelTipoOrcamento, money } from '../utils/calculations.js';
import { formatStockQuantity, getLowStockItems, packagingName } from '../utils/stock.js';

export default function Dashboard({ database, onNavigate }) {
  const quotes = database.quotes || [];
  const totals = quotes.map((quote) => calculateQuote(quote, database));
  const receitaTotal = totals.reduce((sum, item) => sum + item.precoSugerido, 0);
  const lucroTotal = totals.reduce((sum, item) => sum + item.lucroEstimado, 0);
  const receitaMedia = quotes.length ? receitaTotal / quotes.length : 0;
  const fechados = quotes.filter((quote) => quote.status === 'Pedido fechado' || quote.status === 'Em produção' || quote.status === 'Entregue');
  const lowStock = getLowStockItems(database.ingredients || []);

  const proximasEntregas = [...quotes]
    .filter((quote) => quote.dataEntrega)
    .sort((a, b) => a.dataEntrega.localeCompare(b.dataEntrega))
    .slice(0, 5);

  const ultimos = [...quotes].reverse().slice(0, 5);

  return (
    <div className="page stack">
      <PageHeader
        title={`Olá, ${database.settings.nomeResponsavel || 'confeiteira'} 👋`}
        subtitle="Resumo rápido dos seus orçamentos, pedidos, entregas e estoque."
        action={<Button onClick={() => onNavigate('orcamento')}>Novo orçamento</Button>}
      />

      <div className="statsGrid">
        <StatCard label="Orçamentos feitos" value={quotes.length} hint="Total salvo no app" />
        <StatCard label="Pedidos fechados" value={fechados.length} hint="Fechado, produção ou entregue" />
        <StatCard label="Receita estimada" value={money(receitaTotal)} hint="Soma dos valores de venda" />
        <StatCard label="Receita média" value={money(receitaMedia)} hint="Ticket médio por orçamento" />
        <StatCard label="Lucro estimado" value={money(lucroTotal)} hint="Preço - custo total" />
        <StatCard label="Estoque baixo" value={lowStock.length} hint="Itens abaixo do mínimo" />
      </div>

      <div className="quickActions">
        <Button onClick={() => onNavigate('orcamento')}>🧾 Novo orçamento</Button>
        <Button variant="secondary" onClick={() => onNavigate('clientes')}>👥 Cadastrar cliente</Button>
        <Button variant="secondary" onClick={() => onNavigate('ingredientes')}>🥣 Ingredientes</Button>
        <Button variant="secondary" onClick={() => onNavigate('estoque')}>📊 Estoque</Button>
        <Button variant="secondary" onClick={() => onNavigate('receitas')}>🧁 Receitas/produtos</Button>
      </div>

      <div className="twoColumns">
        <Card>
          <div className="sectionTitle">
            <h3>Últimos orçamentos</h3>
            <button className="linkButton" onClick={() => onNavigate('pedidos')}>Ver todos</button>
          </div>

          {ultimos.length === 0 ? (
            <EmptyState
              title="Nenhum orçamento ainda"
              text="Crie o primeiro orçamento para começar a acompanhar receita e lucro."
              action={<Button onClick={() => onNavigate('orcamento')}>Criar orçamento</Button>}
            />
          ) : (
            <div className="list">
              {ultimos.map((quote) => {
                const calc = calculateQuote(quote, database);
                const client = database.clients.find((item) => item.id === quote.clienteId);
                return (
                  <div className="listItem" key={quote.id}>
                    <div>
                      <strong>{client?.nome || 'Cliente sem nome'}</strong>
                      <p>{labelTipoOrcamento(quote.tipoOrcamento)} • {quote.dataEntrega ? formatDate(quote.dataEntrega) : 'Sem entrega'}</p>
                    </div>
                    <div className="rightInfo">
                      <strong>{money(calc.precoSugerido)}</strong>
                      <Badge>{quote.status}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card>
          <div className="sectionTitle">
            <h3>Estoque baixo</h3>
            <button className="linkButton" onClick={() => onNavigate('estoque')}>Ver estoque</button>
          </div>

          {lowStock.length === 0 ? (
            <EmptyState title="Estoque em dia" text="Nenhum ingrediente está abaixo do mínimo." />
          ) : (
            <div className="list">
              {lowStock.slice(0, 5).map(({ ingredient, needed, packagesToBuy }) => (
                <div className="listItem" key={ingredient.id}>
                  <div>
                    <strong>{ingredient.nome}</strong>
                    <p>Comprar {needed.toLocaleString('pt-BR')} {ingredient.unidadeUso}</p>
                    <small>Sugestão: {packagesToBuy} {packagingName(ingredient)}{packagesToBuy === 1 ? '' : 's'} • Atual: {formatStockQuantity(ingredient)}</small>
                  </div>
                  <Badge tone="warning">Baixo</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card>
        <div className="sectionTitle">
          <h3>Próximas entregas</h3>
          <button className="linkButton" onClick={() => onNavigate('pedidos')}>Abrir agenda</button>
        </div>

        {proximasEntregas.length === 0 ? (
          <EmptyState title="Nenhuma entrega cadastrada" text="Quando salvar um orçamento com data, ele aparece aqui." />
        ) : (
          <div className="list">
            {proximasEntregas.map((quote) => {
              const client = database.clients.find((item) => item.id === quote.clienteId);
              return (
                <div className="listItem" key={quote.id}>
                  <div>
                    <strong>{client?.nome || 'Cliente sem nome'}</strong>
                    <p>{labelTipoOrcamento(quote.tipoOrcamento)} • {quote.horarioEntrega || 'sem horário'}</p>
                  </div>
                  <Badge tone="success">{formatDate(quote.dataEntrega)}</Badge>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
