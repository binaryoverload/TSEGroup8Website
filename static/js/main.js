const countyBoxes = ["graphing-county-input", "data-county-input"];

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
    } else {
        document.getElementById("data-county-inputs").classList.remove("d-none")
    }
})

document.getElementById("data-date-input").addEventListener("change", function(e) {
    console.log("Changed!")
    console.log("Mode: ", document.getElementById("data-type-input").value)
    let day = e.target.value.split("-")[2]
    let month = e.target.value.split("-")[1]
    let year = e.target.value.split("-")[0]

    let newDate = `${day}/${month}/${year}`
    if (document.getElementById("data-type-input").value === "covid") {
        let tableBody = document.querySelector("#covid-data-table>table>tbody");
        tableBody.innerHTML = "";


        let data = window.covidData.filter(row => row[0] === newDate).sort((row1, row2) => row2[3] - row1[3])

        for (let row of data) {
            let rowElement = document.createElement("tr")
            let countyCell = document.createElement("td")
            countyCell.innerText = window.counties[row[1]]
            let cumulativeCell = document.createElement("td")
            cumulativeCell.innerText = row[2]
            let dailyCell = document.createElement("td")
            dailyCell.innerText = row[3]
            rowElement.appendChild(countyCell)
            rowElement.appendChild(cumulativeCell)
            rowElement.appendChild(dailyCell)
            tableBody.appendChild(rowElement)
        }
    }
})