// === knexfile.js ===
// Arquivo: backend/knexfile.js
// Configuração do Knex para diferentes ambientes

require('dotenv').config();

module.exports = {

  // === AMBIENTE LOCAL (MySQL local) ===
  development: {
    client: 'mysql2',
    connection: {
      host:     process.env.DB_HOST     || '127.0.0.1',
      port:     process.env.DB_PORT     || 3306,
      user:     process.env.DB_USER     || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME     || 'canalsolar_nps',
    },
    migrations: {
      directory: './migrations',  // pasta onde ficam os arquivos de migration
      tableName:  'knex_migrations' // tabela de controle das migrations
    },
    seeds: {
      directory: './seeds'
    }
  },

  // === AMBIENTE DE PRODUÇÃO (MySQL no Ploi) ===
  production: {
    client: 'mysql2',
    connection: {
      host:     process.env.DB_HOST,
      port:     process.env.DB_PORT     || 3306,
      user:     process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },
    migrations: {
      directory: './migrations',
      tableName:  'knex_migrations'
    },
    pool: {
      min: 2,
      max: 10
    }
  }
};