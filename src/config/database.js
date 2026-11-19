const path = require('path');
const { Sequelize } = require('sequelize');
const pg = require('pg');
const supabaseCa = require('./supabase-ca');

let sequelize;

function getDatabase() {
  if (!sequelize) throw new Error('O banco ainda não foi inicializado.');
  return sequelize;
}

async function conectarBanco() {
  if (sequelize) return sequelize;

  const producao = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);

  if (process.env.DATABASE_URL) {
    // Supabase: copie a URL do "Transaction pooler" no painel Connect.
    // Nunca exponha DATABASE_URL em JavaScript do navegador.
    const postgres = new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      dialectModule: pg,
      logging: false,
      pool: { max: 1, min: 0, acquire: 20000, idle: 10000 },
      dialectOptions: { ssl: { require: true, rejectUnauthorized: true, ca: supabaseCa } }
    });
    try {
      await postgres.authenticate();
      sequelize = postgres;
      console.log('✅ PostgreSQL conectado.');
      return sequelize;
    } catch (erro) {
      await postgres.close();
      throw new Error(`Falha na conexão com o PostgreSQL (Supabase): ${erro.message}`);
    }
  }

  const abrirSqlite = () => new Sequelize({
    dialect: 'sqlite',
    storage: path.resolve(__dirname, '..', '..', process.env.SQLITE_PATH || 'urbanlink_db.sqlite'),
    logging: false
  });

  if (process.env.USE_SQLITE === 'true') {
    if (producao) {
      throw new Error('SQLite local não é persistente na Vercel. Configure DATABASE_URL do Supabase.');
    }
    sequelize = abrirSqlite();
    await sequelize.authenticate();
    console.log('✅ SQLite conectado.');
    return sequelize;
  }

  const host = process.env.DB_HOST || 'localhost';
  if (producao && ['localhost', '127.0.0.1', '::1'].includes(host)) {
    throw new Error('DB_HOST aponta para localhost na Vercel. Utilize DATABASE_URL do Supabase ou um MySQL remoto acessível.');
  }

  const mysql = new Sequelize(
    process.env.DB_NAME || 'urbanlink_db',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      host,
      port: Number(process.env.DB_PORT) || 3306,
      dialect: 'mysql',
      logging: false,
      dialectOptions: { connectTimeout: 5000 },
      pool: producao ? { max: 1, min: 0, acquire: 15000, idle: 10000 } : undefined
    }
  );

  try {
    await mysql.authenticate();
    sequelize = mysql;
    console.log('✅ MySQL conectado.');
  } catch (erro) {
    await mysql.close();
    if (producao) {
      throw new Error(`Falha ao conectar ao MySQL em produção: ${erro.message}`);
    }
    console.warn('⚠️ MySQL indisponível. Usando SQLite local para desenvolvimento.');
    sequelize = abrirSqlite();
    await sequelize.authenticate();
  }

  return sequelize;
}

module.exports = { conectarBanco, getDatabase };
