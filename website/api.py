import json
import random

from flask import abort, Response

from website import app
from website.data import countyCodes as counties
from website.utils import docache

@app.route('/counties', methods=['GET'])
@docache(minutes=60*24*5) # Cache for 5 days since this will not change!
def countyCodes():
    return json.dumps(counties)

@app.route('/counties/list', methods=['GET'])
@docache(minutes=60*24*5) # Cache for 5 days since this will not change!
def countyList():
    return json.dumps(list(counties.keys()))

@app.route("/covid/<county>", methods=['GET'])
def covidCounty(county):
    with open("C:/Users/willi/Documents/Coding/TSE/TSEGroup8Website/static/covid-data.csv", "r") as covidFile:
        next(covidFile)
        return "".join(filter(lambda line: county in line, covidFile.readlines()))
    


    # if not county in counties.keys():
    #     abort(404, description="County not found")
    # output = ""
    # for i in range(200):
    #     output += str(random.randint(1,31)) + "/" + str(random.randint(1,12)) + "/2020" + ","
    #     output += county + ","
    #     output += str(random.randint(1, 5000)) + "," + str(random.randint(1, 5000)) + "\n"

    # return Response(output, content_type="text/csv")
