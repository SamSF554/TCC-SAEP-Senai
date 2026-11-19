/**
 * Módulo de Gestão de Estoque (`estoque.js`)
 * - Paginação de 6 itens por página
 * - Ordenação da MAIOR quantidade em estoque para a MENOR quantidade
 * - Botão "+ Nova Remessa" com validação estrita (> 0)
 */

let paginaAtualEstoque = 1;
const ITENS_POR_PAGINA = 6;
let todosProdutos = [];

async function carregarEstoque() {
  const tbody = document.getElementById('tabela-estoque-body');
  try {
    const res = await fetchAutenticado('/produtos');
    if (!res.ok) throw new Error('Erro ao carregar estoque.');
    const produtos = await res.json();

    if (!tbody) return;

    if (!Array.isArray(produtos) || !produtos.length) {
      todosProdutos = [];
      tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Nenhum produto cadastrado no estoque.</td></tr>';
      if (typeof renderizarControlesPaginacao === 'function') {
        renderizarControlesPaginacao('paginacao-estoque', 0, 1, null);
      }
      return;
    }

    // Ordenação: Da MAIOR quantidade para a MENOR quantidade em estoque
    todosProdutos = produtos.sort((a, b) => b.quantidade - a.quantidade);

    renderizarTabelaEstoque();
  } catch (err) {
    if (tbody) tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: red;">Erro ao carregar estoque.</td></tr>';
  }
}

function renderizarTabelaEstoque() {
  const tbody = document.getElementById('tabela-estoque-body');
  if (!tbody) return;

  const totalPaginas = Math.ceil(todosProdutos.length / ITENS_POR_PAGINA) || 1;

  if (paginaAtualEstoque > totalPaginas) paginaAtualEstoque = totalPaginas;
  if (paginaAtualEstoque < 1) paginaAtualEstoque = 1;

  const inicio = (paginaAtualEstoque - 1) * ITENS_POR_PAGINA;
  const fim = inicio + ITENS_POR_PAGINA;
  const produtosPagina = todosProdutos.slice(inicio, fim);

  tbody.innerHTML = produtosPagina.map(p => `
    <tr>
      <td><strong>${protegerTexto(p.codigo)}</strong></td>
      <td>${protegerTexto(p.nome)}</td>
      <td>${protegerTexto(p.categoria)}</td>
      <td><strong style="font-size: 1.1rem; color: var(--verde-escuro);">${p.quantidade} un.</strong></td>
      <td>
        <button class="btn-acao" onclick="adicionarRemessa(${p.id})">+ Nova Remessa</button>
        <button class="btn-acao btn-danger" onclick="excluirProduto(${p.id})">Excluir</button>
      </td>
    </tr>
  `).join('');

  if (typeof renderizarControlesPaginacao === 'function') {
    renderizarControlesPaginacao('paginacao-estoque', totalPaginas, paginaAtualEstoque, (novaPagina) => {
      paginaAtualEstoque = novaPagina;
      renderizarTabelaEstoque();
    });
  }
}

// Incrementa o estoque com validação de números positivos (> 0)
async function adicionarRemessa(id) {
  const valor = prompt('Digite a quantidade da Nova Remessa (aceita apenas números inteiros positivos maiores que 0):');
  if (valor === null) return;

  const quantidade = Number(valor);

  if (!Number.isSafeInteger(quantidade) || quantidade <= 0) {
    alert('⚠️ Valor inválido! A Nova Remessa aceita APENAS números positivos maiores que zero (> 0).');
    return;
  }

  const res = await fetchAutenticado(`/produtos/${id}/remessa`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantidade })
  });

  const json = await res.json();
  if (res.ok) {
    alert('✅ ' + json.mensagem);
    carregarEstoque();
  } else {
    alert('⚠️ ' + json.mensagem);
  }
}

async function excluirProduto(id) {
  if (confirm('Tem certeza que deseja remover este item do estoque?')) {
    try {
      const res = await fetchAutenticado(`/produtos/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const erro = await res.json();
        return alert('⚠️ ' + (erro.mensagem || 'Não foi possível excluir.'));
      }
      carregarEstoque();
    } catch (erro) {
      alert('Não foi possível comunicar com o servidor.');
    }
  }
}

// Cadastro de novo produto no estoque
const formProd = document.getElementById('form-produto');
if (formProd) {
  formProd.addEventListener('submit', async function (e) {
    e.preventDefault();
    const dados = {
      codigo: document.getElementById('p_codigo').value,
      nome: document.getElementById('p_nome').value,
      categoria: document.getElementById('p_categoria').value || 'Geral',
      quantidade: Number(document.getElementById('p_qtd').value)
    };

    const res = await fetchAutenticado('/produtos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });

    if (res.ok) {
      formProd.reset();
      paginaAtualEstoque = 1;
      carregarEstoque();
    } else {
      const json = await res.json();
      alert('⚠️ ' + json.mensagem);
    }
  });
}

document.addEventListener('DOMContentLoaded', carregarEstoque);
