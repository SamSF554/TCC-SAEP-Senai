/**
 * Modelo de Dados: Produto (Estoque)
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database').getDatabase();

const Produto = sequelize.define('Produto', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  codigo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true // SKU único por produto
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  categoria: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Geral'
  },
  quantidade: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0 } // Impede valores negativos no banco
  }
}, {
  tableName: 'Produtos',
  timestamps: true
});

module.exports = Produto;
