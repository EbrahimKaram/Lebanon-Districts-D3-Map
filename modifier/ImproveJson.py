import json
import pandas as pd
import codecs

filename = "modifier\Lebanon_Level1.json"
if filename:
    with open(filename, 'r') as f:
        datastore = json.load(f)

mohafazaPairs = pd.read_excel(
    'modifier\English List of districts. Arabic names of districts 2.0.xlsx', sheet_name=3, index_col='In English')


number_of_districts = len(datastore["objects"]["gadm36_LBN_1"]["geometries"])

for i in range(0, number_of_districts):
    print(datastore['objects']["gadm36_LBN_1"]
          ["geometries"][i]['properties']['NAME_1'])
    english_district = datastore['objects']["gadm36_LBN_1"]["geometries"][i]['properties']['NAME_1']
    datastore['objects']["gadm36_LBN_1"]["geometries"][i]['properties']['Arabic_NAME_1'] = mohafazaPairs.loc[english_district, 'Mohafaza Name']

with codecs.open(filename, 'w', "utf-8") as write_file:
    json.dump(datastore,write_file)
