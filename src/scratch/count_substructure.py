import json

with open('c:/Users/HP/Downloads/Antigravity/Gravitational Lensing/frontend/public/explore/data.json', 'r') as f:
    data = json.load(f)

counts = {'SMOOTH': 0, 'CDM': 0, 'AXION': 0}
total = 0

for img in data['images']:
    if img.get('substructure'):
        top_class = img['substructure'].get('top_class')
        if top_class in counts:
            counts[top_class] += 1
            total += 1

print(f"Total substructure images: {total}")
print(f"Counts: {counts}")
