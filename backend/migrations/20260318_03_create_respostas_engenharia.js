// === MIGRATION: criar tabela respostas_engenharia ===
// Arquivo: backend/migrations/20260318_03_create_respostas_engenharia.js
//
// O que este arquivo faz:
// Cria a tabela "respostas_engenharia" no banco de dados MySQL.
// É executado automaticamente quando você roda: npx knex migrate:latest
// A diferença em relação à tabela de comunicação é o campo
// "avaliacao_conhecimento_tecnico" no lugar de "avaliacao_beneficio".

exports.up = function(knex) {
  return knex.schema.createTable('respostas_engenharia', function(table) {

    // === IDENTIFICADOR ÚNICO ===
    // Cada resposta recebe um número automático (1, 2, 3...)
    table.increments('id').primary();

    // === DADOS DO RESPONDENTE ===
    table.string('nome', 150);     // Nome da pessoa que respondeu
    table.string('email', 150);    // E-mail do respondente
    table.string('empresa', 150);  // Nome da empresa

    // === CRITÉRIOS DE AVALIAÇÃO (1=Péssimo, 2=Ruim, 3=Regular, 4=Bom, 5=Excelente) ===
    table.integer('avaliacao_agilidade');             // Agilidade no atendimento
    table.integer('avaliacao_conhecimento_tecnico');  // Conhecimento técnico dos funcionários ← EXCLUSIVO ENGENHARIA
    table.integer('avaliacao_qualidade');             // Qualidade do trabalho entregue
    table.integer('avaliacao_pontualidade');          // Pontualidade das entregas
    table.integer('avaliacao_satisfacao');            // Satisfação geral com o serviço

    // === NOTA NPS (0 a 10) ===
    // Pergunta: "Em quanto você indicaria para um amigo?"
    table.integer('indicaria_amigo');

    // === FEEDBACK LIVRE ===
    table.text('feedback'); // Elogio ou reclamação (opcional)

    // === DATAS ===
    table.string('data_resposta', 30); // Data/hora formatada como string: "2026-03-18 14:30:00"
    table.integer('ano');              // Ano separado para facilitar filtros futuros
    table.timestamp('created_at').defaultTo(knex.fn.now()); // Data de inserção automática
  });
};

// === ROLLBACK ===
// Se precisar desfazer esta migration, ela apaga a tabela
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('respostas_engenharia');
};