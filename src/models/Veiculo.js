const { DataTypes } = require('sequelize');
const sequelize = require('../config/database').getDatabase();

const Veiculo = sequelize.define('Veiculo', {
  placa: { type: DataTypes.STRING, allowNull: false, unique: true },
  modelo: { type: DataTypes.STRING, allowNull: false },
  tipo: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Carro' },
  capacidade_kg: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 100 },
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'disponivel' }
});

module.exports = Veiculo;
