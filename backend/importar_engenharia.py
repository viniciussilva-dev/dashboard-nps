# === SCRIPT: importar_engenharia.py ===
# Arquivo: backend/importar_engenharia.py
#
# O que este script faz:
# Lê as 10 respostas da aba "Respostas ao formulário 2" do Excel
# e insere todas na tabela "respostas_engenharia" do MySQL.
#
# Como executar (dentro da pasta backend/):
#   python importar_engenharia.py
#
# Requisitos:
#   pip install openpyxl mysql-connector-python python-dotenv
#
# O script lê as credenciais do banco direto do arquivo .env
# que já existe na pasta backend/ — não precisa configurar nada.

import openpyxl
import mysql.connector
import os
from dotenv import load_dotenv

# === CARREGA AS VARIÁVEIS DO ARQUIVO .env ===
# Isso evita ter que digitar senha/host manualmente
# Ele procura o .env na mesma pasta onde o script está
load_dotenv()

# === CONFIGURAÇÃO DO BANCO ===
# Pega as credenciais do .env automaticamente
config = {
    'host':     os.getenv('DB_HOST', '127.0.0.1'),
    'port':     int(os.getenv('DB_PORT', 3306)),
    'user':     os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'canalsolar_nps'),
    'charset':  'utf8mb4',
}

# === FUNÇÃO: Converte texto para número (1-5) ===
# O Excel tem os valores como texto: "Excelente", "Bom", etc.
# O banco salva como número: 5, 4, 3, 2, 1
# Exemplos:
#   "Excelente" → 5
#   "Bom"       → 4
#   "Regular"   → 3
#   "Ruim"      → 2
#   "Péssimo"   → 1
#   None        → None (campo vazio, salva como nulo)
def texto_para_nota(v):
    if v is None or str(v).strip() == '':
        return None
    mapa = {
        'excelente': 5,
        'bom':       4,
        'regular':   3,
        'ruim':      2,
        'péssimo':   1,
        'pessimo':   1,
    }
    return mapa.get(str(v).lower().strip())

# === CAMINHO DO EXCEL ===
# Coloque o arquivo Excel na mesma pasta que este script (backend/)
# ou ajuste o caminho abaixo
ARQUIVO_EXCEL = 'Pesquisa_de_Satisfação_Engenharia.xlsx'
ABA = 'Respostas ao formulário 2'

print('=' * 60)
print('📥 Importação — Respostas de Engenharia')
print('=' * 60)

# === ABRE O EXCEL ===
try:
    wb = openpyxl.load_workbook(ARQUIVO_EXCEL)
    ws = wb[ABA]
    print(f'✅ Excel aberto com sucesso')
    print(f'📊 Aba: "{ABA}"')
    print(f'📋 Total de respostas encontradas: {ws.max_row - 1}')
    print()
except FileNotFoundError:
    print(f'❌ Arquivo "{ARQUIVO_EXCEL}" não encontrado!')
    print(f'   Coloque o Excel na pasta backend/ e tente novamente.')
    exit(1)

# === CONECTA AO BANCO ===
try:
    conn = mysql.connector.connect(**config)
    cursor = conn.cursor()
    print(f'✅ Conectado ao MySQL em {config["host"]}')
    print(f'🗄️  Banco: {config["database"]}')
    print()
except Exception as e:
    print(f'❌ Erro ao conectar ao banco: {e}')
    print(f'   Verifique se o .env está correto e o banco está rodando.')
    exit(1)

# === SQL DE INSERÇÃO ===
# Insere uma linha por vez na tabela respostas_engenharia
sql = """
    INSERT INTO respostas_engenharia
        (nome, email, empresa,
         avaliacao_agilidade,
         avaliacao_conhecimento_tecnico,
         avaliacao_qualidade,
         avaliacao_pontualidade,
         avaliacao_satisfacao,
         indicaria_amigo,
         feedback,
         data_resposta,
         ano)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
"""

# === LOOP DE IMPORTAÇÃO ===
# Pula a primeira linha (cabeçalho) com min_row=2
sucesso = 0
erros   = 0

for i, row in enumerate(ws.iter_rows(min_row=2, values_only=True), start=1):

    # === LEITURA DOS CAMPOS DO EXCEL ===
    # Posição de cada coluna na aba "Respostas ao formulário 2":
    # [0] Carimbo de data/hora
    # [1] Seu nome
    # [2] Seu E-mail
    # [3] Nome da empresa
    # [4] Como avalia a agilidade no atendimento?
    # [5] Como avalia o conhecimento técnico dos funcionários?
    # [6] Como você avalia a qualidade do trabalho entregue?
    # [7] Como você avalia a pontualidade das entregas?
    # [8] Qual o seu grau de satisfação com o serviço prestado?
    # [9] Numa escala de 0 a 10 em quanto você indicaria...
    # [10] Gostaria de deixar algum elogio ou reclamação?

    data_original = row[0]  # Objeto datetime vindo do Excel
    nome          = row[1]
    email         = row[2]
    empresa       = row[3]
    agilidade     = row[4]
    conh_tec      = row[5]
    qualidade     = row[6]
    pontualidade  = row[7]
    satisfacao    = row[8]
    nps_raw       = row[9]
    feedback      = row[10]

    # === VALIDAÇÃO DO NPS ===
    # Se o NPS estiver vazio, pula a linha (campo obrigatório)
    if nps_raw is None:
        print(f'  ⚠️  Linha {i} ignorada — campo NPS vazio')
        erros += 1
        continue

    # === FORMATAÇÃO DA DATA ===
    # Converte o datetime do Excel para string "YYYY-MM-DD HH:MM:SS"
    if data_original:
        data_str = data_original.strftime('%Y-%m-%d %H:%M:%S')
        ano      = data_original.year
    else:
        from datetime import datetime
        agora    = datetime.now()
        data_str = agora.strftime('%Y-%m-%d %H:%M:%S')
        ano      = agora.year

    # === MONTA OS VALORES PARA INSERÇÃO ===
    valores = (
        str(nome).strip()     if nome     else None,
        str(email).strip()    if email    else None,
        str(empresa).strip()  if empresa  else None,
        texto_para_nota(agilidade),    # "Excelente" → 5
        texto_para_nota(conh_tec),     # "Bom"       → 4
        texto_para_nota(qualidade),
        texto_para_nota(pontualidade),
        texto_para_nota(satisfacao),
        int(nps_raw),                  # 10.0 → 10
        str(feedback).strip() if feedback else None,
        data_str,
        ano,
    )

    # === INSERE NO BANCO ===
    try:
        cursor.execute(sql, valores)
        print(f'  ✅ Linha {i:02d} | {str(empresa)[:30]:<30} | NPS: {int(nps_raw):>2} | {str(nome)[:25]}')
        sucesso += 1
    except Exception as e:
        print(f'  ❌ Linha {i} — Erro: {e}')
        erros += 1

# === CONFIRMA AS INSERÇÕES NO BANCO ===
# O commit salva tudo de uma vez — se algo falhar antes, nada é salvo
conn.commit()
cursor.close()
conn.close()

# === RESUMO FINAL ===
print()
print('=' * 60)
print(f'✅ Importação concluída!')
print(f'   Inseridas com sucesso: {sucesso} respostas')
if erros > 0:
    print(f'   Erros/ignoradas:       {erros} linhas')
print('=' * 60)