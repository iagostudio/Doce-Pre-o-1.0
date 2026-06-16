import { Badge, Button, Card, EmptyState, PageHeader } from '../components/UI.jsx';
import { calculateQuote, formatDate, labelTipoOrcamento, money } from '../utils/calculations.js';
import { deductStockForQuote } from '../utils/stock.js';

const statuses = ['Orçamento enviado', 'Aguardando pagamento', 'Pedido fechado', 'Em produção', 'Entregue', 'Cancelado'];

export default function Orders({ database, updateDatabase, onNavigate }) {
  const quotes = database.quotes || [];

  function updateStatus(id, status) {
    updateDatabase((db) => {
      const previous = db.quotes.find((quote) => quote.id === id);
      let next = {
        ...db,
        quotes: db.quotes.map((quote) => quote.id === id ? { ...quote, status } : quote)
      };

      if (status === 'Pedido fechado' && previous?.status !== 'Pedido fechado' && !previous?.estoqueBaixado) {
        next = deductStockForQuote(next, id);
      }

      return next;
    });
  }

  function deductQuoteStock(id) {
    updateDatabase((db) => deductStockForQuote(db, id));
  }

  function removeQuote(id) {
    if (!confirm('Excluir este orçamento?')) return;
    updateDatabase((db) => ({ ...db, quotes: db.quotes.filter((quote) => quote.id !== id) }));
  }

  return (
    <div className="page stack">
      <PageHeader
        title="Pedidos e histórico"
        subtitle="Acompanhe orçamentos enviados, pedidos fechados, produção, entregas e baixa automática de estoque."
        action={<Button onClick={() => onNavigate('orcamento')}>Novo orçamento</Button>}
      />

      <Card>
        {quotes.length === 0 ? (
          <EmptyState
            title="Nenhum orçamento salvo"
            text="Monte um orçamento e salve para ele aparecer aqui."
            action={<Button onClick={() => onNavigate('orcamento')}>Criar primeiro orçamento</Button>}
          />
        ) : (
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Tipo</th>
                  <th>Entrega</th>
                  <th>Valor</th>
                  <th>Lucro</th>
                  <th>Status</th>
                  <th>Estoque</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((quote) => {
                  const client = database.clients.find((item) => item.id === quote.clienteId);
                  const calc = calculateQuote(quote, database);
                  return (
                    <tr key={quote.id}>
                      <td>
                        <strong>{client?.nome || 'Cliente sem nome'}</strong>
                        <small>{client?.whatsapp || ''}</small>
                      </td>
                      <td>{labelTipoOrcamento(quote.tipoOrcamento)}</td>
                      <td>{quote.dataEntrega ? `${formatDate(quote.dataEntrega)} ${quote.horarioEntrega || ''}` : 'Sem data'}</td>
                      <td>{money(calc.precoSugerido)}</td>
                      <td>{money(calc.lucroEstimado)}</td>
                      <td>
                        <select value={quote.status} onChange={(event) => updateStatus(quote.id, event.target.value)}>
                          {statuses.map((status) => <option key={status}>{status}</option>)}
                        </select>
                      </td>
                      <td>
                        {quote.estoqueBaixado ? (
                          <Badge tone="success">Baixado</Badge>
                        ) : (
                          <button className="linkButton" onClick={() => deductQuoteStock(quote.id)}>Dar baixa</button>
                        )}
                        {quote.dataBaixaEstoque && <small>{formatDate(quote.dataBaixaEstoque)}</small>}
                      </td>
                      <td>
                        <button className="dangerButton" onClick={() => removeQuote(quote.id)}>Excluir</button>
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
        <h3>Agenda rápida</h3>
        <div className="list">
          {quotes.filter((quote) => quote.dataEntrega).sort((a, b) => a.dataEntrega.localeCompare(b.dataEntrega)).map((quote) => {
            const client = database.clients.find((item) => item.id === quote.clienteId);
            return (
              <div className="listItem" key={`agenda_${quote.id}`}>
                <div>
                  <strong>{formatDate(quote.dataEntrega)} {quote.horarioEntrega || ''}</strong>
                  <p>{client?.nome || 'Cliente'} • {labelTipoOrcamento(quote.tipoOrcamento)}</p>
                  <small>{quote.estoqueBaixado ? 'Estoque já baixado automaticamente.' : 'Estoque ainda não baixado.'}</small>
                </div>
                <Badge>{quote.status}</Badge>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
