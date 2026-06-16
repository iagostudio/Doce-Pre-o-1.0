import { Button, Card, Field, PageHeader } from '../components/UI.jsx';
import { defaultSettings } from '../data/seed.js';
import { resetDatabase } from '../utils/storage.js';


function imageFileToPngDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();

      image.onload = () => {
        const maxSize = 1200;
        const scale = Math.min(maxSize / image.width, maxSize / image.height, 1);
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext('2d');
        context.clearRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);

        resolve(canvas.toDataURL('image/png'));
      };

      image.onerror = reject;
      image.src = reader.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function normalizeHex(value, fallback) {
  if (/^#[0-9A-Fa-f]{6}$/.test(value || '')) return value;
  return fallback;
}

export default function Settings({ database, updateDatabase }) {
  const settings = { ...defaultSettings, ...(database.settings || {}) };

  function updateSetting(field, value) {
    updateDatabase((db) => ({ ...db, settings: { ...defaultSettings, ...db.settings, [field]: value } }));
  }

  async function uploadLogo(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const pngLogo = await imageFileToPngDataUrl(file);
      updateSetting('logoDataUrl', pngLogo);
    } catch (error) {
      console.error('Não foi possível converter a logo:', error);
      alert('Não consegui processar essa imagem. Tente subir a logo em PNG ou JPG.');
    } finally {
      event.target.value = '';
    }
  }

  function removeLogo() {
    updateSetting('logoDataUrl', '');
  }

  function resetAll() {
    if (!confirm('Isso apaga tudo salvo no navegador e volta para os dados iniciais. Continuar?')) return;
    resetDatabase();
    window.location.reload();
  }

  return (
    <div className="page stack">
      <PageHeader
        title="Configurações"
        subtitle="Dados da confeitaria, logo, cores da marca, custo/hora, margem padrão e texto do orçamento."
      />

      <Card>
        <h3>Identidade da confeitaria</h3>
        <div className="settingsBrandGrid">
          <div className="logoUploader">
            <div className="logoPreview">
              {settings.logoDataUrl ? (
                <img src={settings.logoDataUrl} alt="Logo da confeitaria" />
              ) : (
                <span>🍰</span>
              )}
            </div>
            <div className="stack smallGap">
              <strong>Logo da confeitaria</strong>
              <p className="muted">Suba uma imagem PNG, JPG ou WEBP. Ela aparece no menu e pode ser usada nos orçamentos.</p>
              <input type="file" accept="image/*" onChange={uploadLogo} />
              {settings.logoDataUrl && <Button type="button" variant="ghost" onClick={removeLogo}>Remover logo</Button>}
            </div>
          </div>

          <div className="colorsPanel">
            <h4>Cores da marca</h4>
            <p className="muted">Cole os códigos HEX das cores da logo para personalizar o aplicativo.</p>
            <ColorField
              label="Cor principal"
              field="corPrimaria"
              value={settings.corPrimaria}
              fallback="#c73667"
              onChange={updateSetting}
            />
            <ColorField
              label="Cor secundária / detalhe"
              field="corSecundaria"
              value={settings.corSecundaria}
              fallback="#ff8fb1"
              onChange={updateSetting}
            />
            <ColorField
              label="Cor de fundo"
              field="corFundo"
              value={settings.corFundo}
              fallback="#fff7f9"
              onChange={updateSetting}
            />
            <div className="themePreview">
              <span>Prévia</span>
              <button type="button">Botão principal</button>
              <small>Detalhes do app</small>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h3>Dados da confeitaria</h3>
        <form className="formGrid">
          <Field label="Nome da confeitaria">
            <input value={settings.nomeConfeitaria || ''} onChange={(event) => updateSetting('nomeConfeitaria', event.target.value)} />
          </Field>
          <Field label="Nome da responsável">
            <input value={settings.nomeResponsavel || ''} onChange={(event) => updateSetting('nomeResponsavel', event.target.value)} />
          </Field>
          <Field label="WhatsApp">
            <input value={settings.whatsapp || ''} onChange={(event) => updateSetting('whatsapp', event.target.value)} />
          </Field>
          <Field label="Instagram">
            <input value={settings.instagram || ''} onChange={(event) => updateSetting('instagram', event.target.value)} />
          </Field>
          <Field label="Cidade">
            <input value={settings.cidade || ''} onChange={(event) => updateSetting('cidade', event.target.value)} />
          </Field>
          <Field label="Custo da hora de trabalho">
            <input type="number" step="0.01" value={settings.custoHora || ''} onChange={(event) => updateSetting('custoHora', event.target.value)} />
          </Field>
          <Field label="Margem padrão">
            <select value={settings.margemPadrao || 100} onChange={(event) => updateSetting('margemPadrao', event.target.value)}>
              <option value="60">60%</option>
              <option value="80">80%</option>
              <option value="100">100%</option>
              <option value="120">120%</option>
              <option value="150">150%</option>
              <option value="200">200%</option>
            </select>
          </Field>
          <Field label="Validade do orçamento em dias">
            <input type="number" value={settings.validadeOrcamentoDias || ''} onChange={(event) => updateSetting('validadeOrcamentoDias', event.target.value)} />
          </Field>
          <Field label="Percentual de sinal">
            <input type="number" value={settings.percentualSinal || ''} onChange={(event) => updateSetting('percentualSinal', event.target.value)} />
          </Field>
          <Field label="Mensagem padrão do orçamento">
            <textarea value={settings.mensagemPadrao || ''} onChange={(event) => updateSetting('mensagemPadrao', event.target.value)} />
          </Field>
        </form>
      </Card>

      <Card className="dangerZone">
        <h3>Zona de teste</h3>
        <p>Como é um MVP local, os dados ficam salvos no navegador. Este botão limpa tudo e restaura os dados exemplo.</p>
        <Button variant="danger" onClick={resetAll}>Resetar dados do app</Button>
      </Card>
    </div>
  );
}

function ColorField({ label, field, value, fallback, onChange }) {
  const safeValue = normalizeHex(value, fallback);

  function updateColor(nextValue) {
    onChange(field, nextValue);
  }

  return (
    <label className="colorField">
      <span>{label}</span>
      <div>
        <input type="color" value={safeValue} onChange={(event) => updateColor(event.target.value)} />
        <input
          className="colorCodeInput"
          value={value || ''}
          placeholder={fallback}
          onChange={(event) => updateColor(event.target.value)}
          onBlur={(event) => updateColor(normalizeHex(event.target.value, fallback))}
        />
      </div>
    </label>
  );
}
