async function simular(req, res) {
  try {
    const { partida, entrega } = req.body || {};
    if (typeof partida !== 'string' || typeof entrega !== 'string' || !partida.trim() || !entrega.trim()) {
      return res.status(400).json({ mensagem: 'Informe a partida e a entrega.' });
    }
    
    res.json({
      partida: partida.trim(),
      entrega: entrega.trim(),
      distancia: '12.4 km',
      tempo: '28 min',
      transito: 'Moderado',
      demonstracao: true
    });
  } catch (err) {
    res.status(500).json({ mensagem: 'Erro na simulação de rota.' });
  }
}

module.exports = { simular };
