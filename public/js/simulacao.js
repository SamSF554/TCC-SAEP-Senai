const formSimulacao = document.getElementById('form-simulacao');
const inputPartida = document.getElementById('partida');
const inputEntrega = document.getElementById('entrega');
const rota = document.getElementById('routePath');
const marcador = document.getElementById('vehicle');
let animacao = null;

function reiniciarAnimacao() {
  if (!rota || !marcador) return;
  if (animacao !== null) cancelAnimationFrame(animacao);

  const comprimento = rota.getTotalLength();
  const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const duracao = reduzirMovimento ? 0 : 5000;
  let inicio = null;

  function quadro(tempo) {
    if (inicio === null) inicio = tempo;
    const progresso = duracao ? Math.min((tempo - inicio) / duracao, 1) : 1;
    const posicao = rota.getPointAtLength(progresso * comprimento);
    marcador.setAttribute('cx', posicao.x);
    marcador.setAttribute('cy', posicao.y);
    if (progresso < 1) animacao = requestAnimationFrame(quadro);
    else animacao = null;
  }

  animacao = requestAnimationFrame(quadro);
}

async function calcularSimulacao(evento) {
  if (evento) evento.preventDefault();
  const partida = inputPartida?.value.trim();
  const entrega = inputEntrega?.value.trim();
  if (!partida || !entrega) return;

  const mensagem = document.getElementById('sim-mensagem');
  try {
    const resposta = await fetch('/simular', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partida, entrega })
    });
    const dados = await resposta.json();
    if (!resposta.ok) throw new Error(dados.mensagem || 'Não foi possível simular.');

    document.getElementById('sim-distancia').textContent = dados.distancia;
    document.getElementById('sim-tempo').textContent = dados.tempo;
    document.getElementById('sim-transito').textContent = dados.transito;
    mensagem.textContent = 'Resultado demonstrativo: os valores não representam um trajeto real.';
    reiniciarAnimacao();
  } catch (erro) {
    mensagem.textContent = erro.message || 'Falha na comunicação com o servidor.';
  }
}

formSimulacao?.addEventListener('submit', calcularSimulacao);
document.getElementById('replayBtn')?.addEventListener('click', reiniciarAnimacao);

const parametros = new URLSearchParams(window.location.search);
if (inputPartida && inputEntrega) {
  inputPartida.value = parametros.get('partida') || '';
  inputEntrega.value = parametros.get('entrega') || '';
  if (inputPartida.value && inputEntrega.value) calcularSimulacao();
  else reiniciarAnimacao();
}
