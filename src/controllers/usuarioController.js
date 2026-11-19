const bcrypt = require('bcrypt');
const Usuario = require('../models/Usuario');

async function cadastrar(req, res) {
  try {
    const { nome, email, senha, cpf_cnpj, cidade, veiculo_preferencia, tipo_conta } = req.body;

    if (typeof nome !== 'string' || !nome.trim() || typeof email !== 'string' || !email.trim() || typeof senha !== 'string' || senha.length < 8) {
      return res.status(400).json({ mensagem: 'Preencha nome, e-mail e senha (mínimo de 8 caracteres).' });
    }

    const emailNormalizado = email.trim().toLowerCase();
    const usuarioExiste = await Usuario.findOne({ where: { email: emailNormalizado } });
    if (usuarioExiste) {
      return res.status(400).json({ mensagem: 'Este e-mail já está cadastrado no sistema.' });
    }

    const senhaCriptografada = await bcrypt.hash(senha, 12);
    const usuario = await Usuario.create({
      nome: nome.trim(),
      email: emailNormalizado,
      senha: senhaCriptografada,
      cpf_cnpj: cpf_cnpj || '',
      cidade: cidade || '',
      veiculo_preferencia: veiculo_preferencia || 'Carro',
      tipo_conta: tipo_conta === 'corporativa' ? 'corporativa' : 'pessoal',
      perfil: 'operador'
    });

    return res.status(201).json({
      mensagem: 'Cadastro realizado com sucesso!',
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil }
    });
  } catch (erro) {
    if (erro.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ mensagem: 'Este e-mail já está cadastrado no sistema.' });
    }
    console.error('Erro de cadastro:', erro);
    return res.status(500).json({ mensagem: 'Erro interno ao cadastrar usuário.' });
  }
}

async function listar(req, res) {
  try {
    const usuarios = await Usuario.findAll({ attributes: { exclude: ['senha'] } });
    res.json(usuarios);
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao buscar usuários.' });
  }
}

module.exports = { cadastrar, listar };
