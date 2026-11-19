/**
 * Modelo de Dados: Entrega
 * Relaciona-se com Produto e Veiculo através de chaves estrangeiras.
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database').getDatabase();
const Produto = require('./Produto');
const Veiculo = require('./Veiculo');
const Usuario = require('./Usuario');

const Entrega = sequelize.define('Entrega', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  codigo_rastreio: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  destino: {
    type: DataTypes.STRING,
    allowNull: false
  },
  peso_kg: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1 // Quantidade de produtos/unidades solicitadas
  },
  status: {
    type: DataTypes.ENUM('pendente', 'em_transito', 'entregue', 'concluido'),
    defaultValue: 'pendente'
  },
  produto_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: Produto, key: 'id' }
  },
  veiculo_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: Veiculo, key: 'id' }
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // Compatível com entregas antigas, anteriores à identificação do operador.
    references: { model: Usuario, key: 'id' }
  }
}, {
  tableName: 'Entregas',
  timestamps: true
});

// Relacionamentos ORM para consultas com junção de tabelas (JOIN / include)
Entrega.belongsTo(Produto, { foreignKey: 'produto_id' });
Entrega.belongsTo(Veiculo, { foreignKey: 'veiculo_id' });
Entrega.belongsTo(Usuario, { foreignKey: 'usuario_id' });

module.exports = Entrega;
