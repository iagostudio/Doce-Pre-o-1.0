export const defaultSettings = {
  nomeConfeitaria: 'DocePreço Confeitaria',
  nomeResponsavel: 'Ana',
  whatsapp: '',
  instagram: '',
  cidade: '',
  custoHora: 25,
  margemPadrao: 100,
  validadeOrcamentoDias: 3,
  percentualSinal: 50,
  mensagemPadrao: 'Para reservar a data, solicitamos sinal de 50%.',
  logoDataUrl: '',
  corPrimaria: '#c73667',
  corSecundaria: '#ff8fb1',
  corFundo: '#fff7f9'
};

export const seedIngredients = [
  {
    id: 'ing_leite_condensado_semil',
    nome: 'Leite condensado',
    marca: 'Semil',
    categoria: 'Leites e derivados',
    unidadeUso: 'g',
    precoEmbalagem: 6.7,
    quantidadeEmbalagem: 395,
    tipoEmbalagem: 'caixa',
    unidadeEstoque: 'caixa',
    estoqueAtual: 3950,
    estoqueMinimo: 790,
    dataAtualizacao: '2026-06-11',
    observacao: 'Preço base editável pela confeiteira.'
  },
  {
    id: 'ing_creme_leite',
    nome: 'Creme de leite',
    marca: 'Tradicional',
    categoria: 'Leites e derivados',
    unidadeUso: 'g',
    precoEmbalagem: 3.5,
    quantidadeEmbalagem: 200,
    tipoEmbalagem: 'caixa',
    unidadeEstoque: 'caixa',
    estoqueAtual: 1200,
    estoqueMinimo: 400,
    dataAtualizacao: '2026-06-11',
    observacao: ''
  },
  {
    id: 'ing_leite_po',
    nome: 'Leite em pó',
    marca: 'Gourmet',
    categoria: 'Leites e derivados',
    unidadeUso: 'g',
    precoEmbalagem: 18.9,
    quantidadeEmbalagem: 400,
    tipoEmbalagem: 'pacote',
    unidadeEstoque: 'pacote',
    estoqueAtual: 800,
    estoqueMinimo: 200,
    dataAtualizacao: '2026-06-11',
    observacao: ''
  },
  {
    id: 'ing_chocolate_po',
    nome: 'Chocolate em pó',
    marca: '50%',
    categoria: 'Chocolates',
    unidadeUso: 'g',
    precoEmbalagem: 16.9,
    quantidadeEmbalagem: 500,
    tipoEmbalagem: 'pacote',
    unidadeEstoque: 'pacote',
    estoqueAtual: 500,
    estoqueMinimo: 150,
    dataAtualizacao: '2026-06-11',
    observacao: ''
  },
  {
    id: 'ing_chocolate_nobre',
    nome: 'Chocolate nobre',
    marca: 'Gourmet',
    categoria: 'Chocolates',
    unidadeUso: 'g',
    precoEmbalagem: 29.9,
    quantidadeEmbalagem: 1000,
    tipoEmbalagem: 'barra/pacote',
    unidadeEstoque: 'pacote',
    estoqueAtual: 1000,
    estoqueMinimo: 200,
    dataAtualizacao: '2026-06-11',
    observacao: ''
  },
  {
    id: 'ing_morango',
    nome: 'Morango',
    marca: 'Bandeja',
    categoria: 'Frutas',
    unidadeUso: 'g',
    precoEmbalagem: 12,
    quantidadeEmbalagem: 250,
    tipoEmbalagem: 'bandeja',
    unidadeEstoque: 'bandeja',
    estoqueAtual: 500,
    estoqueMinimo: 250,
    dataAtualizacao: '2026-06-11',
    observacao: 'Valor médio de bandeja.'
  },
  {
    id: 'ing_farinha',
    nome: 'Farinha de trigo',
    marca: 'Tradicional',
    categoria: 'Massas e farinhas',
    unidadeUso: 'g',
    precoEmbalagem: 6.5,
    quantidadeEmbalagem: 1000,
    tipoEmbalagem: 'pacote',
    unidadeEstoque: 'pacote',
    estoqueAtual: 2000,
    estoqueMinimo: 500,
    dataAtualizacao: '2026-06-11',
    observacao: ''
  },
  {
    id: 'ing_acucar',
    nome: 'Açúcar',
    marca: 'Cristal',
    categoria: 'Açúcares',
    unidadeUso: 'g',
    precoEmbalagem: 5.2,
    quantidadeEmbalagem: 1000,
    tipoEmbalagem: 'pacote',
    unidadeEstoque: 'pacote',
    estoqueAtual: 2000,
    estoqueMinimo: 500,
    dataAtualizacao: '2026-06-11',
    observacao: ''
  },
  {
    id: 'ing_ovo',
    nome: 'Ovo',
    marca: 'Unidade',
    categoria: 'Outros',
    unidadeUso: 'unidade',
    precoEmbalagem: 12,
    quantidadeEmbalagem: 12,
    tipoEmbalagem: 'dúzia',
    unidadeEstoque: 'dúzia',
    estoqueAtual: 24,
    estoqueMinimo: 12,
    dataAtualizacao: '2026-06-11',
    observacao: 'Dúzia.'
  },
  {
    id: 'ing_chantilly',
    nome: 'Chantilly',
    marca: 'Caixa',
    categoria: 'Coberturas',
    unidadeUso: 'ml',
    precoEmbalagem: 17.9,
    quantidadeEmbalagem: 1000,
    tipoEmbalagem: 'caixa',
    unidadeEstoque: 'caixa',
    estoqueAtual: 1000,
    estoqueMinimo: 700,
    dataAtualizacao: '2026-06-11',
    observacao: ''
  },
  {
    id: 'ing_topo_personalizado',
    nome: 'Topo de bolo personalizado',
    marca: 'Unidade',
    categoria: 'Topos de bolo',
    unidadeUso: 'unidade',
    precoEmbalagem: 18,
    quantidadeEmbalagem: 1,
    tipoEmbalagem: 'unidade',
    unidadeEstoque: 'unidade',
    estoqueAtual: 2,
    estoqueMinimo: 1,
    dataAtualizacao: '2026-06-11',
    observacao: ''
  },
  {
    id: 'ing_forminha',
    nome: 'Forminha premium',
    marca: 'Pacote',
    categoria: 'Embalagens',
    unidadeUso: 'unidade',
    precoEmbalagem: 8,
    quantidadeEmbalagem: 100,
    tipoEmbalagem: 'pacote',
    unidadeEstoque: 'pacote',
    estoqueAtual: 300,
    estoqueMinimo: 100,
    dataAtualizacao: '2026-06-11',
    observacao: ''
  },
  {
    id: 'ing_caixa_docinhos',
    nome: 'Caixa para docinhos',
    marca: 'Unidade',
    categoria: 'Embalagens',
    unidadeUso: 'unidade',
    precoEmbalagem: 5,
    quantidadeEmbalagem: 1,
    tipoEmbalagem: 'unidade',
    unidadeEstoque: 'unidade',
    estoqueAtual: 10,
    estoqueMinimo: 3,
    dataAtualizacao: '2026-06-11',
    observacao: ''
  },
  {
    id: 'ing_caixa_bolo',
    nome: 'Caixa para bolo',
    marca: 'Unidade',
    categoria: 'Embalagens',
    unidadeUso: 'unidade',
    precoEmbalagem: 8,
    quantidadeEmbalagem: 1,
    tipoEmbalagem: 'unidade',
    unidadeEstoque: 'unidade',
    estoqueAtual: 5,
    estoqueMinimo: 2,
    dataAtualizacao: '2026-06-11',
    observacao: ''
  }
];

