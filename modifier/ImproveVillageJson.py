#!/usr/bin/env python
# -*- coding: utf-8 -*-
import codecs
import json
import pandas as pd
import numpy as np
from pathlib import Path
import os

# Use script directory to build safe paths (avoids backslash escape warnings and relative path mistakes)
BASE_DIR = Path(__file__).resolve().parent

filename = BASE_DIR / "Lebanon_Level3.json"

excel_file = BASE_DIR / 'English List of districts. Arabic names of districts (Aug 21 2025)Use this.xlsx'

# Load JSON file safely
if filename and filename.exists():
    with open(str(filename), 'r', encoding='utf-8') as f:
        datastore = json.load(f)
else:
    raise FileNotFoundError(f"JSON file not found: {filename}")

mohafazaPairs = pd.read_excel(
    excel_file, sheet_name=3, index_col='In English')

districtPairs = pd.read_excel(
    excel_file, sheet_name=2, index_col='District')

villagePairs = pd.read_excel(
    excel_file, sheet_name=1, index_col='English Name')

# Debug: print columns and sample rows to confirm expected column names
# (columns inspected during debugging: districtPairs uses 'District Arabic')

districtPairs = districtPairs.loc[~districtPairs.index.duplicated(
    keep='first')]
villagePairs = villagePairs.loc[~villagePairs.index.duplicated(
    keep='first')]

# Depending on fileName
name = 'gadm36_LBN_3'
number_of_districts = len(datastore["objects"][name]["geometries"])

for i in range(0, number_of_districts):
    english_mohafaza = datastore['objects'][name]["geometries"][i]['properties']['NAME_1']
    print(english_mohafaza)
    datastore['objects'][name]["geometries"][i]['properties']['Arabic_NAME_1'] = mohafazaPairs.loc[english_mohafaza, 'Mohafaza Name']

    english_district = datastore['objects'][name]["geometries"][i]['properties']['NAME_2']
    print(english_district)
    datastore['objects'][name]["geometries"][i]['properties']['Arabic_NAME_2'] = districtPairs.loc[english_district, 'District Arabic']
    # print(districtPairs.loc[english_district, 'Column1'])

    english_village=datastore['objects'][name]["geometries"][i]['properties']['NAME_3']
    print(english_village)
    datastore['objects'][name]["geometries"][i]['properties']['Arabic_NAME_3'] = villagePairs.loc[english_village, 'Arabic Name']

    if (villagePairs.loc[english_village, 'Arabic Name']==np.nan) or (str(villagePairs.loc[english_village, 'Arabic Name'])=='nan'):
        datastore['objects'][name]["geometries"][i]['properties']['Arabic_NAME_3'] =""
    else:
        print(str(str(villagePairs.loc[english_village, 'Arabic Name']).encode('utf-8')))
    datastore['objects'][name]["geometries"][i]['properties']['id']=i+1



with codecs.open(filename, 'w', "utf-8") as write_file:
    json.dump(datastore, write_file)
