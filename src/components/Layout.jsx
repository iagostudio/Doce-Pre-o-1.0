const navItems = [
  { id: 'dashboard', label: 'Início', icon: '🏠' },
  { id: 'clientes', label: 'Clientes', icon: '👥' },
  { id: 'ingredientes', label: 'Ingredientes', icon: '🥣' },
  { id: 'estoque', label: 'Estoque', icon: '📊' },
  { id: 'receitas', label: 'Receitas', icon: '🧁' },
  { id: 'orcamento', label: 'Orçamento', icon: '🧾' },
  { id: 'pedidos', label: 'Pedidos', icon: '📦' },
  { id: 'config', label: 'Config', icon: '⚙️' }
];

const mobileItems = navItems.filter((item) => ['dashboard', 'ingredientes', 'estoque', 'orcamento', 'pedidos'].includes(item.id));

export default function Layout({ currentPage, onNavigate, children, settings = {} }) {
  return (
    <div className="appShell">
      <aside className="sidebar">
        <div className="brandBox">
          {settings.logoDataUrl ? (
            <img className="brandLogo" src={settings.logoDataUrl} alt="Logo da confeitaria" />
          ) : (
            <div className="brandIcon">🍰</div>
          )}
          <div>
            <h1>{settings.nomeConfeitaria || 'DocePreço'}</h1>
            <p>MVP confeitaria</p>
          </div>
        </div>

        <nav className="navList">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={currentPage === item.id ? 'navItem active' : 'navItem'}
              onClick={() => onNavigate(item.id)}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="mainContent">{children}</main>

      <nav className="mobileNav">
        {mobileItems.map((item) => (
          <button
            key={item.id}
            className={currentPage === item.id ? 'mobileNavItem active' : 'mobileNavItem'}
            onClick={() => onNavigate(item.id)}
          >
            <span>{item.icon}</span>
            <small>{item.label}</small>
          </button>
        ))}
      </nav>
    </div>
  );
}
