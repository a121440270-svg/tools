import re
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAGE_DIR = ROOT / 'pages'
SQL_FILE = ROOT / 'migrations' / '015_page_lang_route_backfill.sql'

static_call = re.compile(r"(?<![\w])(?:\$t|t)\s*\(\s*['\"]([^'\"]+)['\"]")
any_call = re.compile(r"(?<![\w])(?:\$t|t)\s*\(")
sql_key = re.compile(r"'([^']+)'(?=\s*,|\s*\))")

usage = defaultdict(set)
dynamic = []
for page in sorted(PAGE_DIR.rglob('*.vue')):
    text = page.read_text(encoding='utf-8', errors='ignore')
    static_matches = list(static_call.finditer(text))
    for match in static_matches:
        line = text.count('\n', 0, match.start()) + 1
        usage[match.group(1)].add(f'{page.relative_to(ROOT).as_posix()}:{line}')
    static_spans = {(m.start(), m.end()) for m in static_matches}
    for match in any_call.finditer(text):
        if not any(start <= match.start() < end for start, end in static_spans):
            line = text.count('\n', 0, match.start()) + 1
            dynamic.append(f'{page.relative_to(ROOT).as_posix()}:{line}')

sql_text = SQL_FILE.read_text(encoding='utf-8')
sql_keys = set(sql_key.findall(sql_text))
usage_keys = set(usage)

print(f'PAGE_FILES={len(list(PAGE_DIR.rglob("*.vue")))}')
print(f'STATIC_USAGE_KEYS={len(usage_keys)}')
print(f'SQL_KEYS={len(sql_keys)}')
print('\nMISSING_FROM_SQL')
for key in sorted(usage_keys - sql_keys):
    print(f'{key} <- {", ".join(sorted(usage[key]))}')
print('\nSQL_KEYS_NOT_FOUND_IN_PAGES')
for key in sorted(sql_keys - usage_keys):
    print(key)
print('\nDYNAMIC_OR_UNMATCHED_CALLS')
for location in dynamic:
    print(location)
