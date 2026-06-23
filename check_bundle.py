import sys
sys.stdout.reconfigure(encoding='utf-8')

content = open('dist/assets/index-VX_-uw_P.js', 'r', encoding='utf-8', errors='replace').read()
print('Total size:', len(content))

for term in ['localhost:8000', '_backend/api', '/api/v1', 'import.meta.env', 'VITE_API']:
    idx = content.find(term)
    if idx != -1:
        snippet = content[max(0,idx-60):idx+80]
        print(f'[{term}] -> ...{snippet}...')
    else:
        print(f'[{term}] -> NOT FOUND')