export const seedRecipes = [
  {
    id: 'rec_pao_de_lo_50',
    nome: 'Pão de ló',
    tipo: 'Massa',
    tamanhoPessoas: 50,
    pesoUnidadeGramas: '',
    rendimentoUnidades: '',
    tempoPreparoHoras: 1.5,
    ingredientes: [
      { ingredienteId: 'ing_farinha', quantidade: 500 },
      { ingredienteId: 'ing_acucar', quantidade: 400 },
      { ingredienteId: 'ing_ovo', quantidade: 10 }
    ]
  },
  {
    id: 'rec_ninho_50',
    nome: 'Recheio de Ninho',
    tipo: 'Recheio',
    tamanhoPessoas: 50,
    pesoUnidadeGramas: '',
    rendimentoUnidades: '',
    tempoPreparoHoras: 0.7,
    ingredientes: [
      { ingredienteId: 'ing_leite_condensado_semil', quantidade: 790 },
      { ingredienteId: 'ing_creme_leite', quantidade: 400 },
      { ingredienteId: 'ing_leite_po', quantidade: 200 }
    ]
  },
  {
    id: 'rec_brigadeiro_recheio_50',
    nome: 'Recheio de Brigadeiro',
    tipo: 'Recheio',
    tamanhoPessoas: 50,
    pesoUnidadeGramas: '',
    rendimentoUnidades: '',
    tempoPreparoHoras: 0.7,
    ingredientes: [
      { ingredienteId: 'ing_leite_condensado_semil', quantidade: 790 },
      { ingredienteId: 'ing_creme_leite', quantidade: 400 },
      { ingredienteId: 'ing_chocolate_po', quantidade: 150 }
    ]
  },
  {
    id: 'rec_chantilly_50',
    nome: 'Chantilly',
    tipo: 'Cobertura',
    tamanhoPessoas: 50,
    pesoUnidadeGramas: '',
    rendimentoUnidades: '',
    tempoPreparoHoras: 0.5,
    ingredientes: [
      { ingredienteId: 'ing_chantilly', quantidade: 700 }
    ]
  },
  {
    id: 'rec_morango_recheio',
    nome: 'Morangos no recheio',
    tipo: 'Extra',
    tamanhoPessoas: 50,
    pesoUnidadeGramas: '',
    rendimentoUnidades: '',
    tempoPreparoHoras: 0.2,
    ingredientes: [
      { ingredienteId: 'ing_morango', quantidade: 300 }
    ]
  },
  {
    id: 'rec_morango_topo',
    nome: 'Morangos no topo',
    tipo: 'Decoração',
    tamanhoPessoas: 50,
    pesoUnidadeGramas: '',
    rendimentoUnidades: '',
    tempoPreparoHoras: 0.2,
    ingredientes: [
      { ingredienteId: 'ing_morango', quantidade: 200 }
    ]
  },
  {
    id: 'rec_topo_personalizado',
    nome: 'Topo personalizado',
    tipo: 'Decoração',
    tamanhoPessoas: 0,
    pesoUnidadeGramas: '',
    rendimentoUnidades: '',
    tempoPreparoHoras: 0,
    ingredientes: [
      { ingredienteId: 'ing_topo_personalizado', quantidade: 1 }
    ]
  },
  {
    id: 'rec_caixa_bolo',
    nome: 'Caixa para bolo',
    tipo: 'Embalagem',
    tamanhoPessoas: 50,
    pesoUnidadeGramas: '',
    rendimentoUnidades: '',
    tempoPreparoHoras: 0,
    ingredientes: [
      { ingredienteId: 'ing_caixa_bolo', quantidade: 1 }
    ]
  },
  {
    id: 'rec_brigadeiro_gourmet_20g',
    nome: 'Brigadeiro gourmet',
    tipo: 'Docinho Gourmet',
    tamanhoPessoas: '',
    pesoUnidadeGramas: 20,
    rendimentoUnidades: 50,
    tempoPreparoHoras: 1.5,
    ingredientes: [
      { ingredienteId: 'ing_leite_condensado_semil', quantidade: 790 },
      { ingredienteId: 'ing_creme_leite', quantidade: 200 },
      { ingredienteId: 'ing_chocolate_nobre', quantidade: 200 },
      { ingredienteId: 'ing_forminha', quantidade: 50 }
    ]
  },
  {
    id: 'rec_brigadeiro_gourmet_12g',
    nome: 'Brigadeiro gourmet',
    tipo: 'Docinho Gourmet',
    tamanhoPessoas: '',
    pesoUnidadeGramas: 12,
    rendimentoUnidades: 80,
    tempoPreparoHoras: 1.5,
    ingredientes: [
      { ingredienteId: 'ing_leite_condensado_semil', quantidade: 790 },
      { ingredienteId: 'ing_creme_leite', quantidade: 200 },
      { ingredienteId: 'ing_chocolate_nobre', quantidade: 200 },
      { ingredienteId: 'ing_forminha', quantidade: 80 }
    ]
  },
  {
    id: 'rec_caixa_docinhos',
    nome: 'Caixa para docinhos',
    tipo: 'Embalagem',
    tamanhoPessoas: '',
    pesoUnidadeGramas: '',
    rendimentoUnidades: '',
    tempoPreparoHoras: 0,
    ingredientes: [
      { ingredienteId: 'ing_caixa_docinhos', quantidade: 1 }
    ]
  }
];
