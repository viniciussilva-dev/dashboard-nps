// === MIGRATION: criar tabela respostas_comunicacao ===
// Arquivo: backend/migrations/20260310_02_create_respostas_comunicacao.js
// Esta migration cria a tabela separada para o curso de Comunicação/Publicidade

exports.up = function(knex) {
  return knex.schema.createTable('respostas_comunicacao', function(table) {
    table.increments('id').primary();
    table.string('nome', 150);
    table.string('email', 150);
    table.string('empresa', 150);
    table.integer('avaliacao_agilidade');
    table.integer('avaliacao_pontualidade');
    table.integer('avaliacao_qualidade');
    table.integer('avaliacao_beneficio');
    table.integer('avaliacao_satisfacao');
    table.integer('indicaria_amigo');
    table.text('feedback');
    table.string('data_resposta', 30);
    table.integer('ano');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('respostas_comunicacao');
};