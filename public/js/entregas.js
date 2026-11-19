/**
 * Módulo de Gestão de Entregas (`entregas.js`)
 * - Suporta ordenação decrescente (mais recentes primeiro)
 * - Paginação de 6 itens por página
 * - Badges de status coloridos: PENDENTE (cinza), EM TRÂNSITO (amarelo), ENTREGUE (verde)
 */

let paginaAtualEntregas = 1;
const ITENS_POR_PAGINA = 6;
let todasEntregas = [];

async function carregarFormularioELista() {
  const selectProduto = document.getElementById('e_produto');
  const selectVeiculo = document.getElementById('e_veiculo');
  const tbody = document.getElementById('tabela-entregas-body');

  try {
    // Carrega produtos do estoque para a caixa de seleção
    const resP = await fetchAutenticado('/produtos');
    if (!resP.ok) throw new Error('Erro ao carregar produtos.');
    const produtos = await resP.json();

    if (selectProduto && Array.isArray(produtos)) {
      selectProduto.innerHTML = '<option value="">Selecione o produto do estoque...</option>' +
        produtos.map(p => `<option value="${p.id}">${protegerTexto(p.nome)} (${protegerTexto(p.codigo)}) — Disponível: ${p.quantidade} un.</option>`).join('');
    }

    // Carrega veículos da frota
    const resV = await fetchAutenticado('/veiculos');
    if (!resV.ok) throw new Error('Erro ao carregar veículos.');
    const veiculos = await resV.json();

    if (selectVeiculo && Array.isArray(veiculos)) {
      selectVeiculo.innerHTML = '<option value="">Selecione o veículo da frota...</option>' +
        veiculos.map(v => `<option value="${v.id}">${protegerTexto(v.modelo)} (${protegerTexto(v.placa)}) — Cap: ${v.capacidade_kg}kg</option>`).join('');
    }

    // Carrega lista de entregas
    const resE = await fetchAutenticado('/entregas');
    if (!resE.ok) throw new Error('Erro ao carregar entregas.');
    const entregas = await resE.json();

    if (!tbody) return;

    if (!Array.isArray(entregas) || !entregas.length) {
      todasEntregas = [];
      tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Nenhuma entrega cadastrada.</td></tr>';
      if (typeof renderizarControlesPaginacao === 'function') {
        renderizarControlesPaginacao('paginacao-entregas', 0, 1, null);
      }
      return;
    }

    // Ordenação decrescente por ID (Mais recentes primeiro)
    todasEntregas = entregas.sort((a, b) => b.id - a.id);

    renderizarTabelaEntregas();
  } catch (err) {
    if (tbody) tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: red;">Erro ao carregar dados.</td></tr>';
  }
}

function renderizarTabelaEntregas() {
  const tbody = document.getElementById('tabela-entregas-body');
  if (!tbody) return;

  const totalPaginas = Math.ceil(todasEntregas.length / ITENS_POR_PAGINA) || 1;

  if (paginaAtualEntregas > totalPaginas) paginaAtualEntregas = totalPaginas;
  if (paginaAtualEntregas < 1) paginaAtualEntregas = 1;

  const inicio = (paginaAtualEntregas - 1) * ITENS_POR_PAGINA;
  const fim = inicio + ITENS_POR_PAGINA;
  const entregasPagina = todasEntregas.slice(inicio, fim);

  tbody.innerHTML = entregasPagina.map(e => {
    const prodNome = e.Produto ? protegerTexto(e.Produto.nome) : 'Produto N/D';
    const veicModelo = e.Veiculo ? protegerTexto(e.Veiculo.modelo) : 'Não alocado';

    // Definição de cores dinâmicas dos badges de status
    let statusTexto = 'PENDENTE';
    let bgCor = 'rgba(108, 117, 125, 0.18)'; // Cinza padrão
    let textoCor = '#495057';

    const st = (e.status || '').toLowerCase();

    if (st === 'em_transito') {
      statusTexto = 'EM TRÂNSITO';
      bgCor = 'rgba(255, 193, 7, 0.25)';   // Amarelo
      textoCor = '#856404';
    } else if (st === 'entregue' || st === 'concluido') {
      statusTexto = 'ENTREGUE';
      bgCor = 'rgba(76, 112, 38, 0.15)';   // Verde
      textoCor = 'var(--verde-escuro)';
    }

    return `
      <tr>
        <td><strong>${protegerTexto(e.codigo_rastreio)}</strong></td>
        <td>${protegerTexto(e.destino)}</td>
        <td>${prodNome} (${e.peso_kg} un/kg)</td>
        <td>${veicModelo}</td>
        <td>
          <span style="padding: 4px 12px; border-radius: 12px; font-weight: 700; background: ${bgCor}; color: ${textoCor};">
            ${statusTexto}
          </span>
        </td>
      </tr>
    `;
  }).join('');

  if (typeof renderizarControlesPaginacao === 'function') {
    renderizarControlesPaginacao('paginacao-entregas', totalPaginas, paginaAtualEntregas, (novaPagina) => {
      paginaAtualEntregas = novaPagina;
      renderizarTabelaEntregas();
    });
  }
}

// Submissão do formulário de criação de entrega
const formEntrega = document.getElementById('form-entrega');
if (formEntrega) {
  formEntrega.addEventListener('submit', async function (e) {
    e.preventDefault();
    const elemMsg = document.getElementById('mensagem-entrega');

    const dados = {
      codigo_rastreio: document.getElementById('e_codigo').value,
      destino: document.getElementById('e_destino').value,
      peso_kg: Number(document.getElementById('e_peso').value),
      produto_id: document.getElementById('e_produto').value,
      veiculo_id: document.getElementById('e_veiculo').value || null
    };

    try {
      const res = await fetchAutenticado('/entregas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
      });
      const json = await res.json();

      if (res.ok) {
        elemMsg.textContent = '✅ ' + json.mensagem;
        elemMsg.style.color = '#4C7026';
        formEntrega.reset();
        paginaAtualEntregas = 1; // Retorna para a 1ª página para exibir a nova entrega no topo
        carregarFormularioELista();
      } else {
        elemMsg.textContent = '⚠️ ' + (json.mensagem || 'Erro ao registrar entrega.');
        elemMsg.style.color = '#c53030';
      }
    } catch (err) {
      elemMsg.textContent = '⚠️ Erro de comunicação com o servidor.';
      elemMsg.style.color = '#c53030';
    }
  });
}

document.addEventListener('DOMContentLoaded', carregarFormularioELista);
