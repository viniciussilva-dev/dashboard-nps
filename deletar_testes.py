import pymysql

MYSQL_CONFIG = {
    'host':     '127.0.0.1',
    'port':     3306,
    'user':     'root',
    'password': 'vini1234A@',
    'database': 'canalsolar_nps',
    'charset':  'utf8mb4'
}

conn = pymysql.connect(**MYSQL_CONFIG)
cur  = conn.cursor()

# === DELETA respostas de teste da tabela de cursos ===
# Remove registros com nome "Comunicação" da tabela de cursos
# (foram para o lugar errado)
cur.execute("SELECT COUNT(*) FROM respostas_nps WHERE nome_curso = 'Comunicação'")
qtd = cur.fetchone()[0]
print(f'Respostas de Comunicação na tabela de cursos: {qtd}')

cur.execute("DELETE FROM respostas_nps WHERE nome_curso = 'Comunicação'")
conn.commit()
print(f'✅ Deletadas {cur.rowcount} respostas de Comunicação da tabela de cursos')

# === DELETA respostas de teste da tabela de comunicação ===
# Remove registros com empresa "Empresa Teste" ou nome "Teste Claude"
cur.execute("""
    SELECT COUNT(*) FROM respostas_comunicacao 
    WHERE empresa = 'Empresa Teste' 
    OR feedback = 'teste claude'
""")
qtd2 = cur.fetchone()[0]
print(f'Respostas de teste na tabela comunicação: {qtd2}')

cur.execute("""
    DELETE FROM respostas_comunicacao 
    WHERE empresa = 'Empresa Teste'
    OR feedback = 'teste claude'
""")
conn.commit()
print(f'✅ Deletadas {cur.rowcount} respostas de teste da tabela comunicação')

conn.close()
print('\n✅ Limpeza concluída!')