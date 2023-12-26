import csv

import yaml

with open("I2Languages.asset") as f:
    assets = yaml.load(f, Loader=yaml.BaseLoader)

source = assets["MonoBehaviour"]["mSource"]

# Column header
languages = [language["Name"] for language in source["mLanguages"]]

# Rows
character_names = [
    row["Term"].split("/")[1:] + row["Languages"]
    for row in source["mTerms"]
    if row["Term"].startswith("CharMemNames")
]

with open("CharMemNames.csv", "w") as f:
    writer = csv.writer(f)
    writer.writerow([0] + languages)
    writer.writerows(character_names)
