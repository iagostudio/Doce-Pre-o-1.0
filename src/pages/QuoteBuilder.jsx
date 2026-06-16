import { useMemo, useState } from 'react';
import { Badge, Button, Card, EmptyState, Field, PageHeader, StatCard } from '../components/UI.jsx';
import { calculateQuote, createWhatsAppMessage, money, numberValue } from '../utils/calculations.js';
import { createId, todayISO } from '../utils/storage.js';
import { deductStockForQuote } from '../utils/stock.js';


function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function hexWithAlpha(hex, alpha) {
  const safeHex = /^#[0-9A-Fa-f]{6}$/.test(hex || '') ? hex : '#c73667';
  const value = safeHex.slice(1);
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

async function createPrintableLogoDataUrl(logoDataUrl) {
  if (!logoDataUrl) return '';

  try {
    const image = await loadImage(logoDataUrl);
    const maxSize = 900;
    const scale = Math.min(maxSize / image.width, maxSize / image.height, 1);
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    context.clearRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    return canvas.toDataURL('image/png');
  } catch (error) {
    console.warn('Não foi possível preparar a logo para impressão:', error);
    return logoDataUrl;
  }
}

function emptyQuote(settings) {
  return {
    tipoOrcamento: 'bolo',
    clienteId: '',
    dataEntrega: '',
    horarioEntrega: '',
    enderecoEntrega: '',
    tema: '',
    observacoes: '',
    margemLucro: settings.margemPadrao || 100,
    taxaEntrega: '',
    outrosCustos: '',
    desconto: '',
    status: 'Orçamento enviado',
    criadoEm: todayISO(),
    bolo: {
      tamanhoPessoas: 50,
      massaId: '',
      coberturaId: '',
      embalagemId: '',
      recheios: [],
      extras: []
    },
    docinhos: [],
    embalagemDocinhosId: ''
  };
}

export default function QuoteBuilder({ database, updateDatabase, onNavigate }) {
  const [quote, setQuote] = useState(() => emptyQuote(database.settings));
  const [copied, setCopied] = useState(false);

  const recipesByType = useMemo(() => {
    const group = {};
    (database.recipes || []).forEach((recipe) => {
      group[recipe.tipo] = group[recipe.tipo] || [];
      group[recipe.tipo].push(recipe);
    });
    return group;
  }, [database.recipes]);

  const totals = calculateQuote(quote, database);
  const whatsappMessage = createWhatsAppMessage(quote, database, totals);

  function updateField(field, value) {
    setQuote((current) => ({ ...current, [field]: value }));
  }

  function updateBoloField(field, value) {
    setQuote((current) => ({ ...current, bolo: { ...current.bolo, [field]: value } }));
  }

  function addRecheio() {
    const firstRecheio = recipesByType.Recheio?.[0]?.id || '';
    setQuote((current) => ({
      ...current,
      bolo: {
        ...current.bolo,
        recheios: [...(current.bolo.recheios || []), { recipeId: firstRecheio, percentual: 50 }]
      }
    }));
  }

  function updateRecheio(index, field, value) {
    setQuote((current) => ({
      ...current,
      bolo: {
        ...current.bolo,
        recheios: current.bolo.recheios.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item)
      }
    }));
  }

  function removeRecheio(index) {
    setQuote((current) => ({
      ...current,
      bolo: {
        ...current.bolo,
        recheios: current.bolo.recheios.filter((_, itemIndex) => itemIndex !== index)
      }
    }));
  }

  function toggleExtra(recipeId) {
    setQuote((current) => {
      const extras = current.bolo.extras || [];
      const exists = extras.includes(recipeId);
      return {
        ...current,
        bolo: {
          ...current.bolo,
          extras: exists ? extras.filter((id) => id !== recipeId) : [...extras, recipeId]
        }
      };
    });
  }

  function addDocinho() {
    const firstDocinho = recipesByType['Docinho Gourmet']?.[0]?.id || '';
    setQuote((current) => ({
      ...current,
      docinhos: [...(current.docinhos || []), { recipeId: firstDocinho, quantidade: 50 }]
    }));
  }

  function updateDocinho(index, field, value) {
    setQuote((current) => ({
      ...current,
      docinhos: current.docinhos.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item)
    }));
  }

  function removeDocinho(index) {
    setQuote((current) => ({
      ...current,
      docinhos: current.docinhos.filter((_, itemIndex) => itemIndex !== index)
    }));
  }

  async function copyMessage() {
    await navigator.clipboard.writeText(whatsappMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  function saveQuote() {
    const payload = {
      ...quote,
      id: createId('orc'),
      calculo: totals
    };

    updateDatabase((db) => {
      let next = { ...db, quotes: [payload, ...db.quotes] };
      if (payload.status === 'Pedido fechado') {
        next = deductStockForQuote(next, payload.id);
      }
      return next;
    });
    setQuote(emptyQuote(database.settings));
    onNavigate('pedidos');
  }

  async function printQuote() {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const primary = /^#[0-9A-Fa-f]{6}$/.test(database.settings.corPrimaria || '') ? database.settings.corPrimaria : '#c73667';
    const secondary = /^#[0-9A-Fa-f]{6}$/.test(database.settings.corSecundaria || '') ? database.settings.corSecundaria : '#ff8fb1';
    const background = /^#[0-9A-Fa-f]{6}$/.test(database.settings.corFundo || '') ? database.settings.corFundo : '#fff7f9';
    const softPrimary = hexWithAlpha(primary, 0.12);
    const softSecondary = hexWithAlpha(secondary, 0.18);
    const printableLogo = await createPrintableLogoDataUrl(database.settings.logoDataUrl);
    const logo = printableLogo ? `<img class="printLogo" src="${printableLogo}" alt="Logo da confeitaria" />` : '<div class="printLogoPlaceholder">🍰</div>';
    const companyName = escapeHtml(database.settings.nomeConfeitaria || 'Orçamento personalizado');
    const companyMeta = [database.settings.instagram, database.settings.whatsapp, database.settings.cidade]
      .filter(Boolean)
      .map(escapeHtml)
      .join(' • ');
    const safeMessage = escapeHtml(whatsappMessage);

    printWindow.document.write(`
      <!doctype html>
      <html lang="pt-BR">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Orçamento - ${companyName}</title>
          <style>
            @page { size: A4; margin: 14mm; }
            * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            body {
              margin: 0;
              font-family: Arial, Helvetica, sans-serif;
              color: #3b2630;
              background: ${background};
            }
            .pageWrap {
              width: 100%;
              min-height: 100vh;
              padding: 18px;
              background:
                radial-gradient(circle at top left, ${softSecondary}, transparent 34%),
                linear-gradient(180deg, ${background}, #ffffff 58%);
            }
            .box {
              max-width: 760px;
              margin: 0 auto;
              overflow: hidden;
              border: 2px solid ${secondary};
              border-radius: 26px;
              background: #ffffff;
            }
            .brandBar {
              display: flex;
              align-items: center;
              gap: 16px;
              padding: 24px 28px;
              border-bottom: 1px solid ${softPrimary};
              background: linear-gradient(135deg, ${primary}, ${secondary});
              color: #ffffff;
            }
            .printLogo,
            .printLogoPlaceholder {
              flex: 0 0 auto;
              width: 86px;
              height: 86px;
              border-radius: 22px;
              object-fit: contain;
              background: #ffffff;
              border: 3px solid rgba(255,255,255,0.75);
              padding: 8px;
              box-shadow: 0 8px 24px rgba(0,0,0,0.12);
            }
            .printLogoPlaceholder {
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 42px;
            }
            h1 {
              margin: 0 0 6px;
              font-size: 28px;
              line-height: 1.12;
              color: #ffffff;
            }
            .companyMeta {
              margin: 0;
              color: rgba(255,255,255,0.92);
              font-size: 13px;
            }
            .content {
              padding: 28px;
            }
            .tag {
              display: inline-flex;
              margin-bottom: 18px;
              border: 1px solid ${secondary};
              border-radius: 999px;
              padding: 7px 12px;
              background: ${softSecondary};
              color: ${primary};
              font-weight: 700;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 0.04em;
            }
            pre {
              margin: 0;
              white-space: pre-wrap;
              font-family: Arial, Helvetica, sans-serif;
              font-size: 15.5px;
              line-height: 1.62;
            }
            .footer {
              margin-top: 26px;
              padding-top: 16px;
              border-top: 1px solid ${softPrimary};
              color: #78636d;
              font-size: 12px;
            }
            @media print {
              body { background: #ffffff; }
              .pageWrap { min-height: auto; padding: 0; background: #ffffff; }
              .box { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="pageWrap">
            <div class="box">
              <div class="brandBar">
                ${logo}
                <div>
                  <h1>${companyName}</h1>
                  ${companyMeta ? `<p class="companyMeta">${companyMeta}</p>` : ''}
                </div>
              </div>
              <div class="content">
                <span class="tag">Orçamento personalizado</span>
                <pre>${safeMessage}</pre>
                <div class="footer">Gerado pelo DocePreço MVP</div>
              </div>
            </div>
          </div>
          <script>
            function waitForImages() {
              var images = Array.from(document.images || []);
              if (!images.length) return Promise.resolve();

              return Promise.all(images.map(function (img) {
                if (img.complete && img.naturalWidth > 0) return Promise.resolve();
                return new Promise(function (resolve) {
                  var done = function () { resolve(); };
                  img.onload = done;
                  img.onerror = done;
                  setTimeout(done, 1800);
                });
              }));
            }

            function printReadyDocument() {
              waitForImages().then(function () {
                setTimeout(function () {
                  window.focus();
                  window.print();
                }, 350);
              });
            }

            if (document.readyState === 'complete') {
              printReadyDocument();
            } else {
              window.addEventListener('load', printReadyDocument);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  const showBolo = quote.tipoOrcamento === 'bolo' || quote.tipoOrcamento === 'combo';
  const showDocinhos = quote.tipoOrcamento === 'docinhos' || quote.tipoOrcamento === 'combo';

  return (
    <div className="page stack">
      <PageHeader
        title="Novo orçamento"
        subtitle="Monte o pedido real da cliente e veja custo, preço sugerido e lucro."
        action={<Button onClick={saveQuote}>Salvar orçamento</Button>}
      />

      <div className="quoteGrid">
        <div className="stack">
          <Card>
            <h3>1. Tipo de orçamento</h3>
            <div className="segmented">
              {[
                { id: 'bolo', label: 'Bolo' },
                { id: 'docinhos', label: 'Docinhos' },
                { id: 'combo', label: 'Bolo + Docinhos' }
              ].map((item) => (
                <button
                  key={item.id}
                  className={quote.tipoOrcamento === item.id ? 'active' : ''}
                  onClick={() => updateField('tipoOrcamento', item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <h3>2. Cliente e entrega</h3>
            <div className="formGrid compact">
              <Field label="Cliente">
                <select value={quote.clienteId} onChange={(event) => updateField('clienteId', event.target.value)}>
                  <option value="">Selecione um cliente</option>
                  {database.clients.map((client) => <option key={client.id} value={client.id}>{client.nome}</option>)}
                </select>
              </Field>
              <Field label="Data da entrega">
                <input type="date" value={quote.dataEntrega} onChange={(event) => updateField('dataEntrega', event.target.value)} />
              </Field>
              <Field label="Horário da entrega">
                <input type="time" value={quote.horarioEntrega} onChange={(event) => updateField('horarioEntrega', event.target.value)} />
              </Field>
              <Field label="Endereço da entrega">
                <input value={quote.enderecoEntrega} onChange={(event) => updateField('enderecoEntrega', event.target.value)} placeholder="Endereço ou retirar no local" />
              </Field>
              <Field label="Tema do pedido">
                <input value={quote.tema} onChange={(event) => updateField('tema', event.target.value)} placeholder="Ex: aniversário feminino" />
              </Field>
            </div>
            {database.clients.length === 0 && (
              <div className="tipBox">
                Nenhum cliente cadastrado. Vá em <button onClick={() => onNavigate('clientes')}>Clientes</button> para cadastrar.
              </div>
            )}
          </Card>

          {showBolo && (
            <Card>
              <h3>3. Bolo</h3>
              <div className="formGrid compact">
                <Field label="Tamanho do bolo">
                  <select value={quote.bolo.tamanhoPessoas} onChange={(event) => updateBoloField('tamanhoPessoas', event.target.value)}>
                    {[10, 20, 30, 50, 80, 100].map((size) => <option key={size} value={size}>{size} pessoas</option>)}
                  </select>
                </Field>
                <RecipeSelect label="Massa" value={quote.bolo.massaId} recipes={recipesByType.Massa || []} onChange={(value) => updateBoloField('massaId', value)} />
                <RecipeSelect label="Cobertura" value={quote.bolo.coberturaId} recipes={recipesByType.Cobertura || []} onChange={(value) => updateBoloField('coberturaId', value)} />
                <RecipeSelect label="Embalagem" value={quote.bolo.embalagemId} recipes={recipesByType.Embalagem || []} onChange={(value) => updateBoloField('embalagemId', value)} />
              </div>

              <div className="sectionTitle sub">
                <h4>Recheios e camadas</h4>
                <Button type="button" variant="secondary" onClick={addRecheio}>Adicionar recheio</Button>
              </div>
              {(quote.bolo.recheios || []).length === 0 ? (
                <p className="muted">Adicione Ninho, brigadeiro ou outro recheio.</p>
              ) : (
                <div className="stack smallGap">
                  {quote.bolo.recheios.map((item, index) => (
                    <div className="ingredientLine" key={index}>
                      <select value={item.recipeId} onChange={(event) => updateRecheio(index, 'recipeId', event.target.value)}>
                        {(recipesByType.Recheio || []).map((recipe) => <option key={recipe.id} value={recipe.id}>{recipe.nome} {recipe.tamanhoPessoas ? `• ${recipe.tamanhoPessoas} pessoas` : ''}</option>)}
                      </select>
                      <select value={item.percentual} onChange={(event) => updateRecheio(index, 'percentual', event.target.value)}>
                        <option value="50">50%</option>
                        <option value="100">100%</option>
                        <option value="25">25%</option>
                        <option value="75">75%</option>
                      </select>
                      <button type="button" className="dangerButton" onClick={() => removeRecheio(index)}>Remover</button>
                    </div>
                  ))}
                </div>
              )}

              <div className="sectionTitle sub">
                <h4>Decoração e extras</h4>
                <span className="muted">Selecione o que entra no pedido</span>
              </div>
              <div className="chipsGrid">
                {[...(recipesByType.Decoração || []), ...(recipesByType.Extra || [])].map((recipe) => (
                  <button
                    type="button"
                    key={recipe.id}
                    className={(quote.bolo.extras || []).includes(recipe.id) ? 'chip selected' : 'chip'}
                    onClick={() => toggleExtra(recipe.id)}
                  >
                    {recipe.nome}
                  </button>
                ))}
              </div>
            </Card>
          )}

          {showDocinhos && (
            <Card>
              <div className="sectionTitle">
                <h3>4. Docinhos gourmet</h3>
                <Button type="button" variant="secondary" onClick={addDocinho}>Adicionar sabor</Button>
              </div>

              {(quote.docinhos || []).length === 0 ? (
                <EmptyState title="Nenhum docinho adicionado" text="Adicione meio cento, cento ou quantidade personalizada." action={<Button onClick={addDocinho}>Adicionar docinho</Button>} />
              ) : (
                <div className="stack smallGap">
                  {quote.docinhos.map((item, index) => (
                    <div className="ingredientLine" key={index}>
                      <select value={item.recipeId} onChange={(event) => updateDocinho(index, 'recipeId', event.target.value)}>
                        {(recipesByType['Docinho Gourmet'] || []).map((recipe) => (
                          <option key={recipe.id} value={recipe.id}>{recipe.nome} • {recipe.pesoUnidadeGramas}g • rende {recipe.rendimentoUnidades}</option>
                        ))}
                      </select>
                      <select value={item.quantidade} onChange={(event) => updateDocinho(index, 'quantidade', event.target.value)}>
                        <option value="50">Meio cento - 50 un.</option>
                        <option value="100">Cento - 100 un.</option>
                        <option value="150">150 un.</option>
                        <option value="200">200 un.</option>
                      </select>
                      <input type="number" value={item.quantidade} onChange={(event) => updateDocinho(index, 'quantidade', event.target.value)} placeholder="Qtd" />
                      <button type="button" className="dangerButton" onClick={() => removeDocinho(index)}>Remover</button>
                    </div>
                  ))}
                </div>
              )}

              <RecipeSelect
                label="Embalagem dos docinhos"
                value={quote.embalagemDocinhosId}
                recipes={recipesByType.Embalagem || []}
                onChange={(value) => updateField('embalagemDocinhosId', value)}
              />
            </Card>
          )}

          <Card>
            <h3>5. Valores finais</h3>
            <div className="formGrid compact">
              <Field label="Margem de lucro">
                <select value={quote.margemLucro} onChange={(event) => updateField('margemLucro', event.target.value)}>
                  <option value="60">60%</option>
                  <option value="80">80%</option>
                  <option value="100">100%</option>
                  <option value="120">120%</option>
                  <option value="150">150%</option>
                  <option value="200">200%</option>
                </select>
              </Field>
              <Field label="Taxa de entrega">
                <input type="number" step="0.01" value={quote.taxaEntrega} onChange={(event) => updateField('taxaEntrega', event.target.value)} placeholder="0,00" />
              </Field>
              <Field label="Outros custos">
                <input type="number" step="0.01" value={quote.outrosCustos} onChange={(event) => updateField('outrosCustos', event.target.value)} placeholder="0,00" />
              </Field>
              <Field label="Desconto">
                <input type="number" step="0.01" value={quote.desconto} onChange={(event) => updateField('desconto', event.target.value)} placeholder="0,00" />
              </Field>
              <Field label="Status">
                <select value={quote.status} onChange={(event) => updateField('status', event.target.value)}>
                  {['Orçamento enviado', 'Aguardando pagamento', 'Pedido fechado', 'Em produção', 'Entregue', 'Cancelado'].map((status) => <option key={status}>{status}</option>)}
                </select>
              </Field>
              <Field label="Observações">
                <textarea value={quote.observacoes} onChange={(event) => updateField('observacoes', event.target.value)} placeholder="Detalhes que aparecerão no orçamento para o cliente." />
              </Field>
            </div>
          </Card>
        </div>

        <aside className="quoteAside stack">
          <Card>
            <h3>Resultado financeiro</h3>
            <div className="miniStats">
              <StatCard label="Ingredientes" value={money(totals.custoIngredientes)} />
              <StatCard label="Mão de obra" value={money(totals.custoMaoObra)} />
              <StatCard label="Custo total" value={money(totals.custoTotal)} />
              <StatCard label="Preço sugerido" value={money(totals.precoSugerido)} />
              <StatCard label="Lucro estimado" value={money(totals.lucroEstimado)} />
            </div>
          </Card>

          <Card>
            <div className="sectionTitle">
              <h3>Composição</h3>
              <Badge>{numberValue(quote.margemLucro)}% margem</Badge>
            </div>
            {totals.breakdown.length === 0 ? (
              <p className="muted">Selecione receitas para ver a composição.</p>
            ) : (
              <div className="breakdownList">
                {totals.breakdown.map((item, index) => (
                  <div className="breakdownItem" key={index}>
                    <div>
                      <strong>{item.nome}</strong>
                      <small>{item.label}</small>
                    </div>
                    <span>{money(item.total)}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <h3>Mensagem para WhatsApp</h3>
            <textarea className="messagePreview" readOnly value={whatsappMessage} />
            <div className="formActions vertical">
              <Button onClick={copyMessage}>{copied ? 'Copiado!' : 'Copiar mensagem'}</Button>
              <Button variant="secondary" onClick={printQuote}>Gerar PDF/imprimir</Button>
              <Button variant="ghost" onClick={saveQuote}>Salvar orçamento</Button>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function RecipeSelect({ label, value, recipes, onChange }) {
  return (
    <Field label={label}>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Selecione</option>
        {recipes.map((recipe) => (
          <option key={recipe.id} value={recipe.id}>
            {recipe.nome}
            {recipe.tamanhoPessoas ? ` • ${recipe.tamanhoPessoas} pessoas` : ''}
            {recipe.pesoUnidadeGramas ? ` • ${recipe.pesoUnidadeGramas}g` : ''}
          </option>
        ))}
      </select>
    </Field>
  );
}
