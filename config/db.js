const { Sequelize } = require("sequelize");
require("dotenv").config();

// Verificar se DATABASE_URL está definida
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL não está definida nas variáveis de ambiente!");
  process.exit(1);
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: process.env.NODE_ENV === "production" ? {
      require: true,
      rejectUnauthorized: false,
    } : false,
  },
  logging: false,
});

module.exports = sequelize;
