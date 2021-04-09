import json
import random

from flask import abort, Response

from website import app
from website.data import countyCodes as counties
from website.data import covidTotals as covidTotalsData
from website.data import covidByCounty as covidByCountyData
from website.data import flightsByCounty as flightsByCountyData
from website.data import flightsTotals as flightsTotalsData
from website.utils import docache

@app.route('/counties', methods=['GET'])
@docache(minutes=60*24*5) # Cache for 5 days since this will not change!
def countyNames():
    return json.dumps(counties)

@app.route('/counties/<county>', methods=['GET'])
@docache(minutes=60*24*5) # Cache for 5 days since this will not change!
def countyName(county):
    if not county in counties:
        abort(404, description="County not found")
    return counties[county]

@app.route('/counties/list', methods=['GET'])
@docache(minutes=60*24*5) # Cache for 5 days since this will not change!
def countyList():
    return json.dumps(list(counties.keys()))

@app.route("/covid/<county>", methods=['GET'])
@docache(minutes=60*24*5, content_type='text/plain; charset=utf-8') # Cache for 5 days since this will not change!
def covidCounty(county):
    return "\n".join(map(lambda row: ",".join(row), covidByCountyData[county]))
    
@app.route("/covid", methods=['GET'])
@docache(minutes=60*24*5, content_type='text/plain; charset=utf-8') # Cache for 5 days since this will not change!
def covidTotals():
    return "\n".join(map(lambda row: ",".join(row), covidTotalsData))

@app.route("/flights/<county>", methods=['GET'])
@docache(minutes=60*24*5, content_type='text/plain; charset=utf-8') # Cache for 5 days since this will not change!
def flightCounty(county):
    if not county in flightsByCountyData:
        abort(404, description="County not found")
    return "\n".join(map(lambda row: ",".join(row), flightsByCountyData[county]))
    
@app.route("/flights", methods=['GET'])
@docache(minutes=60*24*5, content_type='text/plain; charset=utf-8') # Cache for 5 days since this will not change!
def flightTotals():
    return "\n".join(map(lambda row: ",".join(row), flightsTotalsData.items()))


    # if not county in counties.keys():
    #     abort(404, description="County not found")
    # output = ""
    # for i in range(200):
    #     output += str(random.randint(1,31)) + "/" + str(random.randint(1,12)) + "/2020" + ","
    #     output += county + ","
    #     output += str(random.randint(1, 5000)) + "," + str(random.randint(1, 5000)) + "\n"

    # return Response(output, content_type="text/csv")
