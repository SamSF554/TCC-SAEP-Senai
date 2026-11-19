const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

async function login(req, res) {
  try {
    const { email, senha } = req.body || {};

    if (typeof email !== 'string' || typeof senha !== 'string' || !email.trim() || !senha) {
      return res.status(400).json({ mensagem: 'Por favor, informe e-mail e senha.' });
    }

    const usuario = await Usuario.findOne({ where: { email: email.trim().toLowerCase() } });
    if (!usuario) {
      return res.status(401).json({ mensagem: 'E-mail ou senha incorretos.' });
    }

    const senhaConfere = await bcrypt.compare(senha, usuario.senha);
    if (!senhaConfere) {
      return res.status(401).json({ mensagem: 'E-mail ou senha incorretos.' });
    }

    const token = jwt.sign(
      { id: usuario.id, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil },
      process.env.JWT_SECRET,
      { expiresIn: '8h', algorithm: 'HS256' }
    );

    res.json({
      mensagem: 'Login efetuado com sucesso!',
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo_conta: usuario.tipo_conta,
        perfil: usuario.perfil
      }
    });
  } catch (erro) {
    console.error('Erro de login:', erro);
    res.status(500).json({ mensagem: 'Erro interno ao realizar login.' });
  }
}

module.exports = { login };
