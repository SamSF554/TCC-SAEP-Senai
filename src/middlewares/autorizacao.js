const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

async function autenticar(req, res, next) {
  const autorizacao = req.get('Authorization') || '';
  const token = autorizacao.startsWith('Bearer ') ? autorizacao.slice(7) : '';
  if (!token) return res.status(401).json({ mensagem: 'Faça login para continuar.' });

  try {
    const sessao = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    const usuario = await Usuario.findByPk(sessao.id);
    if (!usuario) return res.status(401).json({ mensagem: 'Sessão inválida.' });
    req.usuario = usuario;
    next();
  } catch (erro) {
    return res.status(401).json({ mensagem: 'Sessão inválida ou expirada. Faça login novamente.' });
  }
}

function somenteAdmin(req, res, next) {
  if (req.usuario.perfil !== 'administrador') {
    return res.status(403).json({ mensagem: 'Acesso permitido apenas a administradores.' });
  }
  next();
}

module.exports = { autenticar, somenteAdmin };
