import json
import pandas as pd
import codecs

filename = "modifier\Lebanon_Level2.json"

if filename:
    with codecs.open(filename, 'r', 'utf-8') as f:
        datastore = json.load(f)

mohafazaPairs = pd.read_excel(
    'modifier\English List of districts. Arabic names of districts 2.0.xlsx', sheet_name=3, index_col='In English')

districtPairs = pd.read_excel(
    'modifier\English List of districts. Arabic names of districts 2.0.xlsx', sheet_name=2, index_col='District')

districtPairs = districtPairs.loc[~districtPairs.index.duplicated(
    keep='first')]

# Depending on fileName
name = 'gadm36_LBN_2'
number_of_districts = len(datastore["objects"][name]["geometries"])

for i in range(0, number_of_districts):
    english_mohafaza = datastore['objects'][name]["geometries"][i]['properties']['NAME_1']
    print(english_mohafaza)
    datastore['objects'][name]["geometries"][i]['properties']['Arabic_NAME_1'] = str(mohafazaPairs.loc[english_mohafaza, 'Mohafaza Name'])

    english_district = datastore['objects'][name]["geometries"][i]['properties']['NAME_2']
    print(english_district)
    datastore['objects'][name]["geometries"][i]['properties']['Arabic_NAME_2'] = districtPairs.loc[english_district, 'Column1']
    print(districtPairs.loc[english_district, 'Column1'].encode('utf-8'))


with codecs.open(filename, 'w', "utf-8") as write_file:
    json.dump(datastore, write_file)
