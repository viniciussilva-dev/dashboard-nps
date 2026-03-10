# === migrar_sqlite_para_mysql.py ===
# Roda UMA VEZ para copiar todos os dados do SQLite para o MySQL
# Coloca na raiz do projeto e executa: python migrar_sqlite_para_mysql.py

import sqlite3
import pymysql
import os

# === CONFIGURAÇÃO ===
# Coloque a senha do seu MySQL local aqui
MYSQL_CONFIG = {
    'host':     '127.0.0.1',
    'port':     3306,
    'user':     'root',
    'password': 'vini1234A@',  
    'database': 'canalsolar_nps',
    'charset':  'utf8mb4'
}

SQLITE_PATH = 'backend/nps.db'

if not os.path.exists(SQLITE_PATH):
    print(f'ERRO: {SQLITE_PATH} não encontrado!')
    exit(1)

# === CONECTA NOS DOIS BANCOS ===
sqlite_conn = sqlite3.connect(SQLITE_PATH)
sqlite_conn.row_factory = sqlite3.Row
sqlite_cur  = sqlite_conn.cursor()

mysql_conn = pymysql.connect(**MYSQL_CONFIG)
mysql_cur  = mysql_conn.cursor()

print('✅ Conectado ao SQLite e MySQL')

# === MIGRA respostas_nps ===
sqlite_cur.execute('SELECT * FROM respostas_nps')
rows_nps = sqlite_cur.fetchall()
print(f'Migrando {len(rows_nps)} registros de respostas_nps...')

for row in rows_nps:
    mysql_cur.execute('''
        INSERT INTO respostas_nps
          (nome_curso, nota_geral, nota_professores, nota_indicaria, nota_faria_outro,
           nota_organizacao, nota_material, feedback_positivo, feedback_negativo,
           data_resposta, ano)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
    ''', (
        row['nome_curso'], row['nota_geral'], row['nota_professores'],
        row['nota_indicaria'], row['nota_faria_outro'], row['nota_organizacao'],
        row['nota_material'], row['feedback_positivo'], row['feedback_negativo'],
        row['data_resposta'], row['ano']
    ))

mysql_conn.commit()
print(f'✅ {len(rows_nps)} registros migrados para respostas_nps')

# === MIGRA respostas_comunicacao ===
try:
    sqlite_cur.execute('SELECT * FROM respostas_comunicacao')
    rows_com = sqlite_cur.fetchall()
    print(f'Migrando {len(rows_com)} registros de respostas_comunicacao...')

    for row in rows_com:
        mysql_cur.execute('''
            INSERT INTO respostas_comunicacao
              (nome, email, empresa,
               avaliacao_agilidade, avaliacao_pontualidade, avaliacao_qualidade,
               avaliacao_beneficio, avaliacao_satisfacao,
               indicaria_amigo, feedback, data_resposta, ano)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        ''', (
            row['nome'], row['email'], row['empresa'],
            row['avaliacao_agilidade'], row['avaliacao_pontualidade'],
            row['avaliacao_qualidade'], row['avaliacao_beneficio'],
            row['avaliacao_satisfacao'], row['indicaria_amigo'],
            row['feedback'], row['data_resposta'], row['ano']
        ))

    mysql_conn.commit()
    print(f'✅ {len(rows_com)} registros migrados para respostas_comunicacao')
except Exception as e:
    print(f'⚠️  respostas_comunicacao: {e}')

sqlite_conn.close()
mysql_conn.close()
print('\n🎉 Migração concluída!')