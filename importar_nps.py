import csv, sqlite3, re, os
from datetime import datetime

# ── CONFIGURACAO ──────────────────────────────────────────
CSV_PATH = 'typebot-export_04-03-2026.csv'   # coloque o CSV na mesma pasta
DB_PATH  = 'backend/nps.db'                  # caminho relativo ao projeto
# ─────────────────────────────────────────────────────────

CURSO_MAP = {
    'armazenamento':    'Armazenamento',
    'fundamentos':      'Fundamentos',
    'usinas':           'Usinas',
    'comercialevendas': 'Comercial e Vendas',
    'microgeracao':     'Microgeração',
    'pvsyst':           'PVsyst',
    'cabine':           'Cabine',
    'mercadolivre':     'Mercado Livre',
    'zerogrid':         'Zero Grid',
    'aterramento':      'Aterramento',
    'lei14300':         'Lei 14300',
    'tributos':         'Tributos',
    'vendasavancadas':  'Vendas Avançadas',
    'visitaguiada':     'Visita Guiada',
    'hidrogenio':       'Hidrogênio',
    'homer':            'Homer',
}

def normalizar_curso(nome):
    nome = nome.strip().lower()
    nome = re.sub(r'\s+style=.*', '', nome).strip()
    return CURSO_MAP.get(nome, nome.title())

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

if not os.path.exists(CSV_PATH):
    print(f'ERRO: arquivo {CSV_PATH} nao encontrado!')
    exit(1)

if not os.path.exists(DB_PATH):
    print(f'ERRO: banco {DB_PATH} nao encontrado! Execute na pasta raiz do projeto.')
    exit(1)

with open(CSV_PATH, 'r', encoding='utf-8') as f:
    rows = list(csv.DictReader(f))

conn = sqlite3.connect(DB_PATH)
cur  = conn.cursor()

cur.execute('SELECT COUNT(*) FROM respostas_nps')
total_antes = cur.fetchone()[0]
print(f'Registros antes da importacao: {total_antes}')

inseridos = ignorados = sem_curso = sem_nota = 0

for row in rows:
    curso_raw  = row.get('curso', '').strip()
    indicaria  = row.get('De 1 a 5, voce indicaria um curso do Canal Solar para um amigo?', '').strip()
    # tenta a chave com acento caso o CSV venha utf-8
    if not indicaria:
        for k in row:
            if 'indicaria' in k.lower():
                indicaria = row[k].strip()
                break

    if not curso_raw:
        sem_curso += 1; ignorados += 1; continue
    if not indicaria:
        sem_nota  += 1; ignorados += 1; continue

    curso         = normalizar_curso(curso_raw)
    nota_geral    = round(float(indicaria) * 2)
    nota_indicaria = nota_geral

    faria = row.get('De 1 a 5, voce faria outro curso com o Canal Solar?', '').strip()
    if not faria:
        for k in row:
            if 'faria' in k.lower():
                faria = row[k].strip(); break
    nota_faria_outro = round(float(faria) * 2) if faria else None

    def get_nota(keyword):
        for k in row:
            if keyword in k.lower():
                v = row[k].strip()
                return float(v) if v else None
        return None

    nota_professores = get_nota('professores')
    nota_material    = get_nota('material')
    nota_organizacao = get_nota('organiza')

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
        curso, nota_geral, nota_professores, nota_indicaria, nota_faria_outro,
        nota_organizacao, nota_material, feedback_positivo, feedback_negativo,
        data_resposta, ano
    ))
    inseridos += 1

conn.commit()
cur.execute('SELECT COUNT(*) FROM respostas_nps')
total_depois = cur.fetchone()[0]
conn.close()

print(f'\n✅ Inseridos:  {inseridos}')
print(f'⏭  Ignorados: {ignorados}  (sem curso: {sem_curso} | sem nota NPS: {sem_nota})')
print(f'📊 Total no banco: {total_antes} → {total_depois}')
