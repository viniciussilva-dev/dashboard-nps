import csv, sqlite3, re, os
from datetime import datetime

# === CONFIGURAÇÃO ===
CSV_PATH  = 'typebot-export_10-03-2026.csv'
DB_PATH   = 'backend/nps.db'
CURSO_FIXO = 'Armazenamento'  # todas as respostas deste CSV são deste curso

if not os.path.exists(CSV_PATH):
    print(f'ERRO: arquivo {CSV_PATH} não encontrado!')
    exit(1)

if not os.path.exists(DB_PATH):
    print(f'ERRO: banco {DB_PATH} não encontrado!')
    exit(1)

# === PARSE DE DATA ===
def parse_data(submitted_at):
    meses = {
        'jan':'01','fev':'02','mar':'03','abr':'04',
        'mai':'05','jun':'06','jul':'07','ago':'08',
        'set':'09','out':'10','nov':'11','dez':'12'
    }
    try:
        match = re.match(r'(\d+)\s+de\s+(\w+)\.?,?\s+(\d+:\d+)', submitted_at.strip())
        if match:
            dia, mes_str, hora = match.groups()
            mes = meses.get(mes_str.lower()[:3], '01')
            ano = '2026' if int(mes) <= 3 else '2025'
            return f"{ano}-{mes}-{dia.zfill(2)} {hora}:00", int(ano)
    except:
        pass
    return datetime.now().strftime('%Y-%m-%d %H:%M:%S'), 2026

# === IMPORTAÇÃO ===
with open(CSV_PATH, 'r', encoding='utf-8') as f:
    rows = list(csv.DictReader(f))

conn = sqlite3.connect(DB_PATH)
cur  = conn.cursor()

cur.execute('SELECT COUNT(*) FROM respostas_nps')
total_antes = cur.fetchone()[0]
print(f'Registros antes: {total_antes}')

inseridos = ignorados = 0

for row in rows:
    # Pega a nota de indicaria (campo NPS principal)
    indicaria = row.get('De 1 a 5, você indicaria um curso do Canal Solar para um amigo?', '').strip()
    if not indicaria:
        ignorados += 1
        continue

    # Converte notas de 1-5 para escala 0-10 (multiplica por 2)
    nota_geral     = round(float(indicaria) * 2)
    nota_indicaria = nota_geral

    # Demais notas
    def get_nota(chave):
        v = row.get(chave, '').strip()
        return float(v) if v else None

    avaliacao_geral  = get_nota('De 1 a 5, qual é sua avaliação geral sobre o curso?')
    nota_professores = get_nota('De 1 a 5, o que você achou do nível dos professores?')
    nota_material    = get_nota('De 1 a 5, o que você achou do material didático?')
    nota_organizacao = get_nota('De 1 a 5, o que você achou da organização e do atendimento do curso?')
    faria_outro      = get_nota('De 1 a 5, você faria outro curso com o Canal Solar?')
    nota_faria_outro = round(faria_outro * 2) if faria_outro else None

    # Feedback
    feedback = row.get('feedback', '').strip()
    feedback_positivo = feedback if (feedback and nota_geral >= 7) else None
    feedback_negativo = feedback if (feedback and nota_geral < 7)  else None

    data_resposta, ano = parse_data(row.get('Submitted at', ''))

    cur.execute('''
        INSERT INTO respostas_nps
          (nome_curso, nota_geral, nota_professores, nota_indicaria, nota_faria_outro,
           nota_organizacao, nota_material, feedback_positivo, feedback_negativo,
           data_resposta, ano)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        CURSO_FIXO, nota_geral, nota_professores, nota_indicaria, nota_faria_outro,
        nota_organizacao, nota_material, feedback_positivo, feedback_negativo,
        data_resposta, ano
    ))
    inseridos += 1

conn.commit()
cur.execute('SELECT COUNT(*) FROM respostas_nps')
total_depois = cur.fetchone()[0]
conn.close()

print(f'\n✅ Inseridos:  {inseridos}')
print(f'⏭  Ignorados: {ignorados}')
print(f'📊 Total no banco: {total_antes} → {total_depois}')