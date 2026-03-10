// === MIGRATION: criar tabela respostas_nps ===
// Arquivo: backend/migrations/20260310_01_create_respostas_nps.js
// Esta migration cria a tabela principal dos cursos NPS

exports.up = function(knex) {
  return knex.schema.createTable('respostas_nps', function(table) {
    table.increments('id').primary();
    table.string('nome_curso', 100).notNullable();
    table.integer('nota_geral');
    table.float('nota_professores');
    table.integer('nota_indicaria');
    table.integer('nota_faria_outro');
    table.float('nota_organizacao');
    table.float('nota_material');
    table.text('feedback_positivo');
    table.text('feedback_negativo');
    table.string('data_resposta', 30);
    table.integer('ano');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('respostas_nps');
};