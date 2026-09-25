#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
ImproveVillageJson_v6.py

Same idea as ImproveVillageJson.py, but the village/district/mohafaza
Arabic names come from the matched workbook produced by match_v6.py:
    Lebanese_Villages_Matched_v6.xlsx
    (Lebanese-Villages-List repo, FuzzyMatch folder)

Workbook layout used here:
  - 'English (Full)': English Name | Arabic Name | District Name | Mohafaza | Match Source
  - 'DistrictTranslation': District | District Arabic | Mohafaza
  - 'Mohafaza Translations': Mohafaza Name (Arabic) | In English

Matching logic:
  - village: first try (english_name, district), then fall back to english_name
    alone (keeps first non-blank Arabic Name in workbook row order)
  - if one (english, district) maps to several DISTINCT arabic names
    (subdivisions, e.g. Kab Elias -> قب الياس التحتا / قب الياس الفوقا),
    they are joined with ' / ' so no match is silently dropped
  - anything unmatched gets an empty string (never crashes on missing keys)

Usage:
    python ImproveVillageJson_v6.py [excel_path] [input_json] [output_json]
defaults:
    excel  = Lebanese_Villages_Matched_v6.xlsx  (next to this script)
    input  = Lebanon_Level3.json
    output = Lebanon_Level3_v6.json
"""

import json
import sys
from collections import defaultdict
from pathlib import Path

import pandas as pd

BASE_DIR = Path(__file__).resolve().parent

excel_file = Path(sys.argv[1]) if len(sys.argv) > 1 else BASE_DIR / "Lebanese_Villages_Matched_v6.xlsx"
json_file = Path(sys.argv[2]) if len(sys.argv) > 2 else BASE_DIR / "Lebanon_Level3.json"
out_file = Path(sys.argv[3]) if len(sys.argv) > 3 else BASE_DIR / "Lebanon_Level3_v6.json"

if not excel_file.exists():
    raise FileNotFoundError(f"Workbook not found: {excel_file}")
if not json_file.exists():
    raise FileNotFoundError(f"JSON file not found: {json_file}")

with open(str(json_file), "r", encoding="utf-8") as f:
    datastore = json.load(f)

# ---- mohafaza: 'In English' -> 'Mohafaza Name' (arabic) ---------------------
mohafaza_pairs = pd.read_excel(excel_file, sheet_name="Mohafaza Translations")
mohafaza_map = {
    str(r["In English"]).strip(): str(r["Mohafaza Name"]).strip()
    for _, r in mohafaza_pairs.iterrows()
    if pd.notna(r["In English"]) and pd.notna(r["Mohafaza Name"])
}

# ---- district: 'District' -> 'District Arabic' ------------------------------
district_pairs = pd.read_excel(excel_file, sheet_name="DistrictTranslation")
district_map = {
    str(r["District"]).strip(): str(r["District Arabic"]).strip()
    for _, r in district_pairs.iterrows()
    if pd.notna(r["District"]) and pd.notna(r["District Arabic"])
}

# ---- village: (english, district) -> [arabic...] and english -> [arabic...] --
village_pairs = pd.read_excel(excel_file, sheet_name="English (Full)")
by_combo = defaultdict(list)   # (english, district) -> arabic names in row order
by_english = defaultdict(list)  # english -> arabic names in row order
for _, r in village_pairs.iterrows():
    en, ar, d = r["English Name"], r["Arabic Name"], r["District Name"]
    if pd.isna(en):
        continue
    en = str(en).strip()
    if pd.isna(ar) or str(ar).strip() == "":
        continue
    ar = str(ar).strip()
    if pd.notna(d):
        by_combo[(en, str(d).strip())].append(ar)
    by_english[en].append(ar)


def arabic_village(en, district):
    """Return joined arabic names or '' if no match."""
    for key in ((en, district), (en, None)):
        names = by_combo.get(key, []) if key[1] else by_english.get(key[0], [])
        seen, ordered = set(), []
        for n in names:
            if n not in seen:
                seen.add(n)
                ordered.append(n)
        if ordered:
            return " / ".join(ordered), (key[1] is None)
    return "", False


name = "gadm36_LBN_3"
geoms = datastore["objects"][name]["geometries"]

stats = {"scoped": 0, "fallback": 0, "joined": 0, "empty": 0}
for i, g in enumerate(geoms):
    props = g["properties"]
    en_moh = props.get("NAME_1", "")
    en_dist = props.get("NAME_2", "")
    en_vil = props.get("NAME_3", "")

    props["Arabic_NAME_1"] = mohafaza_map.get(en_moh, "")
    props["Arabic_NAME_2"] = district_map.get(en_dist, "")

    ar3, used_fallback = arabic_village(en_vil, en_dist)
    props["Arabic_NAME_3"] = ar3
    props["id"] = i + 1

    if not ar3:
        stats["empty"] += 1
    else:
        if " / " in ar3:
            stats["joined"] += 1
        if used_fallback:
            stats["fallback"] += 1
        else:
            stats["scoped"] += 1

with open(str(out_file), "w", encoding="utf-8") as f:
    json.dump(datastore, f, ensure_ascii=False)

print(f"geometries: {len(geoms)}")
print(f"  district-scoped match : {stats['scoped']}")
print(f"  english-only fallback : {stats['fallback']}")
print(f"  with joined subdivisions: {stats['joined']}")
print(f"  no arabic name (empty) : {stats['empty']}")
print(f"wrote {out_file}")
