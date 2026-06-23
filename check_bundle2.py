import urllib.request, re, sys
sys.stdout.reconfigure(encoding='utf-8')

for domain in ['musnad', 'graduateproject']:
    url = f'https://{domain}.vercel.app/'
    req = urllib.request.Request(url, headers={'User-Agent': 'test'})
    res = urllib.request.urlopen(req)
    html = res.read(5000).decode('utf-8', errors='replace')
    # find bundle file
    matches = re.findall(r'index-[A-Za-z0-9_\-]+\.js', html)
    print(f'{domain} bundle: {matches}')
