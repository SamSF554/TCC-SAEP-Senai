function inteiro(valor, minimo = 0) {
  if (typeof valor !== 'number' && typeof valor !== 'string') return null;
  if (typeof valor === 'string' && !/^\d+$/.test(valor.trim())) return null;
  const numero = Number(valor);
  // INT no MySQL: não permite quantidades acima do limite da coluna.
  return Number.isSafeInteger(numero) && numero >= minimo && numero <= 2147483647 ? numero : null;
}

function textoObrigatorio(valor) {
  return typeof valor === 'string' ? valor.trim() : '';
}

module.exports = { inteiro, textoObrigatorio };
