const express = require('express');
const router = express.Router();
const { listar, criar, atualizarStatus } = require('../controllers/entregaController');
const { autenticar, somenteAdmin } = require('../middlewares/autorizacao');

router.get('/entregas', autenticar, listar);
router.post('/entregas', autenticar, criar);
router.put('/entregas/:id/status', autenticar, somenteAdmin, atualizarStatus);

module.exports = router;
