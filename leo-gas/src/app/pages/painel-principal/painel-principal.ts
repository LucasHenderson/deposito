import { Component, computed, effect, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VendaService } from '../../services/venda.service';
import { ClienteService } from '../../services/cliente.service';
import { EnderecoService } from '../../services/endereco.service';
import { EntregadorService } from '../../services/entregador.service';
import { ProdutoService } from '../../services/produto.service';
import { AdiantamentoService } from '../../services/adiantamento.service';
import { VariavelEstoqueService } from '../../services/variavel-estoque.service';
import { Venda } from '../../models/venda.model';
import { Adiantamento } from '../../models/adiantamento.model';
import { forkJoin, map } from 'rxjs';

type Agrupamento = 'dia' | 'mes' | 'ano';

@Component({
  selector: 'app-painel-principal',
  imports: [CommonModule, FormsModule],
  templateUrl: './painel-principal.html',
  styleUrl: './painel-principal.css',
})
export class PainelPrincipal implements OnInit {
  Math = Math;
  private vendaService = inject(VendaService);
  private clienteService = inject(ClienteService);
  private enderecoService = inject(EnderecoService);
  private entregadorService = inject(EntregadorService);
  private produtoService = inject(ProdutoService);
  private adiantamentoService = inject(AdiantamentoService);
  private variavelEstoqueService = inject(VariavelEstoqueService);

  // ==================== SEÇÃO 1: VENDAS ====================
  vendasDataInicio = signal('');
  vendasDataFim = signal('');
  vendasAgrupamento = signal<Agrupamento>('mes');

  // ==================== SEÇÃO 2: ESTOQUE ====================
  estoqueDataInicio = signal('');
  estoqueDataFim = signal('');
  estoqueAgrupamento = signal<Agrupamento>('mes');
  estoqueSelecionadas = signal<number[]>([]);
  estoqueSearchTerm = signal('');
  showEstoqueDropdown = signal(false);

  readonly CORES_ESTOQUE = ['#1B7B4F', '#3498DB', '#E67E22', '#9B59B6', '#E74C3C', '#1ABC9C', '#F39C12', '#2980B9', '#8E44AD', '#D35400'];

  // ==================== SEÇÃO 3: QUADRAS ====================
  quadrasDataInicio = signal('');
  quadrasDataFim = signal('');
  quadrasAgrupamento = signal<Agrupamento>('mes');
  quadrasSelecionadas = signal<string[]>([]);
  quadraSearchTerm = signal('');
  showQuadraDropdown = signal(false);

  readonly CORES_QUADRAS = ['#1B7B4F', '#3498DB', '#E67E22', '#9B59B6', '#E74C3C'];

  // ==================== SEÇÃO 3.5: VENDAS POR QUADRA ====================
  vendasQuadraDataInicio = signal('');
  vendasQuadraDataFim = signal('');
  vendasQuadraAgrupamento = signal<Agrupamento>('mes');
  vendasQuadraSelecionada = signal('');

  // ==================== SEÇÃO 4: CLIENTE ====================
  clienteDataInicio = signal('');
  clienteDataFim = signal('');
  clienteAgrupamento = signal<Agrupamento>('mes');
  clienteSelecionadoId = signal('');
  clienteSearchTerm = signal('');
  showClienteDropdown = signal(false);

  // ==================== SEÇÃO 5: ENTREGADOR ====================
  entregadorDataInicio = signal('');
  entregadorDataFim = signal('');
  entregadorAgrupamento = signal<Agrupamento>('mes');
  entregadorSelecionadoId = signal('');

  // ==================== DADOS BASE ====================
  vendas = this.vendaService.getVendas();
  clientes = this.clienteService.getClientes();
  enderecos = this.enderecoService.getEnderecos();
  todasQuadras = this.enderecoService.getTodasQuadras();
  entregadores = this.entregadorService.getEntregadores();
  variaveis = this.variavelEstoqueService.getVariaveis();
  todasVariaveis = this.variavelEstoqueService.getTodasVariaveis();
  ajustesEstoque = this.variavelEstoqueService.getAjustes();
  adiantamentos = this.adiantamentoService.getAdiantamentos();

  // ==================== CARDS RESUMO ====================
  valoresVisiveis = signal(false);
  cardDropdownAberto = signal<string | null>(null);

