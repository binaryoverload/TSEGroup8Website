import json

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