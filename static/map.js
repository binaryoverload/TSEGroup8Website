let covidMap = {};

let cumulativeColorScale = [];

let dailyColorScale = [];

let colorScale = ["#fcde95", "#fc9860", "#f5614b", "#dc3852", "#ba2760", "#941b6a", "#79146e", "#50046d", "#300061", "#0c0920"];

(async function() {
    window.map = L.map('map').setView([54.898, -5.416], 6);
    let tileLayer = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>, <a href="https://coronavirus.data.gov.uk/details/interactive-map#:~:text=Attributions">Data and Boundaries © </a>',
        maxZoom: 18,
        id: 'mapbox/light-v10',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1IjoiYmluYXJ5b3ZlcmxvYWQiLCJhIjoiY2tsbXN2dDg5MGNlMDJvbXVicnN3Y2RxOSJ9.yCG6Sk6vz7qdhVT2gsWkpA'
    });

    tileLayer.addTo(window.map);

    let counties = await fetch("/static/countyCodes.json").then(data => data.json())
    let mapData = await fetch('https://coronavirus.data.gov.uk/downloads/maps/utla-ref.geojson').then(data => data.json())
        // let mapData = await fetch('https://coronavirus.data.gov.uk/downloads/maps/utla_data_latest.geojson').then(data => data.json())

    let covidDataFetch = await fetch("/static/covid-data.csv")

    const reader = covidDataFetch.body.getReader();
    const totalLength = Number(covidDataFetch.headers.get("Content-Length"))

    let chunks = [];
    let receivedLength = 0;
    while (true) {
        const { done, value } = await reader.read();

        if (done) {
            break;
        }

        chunks.push(value);
        receivedLength += value.length;

        document.querySelectorAll(".progress-bar span").forEach(n => n.setAttribute("style", `width: ${(receivedLength / totalLength) * 100}%`))
        document.querySelectorAll(".progress-overlay .progress-label").forEach(n => n.innerHTML = `&nbsp;Loading data ${Math.floor((receivedLength / totalLength) * 100)}%...`)

        console.log(`Received ${receivedLength} of ${totalLength} (${Math.floor((receivedLength / totalLength) * 100)}% downloaded)`)
    }

    document.querySelectorAll(".progress-overlay").forEach(n => n.remove())

    let chunksAll = new Uint8Array(receivedLength);
    let position = 0;
    for (let chunk of chunks) {
        chunksAll.set(chunk, position);
        position += chunk.length;
    }

    let result = new TextDecoder("utf-8").decode(chunksAll);

    window.covidData = result.split("\n").map(line => line.split(/,(?![^,]+")/g))

    let dateString = getSliderDateString(document.getElementById("slider").value)
    let covidLines = window.covidData.map(line => {
        return {
            date: line[0],
            countyCode: line[2],
            cumulative: Number(line[4]),
            daily: Number(line[5])
        }
    })

    let cumulativeArray = covidLines.reduce((a, line) => {
        if (isNaN(line.cumulative)) {
            return a
        }
        a.push(line.cumulative)
        return a;
    }, []).sort((a, b) => a - b)

    let cumulativeDeciles = []

    for (let i = 1; i <= 10; i++) {
        let decile = cumulativeArray[Math.floor((cumulativeArray.length - 1) * (i / 10))]
        decile = Number(decile.toPrecision(2))
        if (i === 1) {
            decile = 0
        }
        cumulativeDeciles.push(decile)
    }


    let dailyArray = covidLines.reduce((a, line) => {
        if (isNaN(line.daily)) {
            return a
        }
        a.push(line.daily)
        return a;
    }, []).sort((a, b) => a - b)

    let dailyDeciles = []

    for (let i = 1; i <= 10; i++) {
        let decile = dailyArray[Math.floor((dailyArray.length - 1) * (i / 10))]
        decile = Number(decile.toPrecision(2))
        if (i === 1) {
            decile = 0
        }
        dailyDeciles.push(decile)
    }

    for (let i = 0; i < cumulativeDeciles.length; i++) {
        cumulativeColorScale.push({
            min: cumulativeDeciles[i],
            max: cumulativeDeciles[i + 1] || Number.MAX_VALUE,
            color: colorScale[i]
        })
        document.getElementById("cumulative-overlay").innerHTML += `<div class="overlay-percentile-${i + 1}"><span></span>${cumulativeDeciles[i]}${cumulativeDeciles[i + 1] ? " - " + cumulativeDeciles[i + 1] : "+"}</div>`
    }

    for (let i = 0; i < dailyDeciles.length; i++) {
        dailyColorScale.push({
            min: dailyDeciles[i],
            max: dailyDeciles[i + 1] || Number.MAX_VALUE,
            color: colorScale[i]
        })
        document.getElementById("daily-overlay").innerHTML += `<div class="overlay-percentile-${i + 1}"><span></span>${dailyDeciles[i]}${dailyDeciles[i + 1] ? " - " + dailyDeciles[i + 1] : "+"}</div>`
    }

    covidMap = covidLines.reduce((map, line) => {
        if (line.date === "date") return map;
        let obj = {}
        obj.cumulative = +line.cumulative
        obj.daily = +line.daily
        obj.cumulativeColor = getGradientColor(+line.cumulative, cumulativeColorScale)
        obj.dailyColor = getGradientColor(+line.daily, dailyColorScale)
        if (map[line.date]) {
            map[line.date][line.countyCode] = obj
        } else {
            map[line.date] = {}
            map[line.date][line.countyCode] = obj
        }
        return map;
    }, {})


    dateUpdate(dateString)

    let cumulativeGeoJson = L.geoJSON(mapData, { className: "cumulative-layers" }).bindTooltip(function(layer) {
        let covidData = covidMap[getSliderDateString(document.getElementById("slider").value)][layer.feature.properties.code]
        return counties[layer.feature.properties.code] + " (" + layer.feature.properties.code + ") - " + (covidData ? covidData.cumulative : "No Data");
    });

    let dailyGeoJson = L.geoJSON(mapData, { className: "daily-layers" }).bindTooltip(function(layer) {
        let covidData = covidMap[getSliderDateString(document.getElementById("slider").value)][layer.feature.properties.code]
        return counties[layer.feature.properties.code] + " (" + layer.feature.properties.code + ") - " + (covidData ? covidData.daily : "No Data");
    })

    cumulativeGeoJson.addTo(window.map);

    const layerControls = L.control.layers({
        "Cumulative Data": cumulativeGeoJson,
        "Daily Data": dailyGeoJson
    }, {}, { collapsed: false });
    layerControls.addTo(window.map);

    cumulativeGeoJson.on("add", function() {
        document.getElementById("cumulative-overlay").style.display = ""
        dateUpdate(getSliderDateString(document.getElementById("slider").value))
    })

    cumulativeGeoJson.on("remove", function() {
        document.getElementById("cumulative-overlay").style.display = "none"
    })

    dailyGeoJson.on("add", function() {
        document.getElementById("daily-overlay").style.display = ""
        dateUpdate(getSliderDateString(document.getElementById("slider").value))
    })

    dailyGeoJson.on("remove", function() {
        document.getElementById("daily-overlay").style.display = "none"
    })

    dateUpdate(getSliderDateString(document.getElementById("slider").value))

})()

document.getElementById("slider").addEventListener("input", function(e) {
    let dateString = getSliderDateString(e.target.value)
    dateUpdate(dateString)
})

function getSliderDate(value) {
    let date = new Date(2020, 0, 31)
    date.setDate(date.getDate() + value)
    return date
}

function dateUpdate(dateString) {
    document.getElementById("date").innerText = dateString
    setStyles(dateString)
}

function getSliderDateString(value) {
    let date = getSliderDate(parseInt(value))
    let dateString = `${Math.max(date.getDate(), 1).toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()}`
    return dateString
}

function getGradientColor(number, colorScale) {
    // for (let color of dailyColorScale) { // daily
    for (let color of colorScale) { // daily
        if (number < color.max && number >= color.min) {
            return color.color
        }
    }
    return "#000000"
}

function setStyles(date) {

    window.map.eachLayer(function(layer) {
        console.log(layer)
        if (layer.setStyle && layer.feature) {
            let countyObject = covidMap[date][layer.feature.properties.code]
            let color = undefined
            if (countyObject) {
                if (layer.options.className === "cumulative-layers") {
                    color = covidMap[date][layer.feature.properties.code].cumulativeColor
                } else if (layer.options.className === "daily-layers") {
                    color = covidMap[date][layer.feature.properties.code].dailyColor
                }
            }
            layer.setStyle({
                color,
                weight: 1
            })
        }
    })

}