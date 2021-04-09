from datetime import datetime, date, timedelta
from functools import wraps
from flask import Response


# Function used from https://maskaravivek.medium.com/how-to-add-http-cache-control-headers-in-flask-34659ba1efc0
# This is a decorator that will cache the response
def docache(minutes=5, content_type='application/json; charset=utf-8'):
    """ Flask decorator that allow to set Expire and Cache headers. """
    def fwrap(f):
        @wraps(f)
        def wrapped_f(*args, **kwargs):
            r = f(*args, **kwargs)
            then = datetime.now() + timedelta(minutes=minutes)
            rsp = Response(r, content_type=content_type)
            rsp.headers.add('Expires', then.strftime("%a, %d %b %Y %H:%M:%S GMT"))
            rsp.headers.add('Cache-Control', 'public,max-age=%d' % int(60 * minutes))
            return rsp
        return wrapped_f
    return fwrap

# Takes a date in the format dd/mm/yyyy and converts it to a python datetime
def dateToDatetime(date):
    day, month, year = map(lambda datePart: int(datePart), date.split("/"))
    return datetime(year, month, day)