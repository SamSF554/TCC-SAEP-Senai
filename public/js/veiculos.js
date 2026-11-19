let paginaAtualVeiculos = 1;
const ITENS_POR_PAGINA = 6;
let todosVeiculos = [];

async function carregarVeiculos() {
  const tbody = document.getElementById('tabela-veiculos-body');
  try {
    const res = await fetchAutenticado('/veiculos');
    if (!res.ok) throw new Error('Erro ao carregar veículos.');
    const veiculos = await res.json();

    if (!tbody) return;

    if (!Array.isArray(veiculos) || !veiculos.length) {
      todosVeiculos = [];
      tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Nenhum veículo cadastrado na frota.</td></tr>';
      if (typeof renderizarControlesPaginacao === 'function') {
        renderizarControlesPaginacao('paginacao-veiculos', 0, 1, null);
      }
      return;
    }

    // Ordenação: Da capacidade mais alta (maior) para a mais baixa (menor)
    todosVeiculos = veiculos.sort((a, b) => b.capacidade_kg - a.capacidade_kg);

    renderizarTabelaVeiculos();
  } catch (err) {
    if (tbody) tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: red;">Erro ao carregar veículos.</td></tr>';
  }
}

function renderizarTabelaVeiculos() {
  const tbody = document.getElementById('tabela-veiculos-body');
  if (!tbody) return;

  const totalPaginas = Math.ceil(todosVeiculos.length / ITENS_POR_PAGINA) || 1;

  if (paginaAtualVeiculos > totalPaginas) paginaAtualVeiculos = totalPaginas;
  if (paginaAtualVeiculos < 1) paginaAtualVeiculos = 1;

  const inicio = (paginaAtualVeiculos - 1) * ITENS_POR_PAGINA;
  const fim = inicio + ITENS_POR_PAGINA;
  const veiculosPagina = todosVeiculos.slice(inicio, fim);

  tbody.innerHTML = veiculosPagina.map(v => `
    <tr>
      <td><strong>${protegerTexto(v.placa)}</strong></td>
      <td>${protegerTexto(v.modelo)}</td>
      <td>${protegerTexto(v.tipo)}</td>
      <td><strong style="font-size: 1.1rem; color: var(--verde-escuro);">${v.capacidade_kg} kg</strong></td>
      <td>
        <button class="btn-acao btn-danger" onclick="excluirVeiculo(${v.id})">Remover</button>
      </td>
    </tr>
  `).join('');

  if (typeof renderizarControlesPaginacao === 'function') {
    renderizarControlesPaginacao('paginacao-veiculos', totalPaginas, paginaAtualVeiculos, (novaPagina) => {
      paginaAtualVeiculos = novaPagina;
      renderizarTabelaVeiculos();
    });
  }
}

async function excluirVeiculo(id) {
  if (confirm('Remover este veículo da frota?')) {
    try {
      const res = await fetchAutenticado(`/veiculos/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const erro = await res.json();
        return alert('⚠️ ' + (erro.mensagem || 'Não foi possível remover.'));
      }
      carregarVeiculos();
    } catch (erro) {
      alert('Não foi possível comunicar com o servidor.');
    }
  }
}

const formVeic = document.getElementById('form-veiculo');
if (formVeic) {
  formVeic.addEventListener('submit', async function (e) {
    e.preventDefault();
    const dados = {
      placa: document.getElementById('v_placa').value,
      modelo: document.getElementById('v_modelo').value,
      tipo: document.getElementById('v_tipo').value,
      capacidade_kg: Number(document.getElementById('v_capacidade').value)
    };

    const res = await fetchAutenticado('/veiculos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });

    if (res.ok) {
      formVeic.reset();
      paginaAtualVeiculos = 1; // Retorna para a 1ª página para mostrar o veículo recém-criado no topo
      carregarVeiculos();
    } else {
      const json = await res.json();
      alert('⚠️ ' + json.mensagem);
    }
  });
}

document.addEventListener('DOMContentLoaded', carregarVeiculos);
