import { useEffect, useState } from 'react';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Clients from './pages/Clients.jsx';
import Ingredients from './pages/Ingredients.jsx';
import Recipes from './pages/Recipes.jsx';
import Stock from './pages/Stock.jsx';
import QuoteBuilder from './pages/QuoteBuilder.jsx';
import Orders from './pages/Orders.jsx';
import Settings from './pages/Settings.jsx';
import { loadDatabase, saveDatabase } from './utils/storage.js';

function isValidHex(color) {
  return /^#[0-9A-Fa-f]{6}$/.test(color || '');
}

function hexToRgb(color) {
  if (!isValidHex(color)) return null;
  const value = color.slice(1);
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16)
  };
}

function withAlpha(color, alpha) {
  const rgb = hexToRgb(color);
  if (!rgb) return color;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

function applyTheme(settings = {}) {
  const root = document.documentElement;
  const primary = isValidHex(settings.corPrimaria) ? settings.corPrimaria : '#c73667';
  const secondary = isValidHex(settings.corSecundaria) ? settings.corSecundaria : '#ff8fb1';
  const background = isValidHex(settings.corFundo) ? settings.corFundo : '#fff7f9';

  root.style.setProperty('--primary', primary);
  root.style.setProperty('--primary-dark', primary);
  root.style.setProperty('--primary-light', withAlpha(secondary, 0.24));
  root.style.setProperty('--bg', background);
  root.style.setProperty('--surface-soft', withAlpha(secondary, 0.14));
  root.style.setProperty('--border', withAlpha(primary, 0.25));
  root.style.setProperty('--shadow', `0 18px 40px ${withAlpha(primary, 0.12)}`);
}

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [database, setDatabase] = useState(() => loadDatabase());

  useEffect(() => {
    saveDatabase(database);
  }, [database]);

  useEffect(() => {
    applyTheme(database.settings);
  }, [database.settings]);

  function updateDatabase(updater) {
    setDatabase((current) => typeof updater === 'function' ? updater(current) : updater);
  }

  const pageProps = { database, updateDatabase, onNavigate: setCurrentPage };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage} settings={database.settings}>
      {currentPage === 'dashboard' && <Dashboard {...pageProps} />}
      {currentPage === 'clientes' && <Clients {...pageProps} />}
      {currentPage === 'ingredientes' && <Ingredients {...pageProps} />}
      {currentPage === 'receitas' && <Recipes {...pageProps} />}
      {currentPage === 'estoque' && <Stock {...pageProps} />}
      {currentPage === 'orcamento' && <QuoteBuilder {...pageProps} />}
      {currentPage === 'pedidos' && <Orders {...pageProps} />}
      {currentPage === 'config' && <Settings {...pageProps} />}
    </Layout>
  );
}
