// === database.js ===
// Arquivo: backend/database.js
// Conexão com o banco de dados usando Knex (MySQL)

const knex = require('knex');
const config = require('./knexfile');

// Usa o ambiente correto: 'production' no servidor, 'development' local
const env = process.env.NODE_ENV || 'development';

const db = knex(config[env]);

// Testa a conexão ao iniciar
db.raw('SELECT 1')
  .then(() => console.log(`✅ Conectado ao MySQL (${env})`))
  .catch(err => console.error('❌ Erro ao conectar ao banco:', err.message));

// === Funções auxiliares (mesma interface do database.js antigo) ===
// Isso garante que nps.js e comunicacao.js continuam funcionando sem mudança

const query = (sql, params = []) => db.raw(sql, params).then(r => r[0]);

const run = (sql, params = []) =>
  db.raw(sql, params).then(r => ({
    id:      r[0].insertId,
    changes: r[0].affectedRows
  }));

const get = (sql, params = []) =>
  db.raw(sql, params).then(r => r[0][0] || null);

module.exports = { db, query, run, get };