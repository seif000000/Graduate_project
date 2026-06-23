import urllib.request, re, sys

req = urllib.request.Request('https://musnad.vercel.app/', headers={'User-Agent': 'test'})
res = urllib.request.urlopen(req)
html = res.read(5000).decode('utf-8', errors='replace')
# find JS bundles
matches = re.findall(r'/assets/index-[^"\']+\.js', html)
print('Bundles on Vercel:', matches)

# Also check if /_backend api is returning users
req2 = urllib.request.Request(
    'https://musnad.vercel.app/_backend/api/v1/',
    headers={'User-Agent': 'test'}
)
try:
    res2 = urllib.request.urlopen(req2)
    print('Backend root:', res2.read(100).decode('utf-8', errors='replace'))
except urllib.error.HTTPError as e:
    print('Backend root status:', e.code, e.read(100).decode('utf-8', errors='replace'))
