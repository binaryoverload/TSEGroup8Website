import json
import csv
import datetime

from website.utils import dateToDatetime

countyCodes = {}

covidByCounty = {}
covidTotals = []

airportCountyMapping = {}

flightData = {}
flightsByCounty = {}
flightsTotals = {}

with open("data/countyCodes.json", "r") as countyCodesFile:
    countyCodes = json.load(countyCodesFile)

with open("data/covid-totals.csv", "r") as covidTotalsFile:
    next(covidTotalsFile)
    csvReader = csv.reader(covidTotalsFile)
    for row in csvReader:
        covidTotals.append([row[0], row[1], row[2]])

with open("data/covid-by-county.csv", "r") as covidByCountyFile:
    next(covidByCountyFile) # Skip header
    csvReader = csv.reader(covidByCountyFile)
    for row in csvReader:
        if row[1] in covidByCounty:
            covidByCounty[row[1]].append([row[0], row[2], row[3]])
        else:
            covidByCounty[row[1]] = [[row[0], row[2], row[3]]]

    for county in covidByCounty.keys():
        unsortedList = covidByCounty[county]
        sortedList = sorted(unsortedList, key=lambda row: dateToDatetime(row[0]))
        covidByCounty[county] = sortedList

with open("data/flights-totals.csv", "r") as flightsTotalsFile:
    next(flightsTotalsFile)
    csvReader = csv.reader(flightsTotalsFile)
    for row in csvReader:
        flightsTotals[row[0]] = row[1]

with open("data/flights-by-county.csv", "r") as flightsByCountyFile:
    next(flightsByCountyFile) # Skip header
    csvReader = csv.reader(flightsByCountyFile)
    for row in csvReader:
        if row[1] in flightsByCounty:
            flightsByCounty[row[1]].append([row[0], row[2]])
        else:
            flightsByCounty[row[1]] = [[row[0], row[2]]]

    for county in flightsByCounty.keys():
        unsortedList = flightsByCounty[county]
        sortedList = sorted(unsortedList, key=lambda row: dateToDatetime(row[0]))
        flightsByCounty[county] = sortedList

with open("data/airport-counties.csv", "r") as airportCountiesFile:
    next(airportCountiesFile) # Skip header
    csvReader = csv.reader(airportCountiesFile)
    for row in csvReader:
        airportCountyMapping[row[0]] = row[1]

with open("data/flight-data-jan-dec.csv", "r") as flightDataFile:
    next(flightDataFile) # Skip header
    csvReader = csv.reader(flightDataFile)
    for row in csvReader:
        datetimeFromTimestamp = datetime.datetime.fromtimestamp(int(row[2]))
        date = datetimeFromTimestamp.strftime("%d/%m/%Y")
        county = ""
        if row[5] in airportCountyMapping:
            county = airportCountyMapping[row[5]] # Convert arrival airport to county
        else:
            continue

        if county in flightData:
            if date in flightData[county]:
                flightData[county][date].append(row)
            else:
                flightData[county][date] = [row]
        else:
            flightData[county] = {}
            flightData[county][date] = [row]

        

    