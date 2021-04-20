const countyBoxes = ["graphing-county-input", "data-county-input"];

function convertDateToJSDate(inputDate) {
    let dateParts = inputDate.split("/");
    return new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
}

(async function() {
    const counties = await fetch("/counties").then(r => r.json())
    window.counties = counties
    for (let county of Object.keys(counties)) {
        for (let box of countyBoxes) {
            let select = document.getElementById(box);
            const opt = document.createElement("option")
            opt.value = county
            opt.innerText = counties[county]
            select.appendChild(opt)
        }
    }
})()

document.getElementById("data-type-input").addEventListener("change", function(e) {
    if (e.target.value === "covid") {
        document.getElementById("data-county-inputs").classList.add("d-none")
        document.getElementById("flight-data-table").classList.add("d-none")

        document.getElementById("data-county-search-inputs").classList.remove("d-none")
        document.getElementById("covid-data-table").classList.remove("d-none")
    } else {
        document.getElementById("data-county-search-inputs").classList.add("d-none")
        document.getElementById("covid-data-table").classList.add("d-none")

        document.getElementById("data-county-inputs").classList.remove("d-none")
        document.getElementById("flight-data-table").classList.remove("d-none")
    }
})

document.getElementById("data-date-input").addEventListener("change", function(e) {
    refreshTableFromDOM()
})

document.getElementById("data-county-input").addEventListener("change", function(e) {
    refreshTableFromDOM()
})

document.getElementById("data-county-search-input").addEventListener("input", function(e) {
    refreshTableFromDOM()
})

function refreshTableFromDOM() {
    let dateInput = document.getElementById("data-date-input").value

    if (dateInput === "") {
        return;
    }

    let day = dateInput.split("-")[2]
    let month = dateInput.split("-")[1]
    let year = dateInput.split("-")[0]

    let date = `${day}/${month}/${year}`
    let mode = document.getElementById("data-type-input").value
    let county = document.getElementById("data-county-input").value

    if (mode === "flights" && county === "") {
        return;
    }

    refreshTable(mode, date, county)
}

const dateTimeFormat = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' })

async function refreshTable(mode, date, county) {
    if (mode === "covid") {
        let tableBody = document.querySelector("#covid-data-table>table>tbody");
        tableBody.innerHTML = "";

        let data = window.covidData.filter(row => row[0] === date).sort((row1, row2) => row2[3] - row1[3])

        data = data.filter(row => window.counties[row[1]].toLowerCase().includes(document.getElementById("data-county-search-input").value.toLowerCase()))

        for (let row of data) {
            let daily = row[3].trim()
            let cumulative = row[2].trim()

            if (!(daily == "0" && cumulative == "0")) {
                let rowElement = document.createElement("tr")

                rowElement.innerHTML += `<td>${window.counties[row[1]]}</td>`
                rowElement.innerHTML += `<td>${cumulative}</td>`
                rowElement.innerHTML += `<td>${daily}</td>`

                tableBody.appendChild(rowElement)
            }
        }
    } else if (mode === "flights") {
        const flightDataResponse = await fetch(`/flights/${county}/date/${encodeURIComponent(date)}`)



        let tableBody = document.querySelector("#flight-data-table>table>tbody");
        tableBody.innerHTML = "";

        if (flightDataResponse.status.toString().startsWith("2")) {
            const flightData = await flightDataResponse.text()

            for (let row of flightData.split("\n").map(row => row.split(","))) {
                let rowElement = document.createElement("tr")

                // ICAO24
                row[0] = row[0].toUpperCase()

                // First Seen
                row[1] = dateTimeFormat.format(new Date(row[1] * 1000))

                // Last Seen
                row[2] = dateTimeFormat.format(new Date(row[2] * 1000))

                // Departure Airport
                if (row[4].trim() === "NULL") {
                    row[4] = "- Unknown -"
                }

                for (let cell of row) {
                    rowElement.innerHTML += `<td>${cell}</td>`
                }

                tableBody.appendChild(rowElement)
            }

        }

    }
}