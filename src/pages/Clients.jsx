import { useState } from 'react';
import { Button, Card, EmptyState, Field, PageHeader } from '../components/UI.jsx';
import { createId } from '../utils/storage.js';

const emptyClient = {
  nome: '',
  whatsapp: '',
  instagram: '',
  enderecoPadrao: '',
  observacoes: ''
};

export default function Clients({ database, updateDatabase }) {
  const [form, setForm] = useState(emptyClient);
  const [editingId, setEditingId] = useState(null);

  const clients = database.clients || [];

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function saveClient(event) {
    event.preventDefault();
    if (!form.nome.trim()) return;

    updateDatabase((db) => {
      if (editingId) {
        return {
          ...db,
          clients: db.clients.map((client) => client.id === editingId ? { ...form, id: editingId } : client)
        };
      }

      return {
        ...db,
        clients: [{ ...form, id: createId('cli') }, ...db.clients]
      };
    });

    setForm(emptyClient);
    setEditingId(null);
  }

  function editClient(client) {
    setForm(client);
    setEditingId(client.id);
  }

  function removeClient(id) {
    if (!confirm('Excluir este cliente?')) return;
    updateDatabase((db) => ({ ...db, clients: db.clients.filter((client) => client.id !== id) }));
  }

  return (
    <div className="page stack">
      <PageHeader
        title="Clientes"
        subtitle="Cadastre clientes para usar nos orçamentos e pedidos."
      />

      <div className="twoColumns wideLeft">
        <Card>
          <h3>{editingId ? 'Editar cliente' : 'Cadastrar cliente'}</h3>
          <form className="formGrid" onSubmit={saveClient}>
            <Field label="Nome do cliente">
              <input value={form.nome} onChange={(event) => updateField('nome', event.target.value)} placeholder="Ex: Maria Silva" />
            </Field>
            <Field label="WhatsApp">
              <input value={form.whatsapp} onChange={(event) => updateField('whatsapp', event.target.value)} placeholder="31999999999" />
            </Field>
            <Field label="Instagram">
              <input value={form.instagram} onChange={(event) => updateField('instagram', event.target.value)} placeholder="@cliente" />
            </Field>
            <Field label="Endereço padrão">
              <input value={form.enderecoPadrao} onChange={(event) => updateField('enderecoPadrao', event.target.value)} placeholder="Rua, número, bairro" />
            </Field>
            <Field label="Observações">
              <textarea value={form.observacoes} onChange={(event) => updateField('observacoes', event.target.value)} placeholder="Preferências, alergias, pontos de entrega..." />
            </Field>
            <div className="formActions">
              <Button type="submit">{editingId ? 'Salvar edição' : 'Cadastrar cliente'}</Button>
              {editingId && <Button type="button" variant="ghost" onClick={() => { setEditingId(null); setForm(emptyClient); }}>Cancelar</Button>}
            </div>
          </form>
        </Card>

        <Card>
          <h3>Clientes cadastrados</h3>
          {clients.length === 0 ? (
            <EmptyState title="Nenhum cliente cadastrado" text="Cadastre o primeiro cliente para usar nos pedidos." />
          ) : (
            <div className="list">
              {clients.map((client) => (
                <div className="listItem" key={client.id}>
                  <div>
                    <strong>{client.nome}</strong>
                    <p>{client.whatsapp || 'Sem WhatsApp'} {client.instagram ? `• ${client.instagram}` : ''}</p>
                    {client.enderecoPadrao && <small>{client.enderecoPadrao}</small>}
                  </div>
                  <div className="rowActions">
                    <button className="linkButton" onClick={() => editClient(client)}>Editar</button>
                    <button className="dangerButton" onClick={() => removeClient(client.id)}>Excluir</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
