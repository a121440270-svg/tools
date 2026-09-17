import re
from pathlib import Path

root = Path(r'D:\code\tools')
page_dir = root / 'pages'

# Match patterns like $t('home.title'), t('login.submit'), and their double-quoted forms.
pat = re.compile(r"(?<![\w])(?:\$t|t)\s*\(\s*['\"]([^'\"]+)['\"]\s*\)")

page_map = {}
for p in sorted(page_dir.rglob('*.vue')):
    rel = p.relative_to(page_dir).as_posix()
    route = rel.replace('index.vue', '').replace('.vue', '')
    if route.endswith('/'):
        route = route[:-1]
    if not route:
        route = 'index'
    text = p.read_text(encoding='utf-8', errors='ignore')
    keys = sorted(set(pat.findall(text)))
    if keys:
        page_map[route] = keys

# Shared keys should stay in route='all' because the same translation key can appear on multiple pages.
all_usage = {}
for route, keys in page_map.items():
    for key in keys:
        all_usage.setdefault(key, []).append(route)

safe_page_map = {}
for route, keys in page_map.items():
    safe_page_map[route] = sorted([k for k in keys if len(all_usage.get(k, [])) == 1])

# Build SQL only for keys unique to one page, otherwise keep them in route='all'.
sql_lines = []
for route, keys in sorted(safe_page_map.items()):
    if not keys:
        continue
    quoted = ',\n  '.join(f"'{k}'" for k in keys)
    sql_lines.append(f"UPDATE page_lang SET route = '{route}' WHERE route = 'all' AND key IN (\n  {quoted}\n);")

print('\n\n'.join(sql_lines))
