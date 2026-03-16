# === exportar_dados.py ===
# Gera um arquivo SQL com todos os dados do banco local
# para ser importado no servidor de produção
# Coloca na raiz do projeto e roda: python exportar_dados.py

import pymysql
from datetime import datetime

# === CONFIGURAÇÃO DO BANCO LOCAL ===
MYSQL_CONFIG = {
    'host':     '127.0.0.1',
    'port':     3306,
    'user':     'root',
    'password': 'vini1234A@',
    'database': 'canalsolar_nps',
    'charset':  'utf8mb4'
}

OUTPUT_FILE = 'dados_producao.sql'

# === NORMALIZAÇÃO DE NOMES DE CURSOS ===
# Garante que nomes com capitalização diferente sejam unificados
NORMALIZAR_CURSOS = {
    'armazenamento': 'Armazenamento',
    'fundamentos':   'Fundamentos',
    'usinas':        'Usinas',
    'microgeração':  'Microgeração',
    'pvsyst':        'PVsyst',
    'cabine':        'Cabine',
    'homer':         'Homer',
    'comunicação':   'Comunicação',
}

def normalizar_curso(nome):
    if not nome:
        return nome
    return NORMALIZAR_CURSOS.get(nome.strip().lower(), nome.strip())

def escape(v):
    if v is None:
        return 'NULL'
    v = str(v).replace("\\", "\\\\").replace("'", "\\'")
    return f"'{v}'"

conn = pymysql.connect(**MYSQL_CONFIG)
cur  = conn.cursor(pymysql.cursors.DictCursor)

linhas = []
linhas.append('-- ================================================')
linhas.append(f'-- Exportação gerada em {datetime.now().strftime("%d/%m/%Y %H:%M:%S")}')
linhas.append('-- Execute no banco de produção do Ploi')
linhas.append('-- ================================================')
linhas.append('')
linhas.append('SET NAMES utf8mb4;')
linhas.append('SET FOREIGN_KEY_CHECKS = 0;')
linhas.append('')

# === EXPORTA respostas_nps ===
cur.execute('SELECT * FROM respostas_nps')
rows_nps = cur.fetchall()
print(f'Exportando {len(rows_nps)} registros de respostas_nps...')

# Mostra cursos encontrados para conferência
cursos = sorted(set(r['nome_curso'] for r in rows_nps))
print(f'Cursos encontrados: {cursos}')

linhas.append('-- ================================================')
linhas.append(f'-- TABELA: respostas_nps ({len(rows_nps)} registros)')
linhas.append('-- ================================================')
linhas.append('TRUNCATE TABLE respostas_nps;')
linhas.append('')

for row in rows_nps:
    nome_curso = normalizar_curso(row['nome_curso'])
    linhas.append(
        f"INSERT INTO respostas_nps "
        f"(nome_curso, nota_geral, nota_professores, nota_indicaria, nota_faria_outro, "
        f"nota_organizacao, nota_material, feedback_positivo, feedback_negativo, data_resposta, ano) VALUES ("
        f"{escape(nome_curso)}, {escape(row['nota_geral'])}, {escape(row['nota_professores'])}, "
        f"{escape(row['nota_indicaria'])}, {escape(row['nota_faria_outro'])}, {escape(row['nota_organizacao'])}, "
        f"{escape(row['nota_material'])}, {escape(row['feedback_positivo'])}, {escape(row['feedback_negativo'])}, "
        f"{escape(row['data_resposta'])}, {escape(row['ano'])});"
    )

linhas.append('')

# === EXPORTA respostas_comunicacao ===
cur.execute('SELECT * FROM respostas_comunicacao')
rows_com = cur.fetchall()
print(f'Exportando {len(rows_com)} registros de respostas_comunicacao...')

linhas.append('-- ================================================')
linhas.append(f'-- TABELA: respostas_comunicacao ({len(rows_com)} registros)')
linhas.append('-- ================================================')
linhas.append('TRUNCATE TABLE respostas_comunicacao;')
linhas.append('')

for row in rows_com:
    linhas.append(
        f"INSERT INTO respostas_comunicacao "
        f"(nome, email, empresa, avaliacao_agilidade, avaliacao_pontualidade, "
        f"avaliacao_qualidade, avaliacao_beneficio, avaliacao_satisfacao, "
        f"indicaria_amigo, feedback, data_resposta, ano) VALUES ("
        f"{escape(row['nome'])}, {escape(row['email'])}, {escape(row['empresa'])}, "
        f"{escape(row['avaliacao_agilidade'])}, {escape(row['avaliacao_pontualidade'])}, "
        f"{escape(row['avaliacao_qualidade'])}, {escape(row['avaliacao_beneficio'])}, "
        f"{escape(row['avaliacao_satisfacao'])}, {escape(row['indicaria_amigo'])}, "
        f"{escape(row['feedback'])}, {escape(row['data_resposta'])}, {escape(row['ano'])});"
    )

linhas.append('')
linhas.append('SET FOREIGN_KEY_CHECKS = 1;')
linhas.append('')
linhas.append('-- FIM DA EXPORTAÇÃO')

conn.close()

with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
    f.write('\n'.join(linhas))

print(f'\n✅ Arquivo gerado: {OUTPUT_FILE}')
print(f'📊 Total: {len(rows_nps)} cursos + {len(rows_com)} comunicação')
print(f'\nMande o arquivo "{OUTPUT_FILE}" para sua chefe importar no Ploi!')