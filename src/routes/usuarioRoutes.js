const express = require('express');
const router = express.Router();
const { cadastrar, listar } = require('../controllers/usuarioController');
const { autenticar, somenteAdmin } = require('../middlewares/autorizacao');

router.post('/usuarios', cadastrar);
router.get('/usuarios', autenticar, somenteAdmin, listar);

module.exports = router;
