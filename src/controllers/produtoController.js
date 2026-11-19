const Produto = require('../models/Produto');
const Entrega = require('../models/Entrega');
const { inteiro, textoObrigatorio } = require('../utils/validacao');

async function listar(req, res) {
  try {
    const produtos = await Produto.findAll();
    res.json(produtos);
  } catch (err) {
    res.status(500).json({ mensagem: 'Erro ao listar estoque', erro: err.message });
  }
}

async function criar(req, res) {
  try {
    const { codigo, nome, categoria, quantidade } = req.body || {};
    const codigoLimpo = textoObrigatorio(codigo);
    const nomeLimpo = textoObrigatorio(nome);
    const qtd = inteiro(quantidade, 0);
    if (!codigoLimpo || !nomeLimpo || qtd === null) {
      return res.status(400).json({ mensagem: 'Informe código, nome e quantidade inteira não negativa.' });
    }

    const existe = await Produto.findOne({ where: { codigo: codigoLimpo } });
    if (existe) {
      return res.status(400).json({ mensagem: 'Produto com este código já existe no estoque.' });
    }

    const prod = await Produto.create({
      codigo: codigoLimpo,
      nome: nomeLimpo,
      categoria: textoObrigatorio(categoria) || 'Geral',
      quantidade: qtd
    });

    res.status(201).json({ mensagem: 'Produto adicionado ao estoque!', produto: prod });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ mensagem: 'Produto com este código já existe no estoque.' });
    }
    res.status(500).json({ mensagem: 'Erro ao cadastrar produto.' });
  }
}

async function novaRemessa(req, res) {
  try {
    const { id } = req.params;
    const quantidadeAdicional = inteiro(req.body?.quantidade, 1);

    if (quantidadeAdicional === null) {
      return res.status(400).json({ 
        mensagem: 'A quantidade da nova remessa deve ser um número positivo maior que zero (> 0).' 
      });
    }

    const produto = await Produto.findByPk(id);
    if (!produto) {
      return res.status(404).json({ mensagem: 'Produto não encontrado no estoque.' });
    }

    await produto.increment('quantidade', { by: quantidadeAdicional });
    await produto.reload();

    res.json({ 
      mensagem: `Nova remessa de +${quantidadeAdicional} itens adicionada! Total em estoque: ${produto.quantidade}`, 
      produto 
    });
  } catch (err) {
    res.status(500).json({ mensagem: 'Erro ao adicionar nova remessa.' });
  }
}

async function deletar(req, res) {
  try {
    const { id } = req.params;
    if (await Entrega.findOne({ where: { produto_id: id } })) {
      return res.status(409).json({ mensagem: 'O produto possui entregas vinculadas e não pode ser excluído.' });
    }
    const excluidos = await Produto.destroy({ where: { id } });
    if (!excluidos) return res.status(404).json({ mensagem: 'Produto não encontrado.' });
    res.json({ mensagem: 'Produto removido do estoque!' });
  } catch (err) {
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(409).json({ mensagem: 'O produto possui entregas vinculadas e não pode ser excluído.' });
    }
    res.status(500).json({ mensagem: 'Erro ao excluir produto.' });
  }
}

module.exports = { listar, criar, novaRemessa, deletar };
