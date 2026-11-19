const { DataTypes } = require('sequelize');
const sequelize = require('../config/database').getDatabase();

const Usuario = sequelize.define('Usuario', {
  nome: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  senha: { type: DataTypes.STRING, allowNull: false },
  cpf_cnpj: { type: DataTypes.STRING, allowNull: true, defaultValue: '' },
  cidade: { type: DataTypes.STRING, allowNull: true, defaultValue: '' },
  veiculo_preferencia: { type: DataTypes.STRING, allowNull: true, defaultValue: 'Carro' },
  tipo_conta: { type: DataTypes.STRING, allowNull: true, defaultValue: 'pessoal' },
  perfil: { type: DataTypes.STRING, allowNull: false, defaultValue: 'operador' }
});

module.exports = Usuario;
