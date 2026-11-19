/**
 * Módulo JavaScript Global (`comum.js`)
 * --------------------------------------------------------------------------
 * Contém funções utilitárias reutilizáveis em todas as páginas:
 * - Proteção contra XSS (`protegerTexto`)
 * - Controle de Sessão JWT e Visibilidade de Menus (`verificarSessaoGlobal`)
 * - Componente Reutilizável de Paginação (`renderizarControlesPaginacao`)
 */

// Exibe caixas de alerta dinâmicas na interface
function exibirAlerta(elemId, texto, tipo) {
  const elem = document.getElementById(elemId);
  if (elem) {
    elem.textContent = texto;
    elem.className = 'alerta-box ' + (tipo === 'sucesso' ? 'alerta-sucesso' : 'alerta-erro');
  }
}

// Encerra a sessão e redireciona para a página inicial
function fazerLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  window.location.href = 'index.html';
}

// Higieniza entradas de texto para evitar injeções XSS no navegador
function protegerTexto(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Toda chamada a endpoints privados passa o token emitido no login.
async function fetchAutenticado(url, opcoes = {}) {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    throw new Error('Sessão não encontrada.');
  }
  const resposta = await fetch(url, {
    ...opcoes,
    headers: { ...opcoes.headers, Authorization: `Bearer ${token}` }
  });
  if (resposta.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = 'login.html';
    throw new Error('Sessão expirada.');
  }
  return resposta;
}

/**
 * COMPONENTE REUTILIZÁVEL DE PAGINAÇÃO (v9.1)
 * Renderiza botões 'Anterior' / 'Próximo' e contador de páginas.
 */
function renderizarControlesPaginacao(containerId, totalPaginas, paginaAtual, callbackMudarPagina) {
  let container = document.getElementById(containerId);
  if (!container) return;

  if (totalPaginas <= 1) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--border-light);">
      <button class="btn-acao" id="${containerId}-btn-ant" ${paginaAtual === 1 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
        ◀ Anterior
      </button>
      <span style="font-weight: 700; color: var(--azul-escuro); font-size: 0.95rem;">
        Página ${paginaAtual} de ${totalPaginas}
      </span>
      <button class="btn-acao" id="${containerId}-btn-prox" ${paginaAtual === totalPaginas ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
        Próximo ▶
      </button>
    </div>
  `;

  const btnAnt = document.getElementById(`${containerId}-btn-ant`);
  const btnProx = document.getElementById(`${containerId}-btn-prox`);

  if (btnAnt && paginaAtual > 1) {
    btnAnt.onclick = () => callbackMudarPagina(paginaAtual - 1);
  }
  if (btnProx && paginaAtual < totalPaginas) {
    btnProx.onclick = () => callbackMudarPagina(paginaAtual + 1);
  }
}

/**
 * Gerencia a navegação e visibilidade de links com base no perfil do utilizador.
 */
async function verificarSessaoGlobal() {
  const token = localStorage.getItem('token');
  const usuarioRaw = localStorage.getItem('usuario');

  const navLogado = document.querySelectorAll('.nav-logado');
  const navAdmin = document.querySelectorAll('.nav-admin');
  const btnLogin = document.getElementById('nav-btn-login');
  const btnLogout = document.getElementById('nav-btn-logout');
  const spanNome = document.getElementById('nav-usuario-nome');

  const paginaAtual = window.location.pathname.split('/').pop() || 'index.html';

  if (token && usuarioRaw) {
    try {
      // O perfil que vem do navegador não é uma fonte confiável.
      // Atualizamos os dados com o banco antes de habilitar menus privados.
      const res = await fetchAutenticado('/auth/me');
      if (!res.ok) throw new Error('Erro ao validar sessão.');
      const usuario = await res.json();
      localStorage.setItem('usuario', JSON.stringify(usuario));

      // Redireciona ADM autenticado se tentar acessar a tela de login
      if (usuario.perfil === 'administrador' && paginaAtual === 'login.html') {
        window.location.href = 'admin.html';
        return;
      }

      if (btnLogin) btnLogin.style.display = 'none';
      if (btnLogout) btnLogout.style.display = 'inline-block';
      if (spanNome) {
        spanNome.textContent = `👋 ${usuario.nome} (${usuario.perfil === 'administrador' ? 'Admin' : 'Operador'})`;
        spanNome.style.display = 'inline-block';
      }

      // Exibe links de telas logadas (Entregas)
      navLogado.forEach(el => el.style.display = 'inline-block');

      // Exibe links de Administrador (Estoque, Veículos, Painel Admin)
      if (usuario.perfil === 'administrador') {
        navAdmin.forEach(el => el.style.display = 'inline-block');
      } else {
        navAdmin.forEach(el => el.style.display = 'none');
      }

      if (['admin.html', 'estoque.html', 'veiculos.html'].includes(paginaAtual) && usuario.perfil !== 'administrador') {
        window.location.replace('index.html');
      }
    } catch (e) {
      if (!localStorage.getItem('token')) return; // O fetch já redirecionou em 401.
      console.error('Erro ao validar sessão:', e);
      if (['admin.html', 'estoque.html', 'veiculos.html', 'entregas.html'].includes(paginaAtual)) {
        window.location.replace('login.html');
      }
    }
  } else {
    // Não autenticado
    navLogado.forEach(el => el.style.display = 'none');
    navAdmin.forEach(el => el.style.display = 'none');
    if (btnLogin) btnLogin.style.display = 'inline-block';
    if (btnLogout) btnLogout.style.display = 'none';
    if (spanNome) spanNome.style.display = 'none';
    if (['admin.html', 'estoque.html', 'veiculos.html', 'entregas.html'].includes(paginaAtual)) {
      window.location.replace('login.html');
    }
  }
}

document.addEventListener('DOMContentLoaded', verificarSessaoGlobal);
