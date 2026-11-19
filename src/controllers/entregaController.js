const { Op } = require('sequelize');
const Entrega = require('../models/Entrega');
const Veiculo = require('../models/Veiculo');
const Produto = require('../models/Produto');
const { inteiro, textoObrigatorio } = require('../utils/validacao');

function falha(mensagem, status = 400) {
  return Object.assign(new Error(mensagem), { status });
}

function responderErro(res, erro, contexto) {
  if (erro.status) return res.status(erro.status).json({ mensagem: erro.message });
  if (erro.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ mensagem: 'Este código de rastreio já está cadastrado.' });
  }
  console.error(contexto, erro);
  return res.status(500).json({ mensagem: 'Ocorreu um erro interno ao processar a entrega.' });
}

async function listar(req, res) {
  try {
    const filtro = req.usuario.perfil === 'administrador' ? {} : { usuario_id: req.usuario.id };
    const entregas = await Entrega.findAll({
      where: filtro,
      include: [Veiculo, Produto],
      order: [['id', 'DESC']]
    });
    res.json(entregas);
  } catch (erro) {
    responderErro(res, erro, 'Erro ao listar entregas:');
  }
}

async function criar(req, res) {
  const { codigo_rastreio, destino, peso_kg, produto_id, veiculo_id } = req.body || {};
  const codigo = textoObrigatorio(codigo_rastreio);
  const destinoLimpo = textoObrigatorio(destino);
  const quantidade = inteiro(peso_kg, 1);
  const produtoId = inteiro(produto_id, 1);
  const veiculoId = veiculo_id == null || veiculo_id === '' ? null : inteiro(veiculo_id, 1);

  if (!codigo || codigo.length > 255 || !destinoLimpo || destinoLimpo.length > 255 ||
      !quantidade || !produtoId || (veiculoId === null && veiculo_id != null && veiculo_id !== '')) {
    return res.status(400).json({ mensagem: 'Informe código, destino, produto e quantidade inteira maior que zero.' });
  }

  try {
    const nova = await Entrega.sequelize.transaction(async transaction => {
      const produto = await Produto.findByPk(produtoId, { transaction });
      if (!produto) throw falha('Produto selecionado não existe no estoque.', 404);

      if (veiculoId) {
        const veiculo = await Veiculo.findByPk(veiculoId, { transaction });
        if (!veiculo) throw falha('Veículo selecionado não existe.', 404);
        if (quantidade > veiculo.capacidade_kg) {
          throw falha(`A quantidade informada excede a capacidade máxima do veículo (${veiculo.capacidade_kg} kg).`);
        }
      }

      // Atualização condicional e transacional: impede estoque negativo e
      // reverte o desconto se o código de rastreio já existir.
      const [alterados] = await Produto.update(
        { quantidade: Produto.sequelize.literal(`quantidade - ${quantidade}`) },
        { where: { id: produtoId, quantidade: { [Op.gte]: quantidade } }, transaction }
      );
      if (alterados === 0) throw falha('Estoque insuficiente para a quantidade solicitada.');

      return Entrega.create({
        codigo_rastreio: codigo,
        destino: destinoLimpo,
        peso_kg: quantidade,
        produto_id: produtoId,
        veiculo_id: veiculoId,
        usuario_id: req.usuario.id,
        status: 'pendente'
      }, { transaction });
    });

    res.status(201).json({ mensagem: 'Entrega registrada com sucesso! Status inicial: Pendente.', entrega: nova });
  } catch (erro) {
    responderErro(res, erro, 'Erro ao criar entrega:');
  }
}

async function atualizarStatus(req, res) {
  const id = inteiro(req.params.id, 1);
  const { status, veiculo_id } = req.body || {};
  const veiculoId = veiculo_id == null || veiculo_id === '' ? null : inteiro(veiculo_id, 1);
  const statusValidos = ['pendente', 'em_transito', 'entregue'];
  if (!id || !statusValidos.includes(status) || (veiculoId === null && veiculo_id != null && veiculo_id !== '')) {
    return res.status(400).json({ mensagem: 'Identificador, status ou veículo inválido.' });
  }

  try {
    const entrega = await Entrega.findByPk(id);
    if (!entrega) return res.status(404).json({ mensagem: 'Entrega não encontrada.' });

    if (veiculoId) {
      const veiculo = await Veiculo.findByPk(veiculoId);
      if (!veiculo) return res.status(404).json({ mensagem: 'Veículo não encontrado.' });
      if (entrega.peso_kg > veiculo.capacidade_kg) {
        return res.status(400).json({ mensagem: 'Capacidade do veículo insuficiente para esta entrega.' });
      }
    }

    await entrega.update({ status, veiculo_id: veiculoId });
    return res.json({ mensagem: 'Status e veículo da entrega atualizados!', entrega });
  } catch (erro) {
    return responderErro(res, erro, 'Erro ao atualizar entrega:');
  }
}

module.exports = { listar, criar, atualizarStatus };
