const express = require('express');
const router = express.Router();
const { listar, criar, deletar } = require('../controllers/veiculoController');
const { autenticar, somenteAdmin } = require('../middlewares/autorizacao');

router.get('/veiculos', autenticar, listar);
router.post('/veiculos', autenticar, somenteAdmin, criar);
router.delete('/veiculos/:id', autenticar, somenteAdmin, deletar);

module.exports = router;
