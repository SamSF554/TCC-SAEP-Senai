const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const { DataTypes } = require('sequelize');
require('dotenv').config();

const { conectarBanco } = require('./config/database');
const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '32kb' }));

// Em desenvolvimento, Express serve a pasta public. Na Vercel, os arquivos
// de public/ são servidos pelo CDN (e express.static é ignorado).
app.use(express.static(path.join(__dirname, '..', 'public')));

let inicializacao;

async function prepararAplicacao() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('Configure JWT_SECRET com pelo menos 32 caracteres.');
  }

  const sequelize = await conectarBanco();
  const Usuario = require('./models/Usuario');
  require('./models/Entrega');

  await sequelize.sync({ alter: process.env.DB_SYNC_ALTER === 'true' });

  // Migração mínima de bancos antigos; em projetos com grande tráfego,
  // prefira migrations executadas separadamente do servidor.
  const queryInterface = sequelize.getQueryInterface();
  const colunasEntrega = await queryInterface.describeTable('Entregas');
  if (!colunasEntrega.usuario_id) {
    await queryInterface.addColumn('Entregas', 'usuario_id', {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: Usuario.getTableName(), key: 'id' }
    });
    console.log('✅ Coluna usuario_id adicionada às entregas existentes.');
  }

  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    if (process.env.ADMIN_PASSWORD.length < 12) {
      throw new Error('ADMIN_PASSWORD deve ter pelo menos 12 caracteres.');
    }
    const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
    const existe = await Usuario.findOne({ where: { email } });
    if (!existe) {
      await Usuario.create({
        nome: 'Administrador UrbanLink',
        email,
        senha: await bcrypt.hash(process.env.ADMIN_PASSWORD, 12),
        tipo_conta: 'corporativa',
        perfil: 'administrador'
      });
      console.log(`🔒 Conta administrativa criada: ${email}`);
    } else if (existe.perfil !== 'administrador') {
      throw new Error(`O e-mail configurado em ADMIN_EMAIL já pertence a um operador: ${email}`);
    } else if (!(await bcrypt.compare(process.env.ADMIN_PASSWORD, existe.senha))) {
      // ADMIN_PASSWORD é a fonte da senha da conta administrativa.
      // Isso permite trocar a senha pelo painel da Vercel sem expor seu valor.
      await existe.update({ senha: await bcrypt.hash(process.env.ADMIN_PASSWORD, 12) });
      console.log('🔒 Senha administrativa sincronizada com ADMIN_PASSWORD.');
    }
  }

  app.use(require('./routes/authRoutes'));
  app.use(require('./routes/usuarioRoutes'));
  app.use(require('./routes/veiculoRoutes'));
  app.use(require('./routes/entregaRoutes'));
  app.use(require('./routes/produtoRoutes'));
  app.use(require('./routes/simulacaoRoutes'));
  app.get('/api/health', (_req, res) => res.json({ status: 'ok', banco: 'conectado' }));
}

// Inicializa UMA vez por instância da Function. A Promise compartilhada evita
// corridas entre solicitações simultâneas no primeiro acesso ao banco.
function garantirInicializacao() {
  if (!inicializacao) {
    inicializacao = prepararAplicacao().catch(erro => {
      inicializacao = undefined;
      throw erro;
    });
  }
  return inicializacao;
}

app.use(async (_req, res, next) => {
  try {
    await garantirInicializacao();
    next();
  } catch (erro) {
    console.error('❌ Falha ao inicializar o backend:', erro);
    res.status(503).json({
      mensagem: 'Backend indisponível. Confira as variáveis de ambiente e os Runtime Logs da Vercel.'
    });
  }
});

async function iniciarServidor({ ouvir = true } = {}) {
  await garantirInicializacao();
  if (ouvir) {
    const PORT = Number(process.env.PORT) || 3000;
    return app.listen(PORT, () => console.log(`🚀 UrbanLink disponível em http://localhost:${PORT}`));
  }
  return app;
}

if (require.main === module) {
  iniciarServidor().catch(erro => {
    console.error('❌ Erro na inicialização:', erro);
    process.exitCode = 1;
  });
}

// A Vercel detecta o app Express pelo export CommonJS de src/app.js.
module.exports = app;
module.exports.app = app;
module.exports.iniciarServidor = iniciarServidor;
