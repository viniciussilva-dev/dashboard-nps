import openpyxl
import sqlite3
import os
from datetime import datetime

# === CONFIGURAÇÃO ===
XLSX_PATH = 'Pesquisa_de_Satisfação_Publicidade.xlsx'
DB_PATH   = 'backend/nps.db'

# === MAPA DE TEXTO PARA NÚMERO (1-5) ===
NOTA_MAP = {
    'excelente': 5,
    'bom':       4,
    'regular':   3,
    'ruim':      2,
    'péssimo':   1,
    'pessimo':   1,
}

def texto_para_nota(texto):
    if not texto:
        return None
    return NOTA_MAP.get(str(texto).strip().lower(), None)

# === VERIFICA ARQUIVOS ===
if not os.path.exists(XLSX_PATH):
    print(f'ERRO: arquivo {XLSX_PATH} não encontrado!')
    exit(1)

if not os.path.exists(DB_PATH):
    print(f'ERRO: banco {DB_PATH} não encontrado!')
    exit(1)

# === CRIA A TABELA SE NÃO EXISTIR ===
conn = sqlite3.connect(DB_PATH)
cur  = conn.cursor()

cur.execute('''
    CREATE TABLE IF NOT EXISTS respostas_comunicacao (
        id                      INTEGER PRIMARY KEY AUTOINCREMENT,
        nome                    TEXT,
        email                   TEXT,
        empresa                 TEXT,
        avaliacao_agilidade     INTEGER,
        avaliacao_pontualidade  INTEGER,
        avaliacao_qualidade     INTEGER,
        avaliacao_beneficio     INTEGER,
        avaliacao_satisfacao    INTEGER,
        indicaria_amigo         INTEGER,
        feedback                TEXT,
        data_resposta           TEXT,
        ano                     INTEGER
    )
''')
conn.commit()
print('✅ Tabela respostas_comunicacao pronta')

# === LÊ A PLANILHA ===
wb   = openpyxl.load_workbook(XLSX_PATH)
ws   = wb.active
rows = list(ws.iter_rows(values_only=True))[1:]  # pula o cabeçalho

cur.execute('SELECT COUNT(*) FROM respostas_comunicacao')
total_antes = cur.fetchone()[0]
print(f'Registros antes da importação: {total_antes}')

inseridos = ignorados = 0

for row in rows:
    # Colunas da planilha (índice 0):
    # 0: data/hora | 1: pontuação | 2: nome | 3: email | 4: empresa
    # 5: agilidade | 6: pontualidade | 7: qualidade | 8: beneficio | 9: satisfacao
    # 10: indicaria_amigo | 11: feedback

    data_hora       = row[0]
    nome            = row[2]
    email           = row[3]
    empresa         = row[4]
    agilidade_txt   = row[5]
    pontualidade_txt= row[6]
    qualidade_txt   = row[7]
    beneficio_txt   = row[8]
    satisfacao_txt  = row[9]
    indicaria       = row[10]
    feedback        = row[11]

    # Pula linhas sem nota NPS
    if indicaria is None:
        ignorados += 1
        continue

    # Converte textos para números
    nota_agilidade    = texto_para_nota(agilidade_txt)
    nota_pontualidade = texto_para_nota(pontualidade_txt)
    nota_qualidade    = texto_para_nota(qualidade_txt)
    nota_beneficio    = texto_para_nota(beneficio_txt)
    nota_satisfacao   = texto_para_nota(satisfacao_txt)
    nota_nps          = int(indicaria)

    # Formata a data
    if isinstance(data_hora, datetime):
        data_str = data_hora.strftime('%Y-%m-%d %H:%M:%S')
        ano      = data_hora.year
    else:
        data_str = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        ano      = datetime.now().year

    # Limpa feedback vazio ou inválido
    fb = str(feedback).strip() if feedback and str(feedback).strip() not in ('None', 'Não', 'Nao', '') else None

    cur.execute('''
        INSERT INTO respostas_comunicacao
          (nome, email, empresa,
           avaliacao_agilidade, avaliacao_pontualidade, avaliacao_qualidade,
           avaliacao_beneficio, avaliacao_satisfacao,
           indicaria_amigo, feedback, data_resposta, ano)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        nome, email, empresa,
        nota_agilidade, nota_pontualidade, nota_qualidade,
        nota_beneficio, nota_satisfacao,
        nota_nps, fb, data_str, ano
    ))
    inseridos += 1

conn.commit()

cur.execute('SELECT COUNT(*) FROM respostas_comunicacao')
total_depois = cur.fetchone()[0]
conn.close()

print(f'\n✅ Inseridos:  {inseridos}')
print(f'⏭  Ignorados: {ignorados}')
print(f'📊 Total no banco: {total_antes} → {total_depois}')