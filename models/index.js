const sequelize = require("../config/db");

// Importar os modelos
const Usuario = require("./Usuario");
const Tarefa = require("./Tarefa");

// Definir associações
Usuario.hasMany(Tarefa, { foreignKey: 'userId', as: 'tarefas' });
Tarefa.belongsTo(Usuario, { foreignKey: 'userId', as: 'usuario' });

module.exports = { Usuario, Tarefa, sequelize };