  totalVendas = computed(() => this.vendas().length);
  totalClientes = computed(() => this.clientes().length);
  totalEntregadoresAtivos = computed(() => this.entregadores().filter(e => e.ativo).length);
  faturamentoTotal = computed(() => this.vendas().reduce((sum, v) => sum + v.valorTotal, 0));

  toggleValoresVisiveis(event: Event) {
    event.stopPropagation();
    this.valoresVisiveis.update(v => !v);
    this.cardDropdownAberto.set(null);
  }

  toggleCardDropdown(cardId: string, event: Event) {
    event.stopPropagation();
    this.cardDropdownAberto.update(v => v === cardId ? null : cardId);
  }

  mascarar(valor: string): string {
    return valor.replace(/[0-9]/g, '•').replace(/[A-Za-z]/g, '•');
  }

  // ==================== HELPERS DE AGRUPAMENTO ====================
  getDateKey(date: Date, agrupamento: Agrupamento): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    switch (agrupamento) {
      case 'dia': return `${y}-${m}-${d}`;
      case 'mes': return `${y}-${m}`;
      case 'ano': return `${y}`;
    }
  }

  generatePeriodKeys(inicio: string, fim: string, agrupamento: Agrupamento): string[] {
    const keys: string[] = [];
    const dataInicio = new Date(inicio + 'T00:00:00');
    const dataFim = new Date(fim + 'T23:59:59');

    if (agrupamento === 'dia') {
      const current = new Date(dataInicio);
      while (current <= dataFim) {
        keys.push(this.getDateKey(current, 'dia'));
        current.setDate(current.getDate() + 1);
      }
    } else if (agrupamento === 'mes') {
      const current = new Date(dataInicio.getFullYear(), dataInicio.getMonth(), 1);
      while (current <= dataFim) {
        keys.push(this.getDateKey(current, 'mes'));
        current.setMonth(current.getMonth() + 1);
      }
    } else {
      for (let y = dataInicio.getFullYear(); y <= dataFim.getFullYear(); y++) {
        keys.push(`${y}`);
      }
    }
    return keys;
  }

  formatGroupLabel(key: string, agrupamento: Agrupamento): string {
    const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const parts = key.split('-');
    switch (agrupamento) {
      case 'dia': return `${parts[2]}/${parts[1]}`;
      case 'mes': return `${mesesNomes[Number(parts[1]) - 1]}/${parts[0].slice(-2)}`;
      case 'ano': return parts[0];
    }
  }

  getEndDateForKey(key: string, agrupamento: Agrupamento): Date {
    const parts = key.split('-').map(Number);
    switch (agrupamento) {
      case 'dia': return new Date(parts[0], parts[1] - 1, parts[2], 23, 59, 59);
      case 'mes': return new Date(parts[0], parts[1], 0, 23, 59, 59);
      case 'ano': return new Date(parts[0], 11, 31, 23, 59, 59);
    }
  }

  getLabelInterval(totalItems: number): number {
    if (totalItems <= 15) return 1;
    if (totalItems <= 30) return 2;
    if (totalItems <= 60) return 5;
    if (totalItems <= 120) return 10;
    return Math.ceil(totalItems / 12);
  }

  shouldRotateLabels(totalItems: number): boolean {
    return totalItems > 20;
  }

  // ==================== COMPUTED: VENDAS ====================
  vendasFiltradas = computed(() => {
    let lista = this.vendas();
    const inicio = this.vendasDataInicio();
    const fim = this.vendasDataFim();
    if (inicio) { const d = new Date(inicio + 'T00:00:00'); lista = lista.filter(v => new Date(v.dataVenda) >= d); }
    if (fim) { const d = new Date(fim + 'T23:59:59'); lista = lista.filter(v => new Date(v.dataVenda) <= d); }
    return lista;
  });

  vendasChartData = computed(() => {
    const vendas = this.vendasFiltradas();
    const agrupamento = this.vendasAgrupamento();
    const inicio = this.vendasDataInicio();
    const fim = this.vendasDataFim();
    if (vendas.length === 0 || !inicio || !fim) return [];

    const allKeys = this.generatePeriodKeys(inicio, fim, agrupamento);
    const agrupado = new Map<string, number>();
    allKeys.forEach(k => agrupado.set(k, 0));
    vendas.forEach(v => {
      const key = this.getDateKey(new Date(v.dataVenda), agrupamento);
      agrupado.set(key, (agrupado.get(key) || 0) + 1);
    });

    return allKeys.map(key => ({
      label: this.formatGroupLabel(key, agrupamento),
      value: agrupado.get(key) || 0,
      fullDate: key
    }));
  });

  vendasMaxValue = computed(() => {
    const data = this.vendasChartData();
    if (data.length === 0) return 1;
    return Math.max(...data.map(d => d.value), 1);
  });

  totalVendasPeriodo = computed(() => this.vendasFiltradas().length);
  faturamentoPeriodo = computed(() => this.vendasFiltradas().reduce((sum, v) => sum + v.valorTotal, 0));

  // ==================== COMPUTED: ESTOQUE ====================
  estoqueAtual = computed(() => {
    return this.variaveis().map(v => ({
      id: v.id, nome: v.nome, quantidade: v.quantidade,
      status: v.quantidade === 0 ? 'critico' : v.quantidade <= 10 ? 'baixo' : v.quantidade <= 30 ? 'medio' : 'normal'
    }));
  });

  estoqueMaxValue = computed(() => {
    const data = this.estoqueAtual();
    if (data.length === 0) return 1;
    return Math.max(...data.map(d => d.quantidade), 1);
  });

  estoqueDisponiveis = computed(() => {
    return this.todasVariaveis().map(v => ({ id: v.id, nome: v.nome, quantidade: v.quantidade }));
  });

  estoqueFiltradas = computed(() => {
    const search = this.estoqueSearchTerm().toLowerCase().trim();
    if (!search) return this.estoqueDisponiveis();
    return this.estoqueDisponiveis().filter(v => v.nome.toLowerCase().includes(search));
  });

  estoqueHistorico = computed(() => {
    const todasVariaveis = this.todasVariaveis();
    const selecionadas = this.estoqueSelecionadas();
    const variaveis = selecionadas.length > 0
      ? selecionadas.map(id => todasVariaveis.find(v => v.id === id)).filter((v): v is typeof todasVariaveis[0] => v != null)
      : todasVariaveis;
    const vendas = this.vendas();
    const ajustes = this.ajustesEstoque();
    const inicio = this.estoqueDataInicio();
    const fim = this.estoqueDataFim();
    const agrupamento = this.estoqueAgrupamento();
    const produtos = this.produtoService.getProdutos()();

    if (!inicio || !fim) return [];

    const dataInicio = new Date(inicio + 'T00:00:00');
    const dataFim = new Date(fim + 'T23:59:59');

    // Sempre calcula dia a dia, depois agrupa
    const diasKeys: string[] = [];
    const cur = new Date(dataInicio);
    while (cur <= dataFim) {
      diasKeys.push(this.getDateKey(cur, 'dia'));
      cur.setDate(cur.getDate() + 1);
    }
    if (diasKeys.length === 0) return [];

    const groupKeys = this.generatePeriodKeys(inicio, fim, agrupamento);

    return variaveis.map((variavel, idx) => {
      const estoqueAtualVal = variavel.quantidade;
      const produtosVinculados = produtos.filter(p => p.vinculos.some(v => v.variavelEstoqueId === variavel.id));
      const ajustesDaVariavel = ajustes.filter(a => a.variavelEstoqueId === variavel.id);

      // Impacto de vendas por dia
      const impactoPorDia = new Map<string, number>();
      vendas.forEach(venda => {
        const key = this.getDateKey(new Date(venda.dataVenda), 'dia');
        venda.itens.forEach(item => {
          const produto = produtosVinculados.find(p => p.id === item.produtoId);
          if (produto) {
            const vinculo = produto.vinculos.find(v => v.variavelEstoqueId === variavel.id);
            if (vinculo) {
              let impacto = 0;
              if (vinculo.tipoInteracao === 'reduz') impacto = -item.quantidade;
              else if (vinculo.tipoInteracao === 'aumenta') impacto = item.quantidade;
              impactoPorDia.set(key, (impactoPorDia.get(key) || 0) + impacto);
            }
          }
        });
      });

      // Impacto de ajustes manuais por dia
      ajustesDaVariavel.forEach(ajuste => {
        const key = this.getDateKey(new Date(ajuste.dataAjuste), 'dia');
        impactoPorDia.set(key, (impactoPorDia.get(key) || 0) + ajuste.delta);
      });

      // Ajusta estoque corrente revertendo impactos futuros (após o período)
      let estoqueCorrente = estoqueAtualVal;
      vendas.filter(v => new Date(v.dataVenda) > dataFim).forEach(venda => {
        venda.itens.forEach(item => {
          const produto = produtosVinculados.find(p => p.id === item.produtoId);
          if (produto) {
            const vinculo = produto.vinculos.find(v => v.variavelEstoqueId === variavel.id);
            if (vinculo) {
              if (vinculo.tipoInteracao === 'reduz') estoqueCorrente += item.quantidade;
              else if (vinculo.tipoInteracao === 'aumenta') estoqueCorrente -= item.quantidade;
            }
          }
        });
      });

      // Reverte ajustes manuais futuros (após o período)
      ajustesDaVariavel
        .filter(a => new Date(a.dataAjuste) > dataFim)
        .forEach(a => { estoqueCorrente -= a.delta; });

      const pontosDiarios: { data: string; valor: number }[] = [];
      for (let i = diasKeys.length - 1; i >= 0; i--) {
        pontosDiarios.unshift({ data: diasKeys[i], valor: Math.max(0, estoqueCorrente) });
        const impacto = impactoPorDia.get(diasKeys[i]) || 0;
        estoqueCorrente -= impacto;
      }

      let pontos: { data: string; valor: number }[];
      if (agrupamento === 'dia') {
        pontos = pontosDiarios;
      } else {
        pontos = groupKeys.map(gk => {
          const pontosDoGrupo = pontosDiarios.filter(p => {
            const pKey = agrupamento === 'mes' ? p.data.substring(0, 7) : p.data.substring(0, 4);
            return pKey === gk;
          });
          const ultimoValor = pontosDoGrupo.length > 0 ? pontosDoGrupo[pontosDoGrupo.length - 1].valor : 0;
          return { data: gk, valor: ultimoValor };
        });
      }

      return { nome: variavel.nome, cor: this.CORES_ESTOQUE[idx % this.CORES_ESTOQUE.length], pontos };
    });
  });

  estoqueHistoricoMax = computed(() => {
    const data = this.estoqueHistorico();
    if (data.length === 0) return 1;
    let max = 1;
    data.forEach(serie => serie.pontos.forEach(p => { if (p.valor > max) max = p.valor; }));
    return max;
  });

  // ==================== COMPUTED: QUADRAS ====================
  quadrasDisponiveis = computed(() => {
    const quadrasMap = new Map<string, number>();
    this.enderecos().forEach(e => {
      if (e.quadra) quadrasMap.set(e.quadra, (quadrasMap.get(e.quadra) || 0) + e.clientesIds.length);
    });
    return Array.from(quadrasMap.entries())
      .map(([quadra, total]) => ({ quadra, totalClientes: total }))
      .sort((a, b) => a.quadra.localeCompare(b.quadra));
  });

  todasQuadrasDisponiveis = computed(() => {
    const todas = this.todasQuadras();
    const ativasMap = new Map<string, number>();
    this.enderecos().forEach(e => {
      if (e.quadra) ativasMap.set(e.quadra, (ativasMap.get(e.quadra) || 0) + e.clientesIds.length);
    });
    return todas
      .map(quadra => ({ quadra, totalClientes: ativasMap.get(quadra) || 0 }))
      .sort((a, b) => a.quadra.localeCompare(b.quadra));
  });

  quadrasFiltradas = computed(() => {
    const search = this.quadraSearchTerm().toLowerCase().trim();
    if (!search) return this.todasQuadrasDisponiveis();
    return this.todasQuadrasDisponiveis().filter(q => q.quadra.toLowerCase().includes(search));
  });

  private quadrasHistoricoRaw = signal<Map<string, { dataCriacao: string; dataExclusao: string | null }[]>>(new Map());

  private quadrasHistoricoEffect = effect(() => {
    const selecionadas = this.quadrasSelecionadas();
    if (selecionadas.length === 0) { this.quadrasHistoricoRaw.set(new Map()); return; }
    const requests = selecionadas.map(quadra =>
      this.enderecoService.buscarHistoricoQuadra(quadra).pipe(map(data => ({ quadra, data })))
    );
    forkJoin(requests).subscribe({
      next: (results) => {
        const m = new Map<string, { dataCriacao: string; dataExclusao: string | null }[]>();
        results.forEach(r => m.set(r.quadra, r.data));
        this.quadrasHistoricoRaw.set(m);
      },
      error: () => this.quadrasHistoricoRaw.set(new Map())
    });
  });

  quadrasChartData = computed(() => {
    const selecionadas = this.quadrasSelecionadas();
    const inicio = this.quadrasDataInicio();
    const fim = this.quadrasDataFim();
    const agrupamento = this.quadrasAgrupamento();
    const historicoMap = this.quadrasHistoricoRaw();
    if (selecionadas.length === 0 || !inicio || !fim || historicoMap.size === 0) return [];

    const periodKeys = this.generatePeriodKeys(inicio, fim, agrupamento);
    if (periodKeys.length === 0) return [];

    return selecionadas.map((quadra, idx) => {
      const enderecos = historicoMap.get(quadra) || [];

      const pontos = periodKeys.map(key => {
        const fimPeriodo = this.getEndDateForKey(key, agrupamento);
        const total = enderecos.filter(e => {
          const criacao = new Date(e.dataCriacao);
          if (criacao > fimPeriodo) return false;
          if (e.dataExclusao === null) return true;
          return new Date(e.dataExclusao) > fimPeriodo;
        }).length;
        return { mes: key, valor: total };
      });

      return { quadra, cor: this.CORES_QUADRAS[idx], pontos };
    });
  });

  quadrasChartMax = computed(() => {
    const data = this.quadrasChartData();
    if (data.length === 0) return 1;
    let max = 1;
    data.forEach(serie => serie.pontos.forEach(p => { if (p.valor > max) max = p.valor; }));
    return max;
  });

  // ==================== COMPUTED: VENDAS POR QUADRA ====================
  private vendasQuadraRaw = signal<{ data: string; total: number }[]>([]);

  private vendasQuadraEffect = effect(() => {
    const quadra = this.vendasQuadraSelecionada();
    const inicio = this.vendasQuadraDataInicio();
    const fim = this.vendasQuadraDataFim();
    if (!quadra || !inicio || !fim) { this.vendasQuadraRaw.set([]); return; }
    this.vendaService.buscarVendasPorQuadra(quadra, inicio, fim).subscribe({
      next: (data) => this.vendasQuadraRaw.set(data),
      error: () => this.vendasQuadraRaw.set([])
    });
  });

  vendasQuadraChartData = computed(() => {
    const raw = this.vendasQuadraRaw();
    const inicio = this.vendasQuadraDataInicio();
    const fim = this.vendasQuadraDataFim();
    const agrupamento = this.vendasQuadraAgrupamento();
    if (raw.length === 0 || !inicio || !fim) return [];

    const periodKeys = this.generatePeriodKeys(inicio, fim, agrupamento);
    const agrupado = new Map<string, number>();
    periodKeys.forEach(k => agrupado.set(k, 0));
    raw.forEach(r => {
      const key = this.getDateKey(new Date(r.data + 'T00:00:00'), agrupamento);
      agrupado.set(key, (agrupado.get(key) || 0) + r.total);
    });

    return periodKeys.map(key => ({
      label: this.formatGroupLabel(key, agrupamento),
      value: agrupado.get(key) || 0,
      fullDate: key
    }));
  });

  vendasQuadraChartMax = computed(() => {
    const data = this.vendasQuadraChartData();
    if (data.length === 0) return 1;
    return Math.max(...data.map(d => d.value), 1);
  });

  totalVendasQuadraPeriodo = computed(() => this.vendasQuadraChartData().reduce((sum, d) => sum + d.value, 0));

  // ==================== COMPUTED: CLIENTE ====================
  clientesFiltrados = computed(() => {
    const search = this.clienteSearchTerm().toLowerCase().trim();
    if (!search) return this.clientes().slice(0, 20);
    return this.clientes().filter(c => c.nome.toLowerCase().includes(search) || c.telefone.includes(search)).slice(0, 20);
  });

  clienteSelecionado = computed(() => {
    const id = this.clienteSelecionadoId();
    return id ? this.clientes().find(c => String(c.id) === id) || null : null;
  });

  clienteChartData = computed(() => {
    const clienteId = this.clienteSelecionadoId();
    const inicio = this.clienteDataInicio();
    const fim = this.clienteDataFim();
    const agrupamento = this.clienteAgrupamento();
    if (!clienteId || !inicio || !fim) return [];

    const dataInicio = new Date(inicio + 'T00:00:00');
    const dataFim = new Date(fim + 'T23:59:59');

    const vendasCliente = this.vendas().filter(v => {
      const dv = new Date(v.dataVenda);
      return String(v.clienteId) === clienteId && dv >= dataInicio && dv <= dataFim;
    });

    const periodKeys = this.generatePeriodKeys(inicio, fim, agrupamento);
    const agrupado = new Map<string, number>();
    periodKeys.forEach(k => agrupado.set(k, 0));
    vendasCliente.forEach(v => {
      const key = this.getDateKey(new Date(v.dataVenda), agrupamento);
      agrupado.set(key, (agrupado.get(key) || 0) + 1);
    });

    return periodKeys.map(key => ({
      label: this.formatGroupLabel(key, agrupamento),
      value: agrupado.get(key) || 0,
      fullDate: key
    }));
  });

  clienteChartMax = computed(() => {
    const data = this.clienteChartData();
    if (data.length === 0) return 1;
    return Math.max(...data.map(d => d.value), 1);
  });

  totalPedidosCliente = computed(() => this.clienteChartData().reduce((sum, d) => sum + d.value, 0));

  // ==================== COMPUTED: ENTREGADOR ====================
  entregadoresAtivos = computed(() => this.entregadores().filter(e => e.ativo));

  entregadorSelecionado = computed(() => {
    const id = this.entregadorSelecionadoId();
    return id ? this.entregadores().find(e => String(e.id) === id) || null : null;
  });

  entregadorChartData = computed(() => {
    const entregadorId = this.entregadorSelecionadoId();
    const inicio = this.entregadorDataInicio();
    const fim = this.entregadorDataFim();
    const agrupamento = this.entregadorAgrupamento();
    if (!entregadorId || !inicio || !fim) return [];

    const dataInicio = new Date(inicio + 'T00:00:00');
    const dataFim = new Date(fim + 'T23:59:59');

    const adiantamentos = this.adiantamentos().filter(a => {
      const da = new Date(a.data);
      return String(a.entregadorId) === entregadorId && da >= dataInicio && da <= dataFim;
    });

    const periodKeys = this.generatePeriodKeys(inicio, fim, agrupamento);
    const agrupado = new Map<string, { total: number; items: string[] }>();
    periodKeys.forEach(k => agrupado.set(k, { total: 0, items: [] }));
    adiantamentos.forEach(a => {
      const key = this.getDateKey(new Date(a.data), agrupamento);
      const existing = agrupado.get(key) || { total: 0, items: [] };
      existing.total += a.valor;
      existing.items.push(a.descricao);
      agrupado.set(key, existing);
    });

    return periodKeys.map(key => {
      const info = agrupado.get(key) || { total: 0, items: [] };
      return { label: this.formatGroupLabel(key, agrupamento), value: info.total, items: info.items, fullDate: key };
    });
  });

  entregadorChartMax = computed(() => {
    const data = this.entregadorChartData();
    if (data.length === 0) return 1;
    return Math.max(...data.map(d => d.value), 1);
  });

  totalAdiantamentosPeriodo = computed(() => this.entregadorChartData().reduce((sum, d) => sum + d.value, 0));

  // ==================== LIFECYCLE ====================
  ngOnInit() {
    this.clienteService.carregarClientes();
    this.enderecoService.carregarEnderecos();
    this.entregadorService.carregarEntregadores();
    this.produtoService.carregarProdutos();
    this.variavelEstoqueService.carregarVariaveis();
    this.adiantamentoService.carregarAdiantamentos();
    this.vendaService.carregarVendas();

    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const formatDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    this.vendasDataInicio.set(formatDate(firstDay));
    this.vendasDataFim.set(formatDate(lastDay));
    this.estoqueDataInicio.set(formatDate(firstDay));
    this.estoqueDataFim.set(formatDate(lastDay));
    this.quadrasDataInicio.set(formatDate(firstDay));
    this.quadrasDataFim.set(formatDate(lastDay));
    this.vendasQuadraDataInicio.set(formatDate(firstDay));
    this.vendasQuadraDataFim.set(formatDate(lastDay));
    this.clienteDataInicio.set(formatDate(firstDay));
    this.clienteDataFim.set(formatDate(lastDay));
    this.entregadorDataInicio.set(formatDate(firstDay));
    this.entregadorDataFim.set(formatDate(lastDay));
  }

  // ==================== AÇÕES: AGRUPAMENTO ====================
  setAgrupamento(section: string, valor: Agrupamento) {
    switch (section) {
      case 'vendas': this.vendasAgrupamento.set(valor); break;
      case 'estoque': this.estoqueAgrupamento.set(valor); break;
      case 'quadras': this.quadrasAgrupamento.set(valor); break;
      case 'vendasQuadra': this.vendasQuadraAgrupamento.set(valor); break;
      case 'cliente': this.clienteAgrupamento.set(valor); break;
      case 'entregador': this.entregadorAgrupamento.set(valor); break;
    }
  }

  // ==================== AÇÕES: FILTROS ====================
  updateVendasInicio(event: Event) { this.vendasDataInicio.set((event.target as HTMLInputElement).value); }
  updateVendasFim(event: Event) { this.vendasDataFim.set((event.target as HTMLInputElement).value); }
  updateEstoqueInicio(event: Event) { this.estoqueDataInicio.set((event.target as HTMLInputElement).value); }
  updateEstoqueFim(event: Event) { this.estoqueDataFim.set((event.target as HTMLInputElement).value); }
  updateQuadrasInicio(event: Event) { this.quadrasDataInicio.set((event.target as HTMLInputElement).value); }
  updateQuadrasFim(event: Event) { this.quadrasDataFim.set((event.target as HTMLInputElement).value); }
  updateQuadraSearch(event: Event) { this.quadraSearchTerm.set((event.target as HTMLInputElement).value); }
  toggleQuadraDropdown() { this.showQuadraDropdown.update(v => !v); }
  updateVendasQuadraInicio(event: Event) { this.vendasQuadraDataInicio.set((event.target as HTMLInputElement).value); }
  updateVendasQuadraFim(event: Event) { this.vendasQuadraDataFim.set((event.target as HTMLInputElement).value); }
  updateVendasQuadra(event: Event) { this.vendasQuadraSelecionada.set((event.target as HTMLSelectElement).value); }
  updateClienteInicio(event: Event) { this.clienteDataInicio.set((event.target as HTMLInputElement).value); }
  updateClienteFim(event: Event) { this.clienteDataFim.set((event.target as HTMLInputElement).value); }
  updateClienteSearch(event: Event) { this.clienteSearchTerm.set((event.target as HTMLInputElement).value); this.showClienteDropdown.set(true); }
  toggleClienteDropdown() { this.showClienteDropdown.update(v => !v); }
  updateEntregadorInicio(event: Event) { this.entregadorDataInicio.set((event.target as HTMLInputElement).value); }
  updateEntregadorFim(event: Event) { this.entregadorDataFim.set((event.target as HTMLInputElement).value); }
  updateEntregador(event: Event) { this.entregadorSelecionadoId.set((event.target as HTMLSelectElement).value); }

  // Estoque selector
  toggleEstoqueDropdown() { this.showEstoqueDropdown.update(v => !v); }
  updateEstoqueSearch(event: Event) { this.estoqueSearchTerm.set((event.target as HTMLInputElement).value); }

  toggleEstoqueVariavel(id: number) {
    const current = this.estoqueSelecionadas();
    if (current.includes(id)) this.estoqueSelecionadas.set(current.filter(v => v !== id));
    else if (current.length < 10) this.estoqueSelecionadas.set([...current, id]);
  }

  isEstoqueSelecionada(id: number): boolean { return this.estoqueSelecionadas().includes(id); }
  removeEstoqueVariavel(id: number) { this.estoqueSelecionadas.update(list => list.filter(v => v !== id)); }

  getEstoqueNome(id: number): string {
    const v = this.variaveis().find(x => x.id === id);
    return v ? v.nome : '';
  }

  getEstoqueCor(id: number): string {
    const idx = this.estoqueSelecionadas().indexOf(id);
    return idx >= 0 ? this.CORES_ESTOQUE[idx % this.CORES_ESTOQUE.length] : '#ccc';
  }

  toggleQuadra(quadra: string) {
    const current = this.quadrasSelecionadas();
    if (current.includes(quadra)) this.quadrasSelecionadas.set(current.filter(q => q !== quadra));
    else if (current.length < 5) this.quadrasSelecionadas.set([...current, quadra]);
  }

  isQuadraSelecionada(quadra: string): boolean { return this.quadrasSelecionadas().includes(quadra); }
  getCorQuadra(quadra: string): string { const idx = this.quadrasSelecionadas().indexOf(quadra); return idx >= 0 ? this.CORES_QUADRAS[idx] : '#ccc'; }
  removeQuadra(quadra: string) { this.quadrasSelecionadas.update(list => list.filter(q => q !== quadra)); }

  selecionarCliente(id: string | number) {
    this.clienteSelecionadoId.set(String(id));
    this.showClienteDropdown.set(false);
    const cliente = this.clientes().find(c => String(c.id) === String(id));
    if (cliente) this.clienteSearchTerm.set(cliente.nome);
  }

  limparCliente() { this.clienteSelecionadoId.set(''); this.clienteSearchTerm.set(''); }

  // ==================== HELPERS ====================
  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  // ==================== SVG CHART HELPERS ====================
  getBarHeight(value: number, max: number, maxHeight: number = 200): number {
    if (max === 0) return 0;
    return (value / max) * maxHeight;
  }

  getBarY(value: number, max: number, maxHeight: number = 200): number {
    return maxHeight - this.getBarHeight(value, max, maxHeight);
  }

  getLinePoints(pontos: { valor: number }[], max: number, width: number, height: number): string {
    if (pontos.length === 0) return '';
    const stepX = pontos.length > 1 ? width / (pontos.length - 1) : width / 2;
    return pontos.map((p, i) => {
      const x = pontos.length > 1 ? i * stepX : width / 2;
      const y = height - (max > 0 ? (p.valor / max) * height : 0);
      return `${x},${y}`;
    }).join(' ');
  }

  getAreaPoints(pontos: { valor: number }[], max: number, width: number, height: number): string {
    if (pontos.length === 0) return '';
    const stepX = pontos.length > 1 ? width / (pontos.length - 1) : width / 2;
    const linePoints = pontos.map((p, i) => {
      const x = pontos.length > 1 ? i * stepX : width / 2;
      const y = height - (max > 0 ? (p.valor / max) * height : 0);
      return `${x},${y}`;
    });
    const lastX = pontos.length > 1 ? (pontos.length - 1) * stepX : width / 2;
    return `0,${height} ${linePoints.join(' ')} ${lastX},${height}`;
  }

  getGridLines(max: number, count: number = 4): number[] {
    if (max === 0) return [0];
    const step = Math.ceil(max / count);
    const lines = [];
    for (let i = 0; i <= count; i++) lines.push(Math.min(i * step, max));
    return lines;
  }

  getGridY(value: number, max: number, height: number): number {
    if (max === 0) return height;
    return height - (value / max) * height;
  }

  getBarWidth(totalItems: number, chartWidth: number): number {
    const maxWidth = 60;
    const minWidth = 8;
    const gap = 4;
    const available = chartWidth / totalItems - gap;
    return Math.max(minWidth, Math.min(maxWidth, available));
  }

  getChartMinWidth(dataCount: number, minPerItem: number = 50): number {
    return Math.max(500, dataCount * minPerItem);
  }

  // Tooltip
  activeTooltip = signal<{ section: string; index: number; x: number; y: number } | null>(null);
  showTooltip(section: string, index: number, event: MouseEvent) {
    const rect = (event.target as Element).getBoundingClientRect();
    this.activeTooltip.set({ section, index, x: rect.left + rect.width / 2, y: rect.top - 10 });
  }
  hideTooltip() { this.activeTooltip.set(null); }

  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.estoque-selector')) this.showEstoqueDropdown.set(false);
    if (!target.closest('.quadra-selector')) this.showQuadraDropdown.set(false);
    if (!target.closest('.cliente-selector')) this.showClienteDropdown.set(false);
    if (!target.closest('.summary-card')) this.cardDropdownAberto.set(null);
  }

  trackByIndex(index: number): number { return index; }
  trackByQuadra(index: number, item: { quadra: string }): string { return item.quadra; }
  trackById(index: number, item: { id: string | number }): string { return String(item.id); }
}