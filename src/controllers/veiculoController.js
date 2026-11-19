const Veiculo = require('../models/Veiculo');
const Entrega = require('../models/Entrega');
const { inteiro, textoObrigatorio } = require('../utils/validacao');

async function listar(req, res) {
  try {
    const veiculos = await Veiculo.findAll();
    res.json(veiculos);
  } catch (err) {
    res.status(500).json({ mensagem: 'Erro ao listar veículos', erro: err.message });
  }
}

async function criar(req, res) {
  try {
    let { placa, modelo, tipo, capacidade_kg } = req.body || {};

    const capacidadeNum = inteiro(capacidade_kg, 1);
    if (!textoObrigatorio(placa) || !textoObrigatorio(modelo) || capacidadeNum === null) {
      return res.status(400).json({ mensagem: 'Informe placa, modelo e capacidade inteira maior que zero.' });
    }

    placa = placa.trim().toUpperCase();
    modelo = modelo.trim();

    const existe = await Veiculo.findOne({ where: { placa } });
    if (existe) {
      return res.status(400).json({ mensagem: `O veículo com a placa ${placa} já está cadastrado!` });
    }

    const novo = await Veiculo.create({
      placa,
      modelo,
      tipo: tipo || 'Carro',
      capacidade_kg: capacidadeNum,
      status: 'disponivel'
    });

    res.status(201).json({ mensagem: 'Veículo cadastrado na frota com sucesso!', veiculo: novo });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ mensagem: 'Já existe veículo com esta placa.' });
    }
    res.status(500).json({ mensagem: 'Erro ao cadastrar veículo.' });
  }
}

async function deletar(req, res) {
  try {
    const { id } = req.params;
    if (await Entrega.findOne({ where: { veiculo_id: id } })) {
      return res.status(409).json({ mensagem: 'O veículo está vinculado a entregas e não pode ser removido.' });
    }
    const excluidos = await Veiculo.destroy({ where: { id } });
    if (!excluidos) return res.status(404).json({ mensagem: 'Veículo não encontrado.' });
    res.json({ mensagem: 'Veículo removido com sucesso!' });
  } catch (err) {
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(409).json({ mensagem: 'O veículo está vinculado a entregas e não pode ser removido.' });
    }
    res.status(500).json({ mensagem: 'Erro ao remover veículo.' });
  }
}

module.exports = { listar, criar, deletar };
