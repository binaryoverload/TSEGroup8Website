import json

countyCodes = {}

with open("data/countyCodes.json", "r") as countyCodesFile:
    countyCodes = json.load(countyCodesFile)