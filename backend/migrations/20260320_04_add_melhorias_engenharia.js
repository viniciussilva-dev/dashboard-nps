// === MIGRATION: adicionar colunas de melhoria em respostas_engenharia ===
// Arquivo: backend/migrations/20260320_04_add_melhorias_engenharia.js
//
// O que este arquivo faz:
// Adiciona 5 novas colunas de texto na tabela "respostas_engenharia".
// Cada coluna guarda o feedback de melhoria que o cliente digitou
// quando deu nota menor que 8 em cada critério.
//
// As colunas são todas opcionais (nullable) — se o cliente deu nota >= 8
// ele não viu a pergunta de melhoria, então o campo fica nulo.

exports.up = function(knex) {
  return knex.schema.alterTable('respostas_engenharia', function(table) {

    // Feedback de melhoria para cada critério (digitado quando nota < 8)
    table.text('melhoria_agilidade');             // O que poderia melhorar na agilidade?
    table.text('melhoria_conhecimento_tecnico');  // O que poderia melhorar no conhecimento técnico?
    table.text('melhoria_qualidade');             // O que poderia melhorar na qualidade?
    table.text('melhoria_pontualidade');          // O que poderia melhorar na pontualidade?
    table.text('melhoria_satisfacao');            // O que poderia melhorar na satisfação?
  });
};

// === ROLLBACK ===
// Se precisar desfazer, remove as 5 colunas
exports.down = function(knex) {
  return knex.schema.alterTable('respostas_engenharia', function(table) {
    table.dropColumn('melhoria_agilidade');
    table.dropColumn('melhoria_conhecimento_tecnico');
    table.dropColumn('melhoria_qualidade');
    table.dropColumn('melhoria_pontualidade');
    table.dropColumn('melhoria_satisfacao');
  });
};