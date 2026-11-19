const express = require('express');
const router = express.Router();
const { listar, criar, novaRemessa, deletar } = require('../controllers/produtoController');
const { autenticar, somenteAdmin } = require('../middlewares/autorizacao');

router.get('/produtos', autenticar, listar);
router.post('/produtos', autenticar, somenteAdmin, criar);
router.post('/produtos/:id/remessa', autenticar, somenteAdmin, novaRemessa);
router.delete('/produtos/:id', autenticar, somenteAdmin, deletar);

module.exports = router;
