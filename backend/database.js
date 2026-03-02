const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'nps.db'));

// Criar tabela se não existir (compatível com o schema Python)
db.exec(`
  CREATE TABLE IF NOT EXISTS respostas_nps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_curso TEXT NOT NULL,
    nota_geral INTEGER NOT NULL,
    nota_professores REAL,
    nota_indicaria INTEGER,
    nota_faria_outro INTEGER,
    nota_organizacao REAL,
    nota_material REAL,
    feedback_positivo TEXT,
    feedback_negativo TEXT,
    data_resposta DATETIME DEFAULT CURRENT_TIMESTAMP,
    ano INTEGER NOT NULL
  )
`);

module.exports = db;
