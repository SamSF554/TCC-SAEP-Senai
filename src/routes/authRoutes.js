const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');
const { autenticar } = require('../middlewares/autorizacao');

router.post('/auth/login', login);
router.get('/auth/me', autenticar, (req, res) => {
  const { id, nome, email, perfil, tipo_conta } = req.usuario;
  res.json({ id, nome, email, perfil, tipo_conta });
});

module.exports = router;
