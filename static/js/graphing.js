const ctx = document.getElementById('graph');
const chart = new Chart(ctx, {
    type: 'line',
    options: {
        animation: {
            duration: 250
        },
        plugins: {
            legend: {
                position: "top"
            }
        },
        scales: {
            covid_cases_cum: {
                axis: "y",
                title: {
                    display: true,
                    text: "Cumulative COVID-19 Cases"
                },
                backgroundColor: "#ff968a55",
                type: "linear",
                display: "auto"
            },
            covid_cases_daily: {
                axis: "y",
                title: {
                    display: true,
                    text: "Daily COVID-19 Cases"
                },
                backgroundColor: "#55cbcd55",
                type: "linear",
                display: "auto"
            },
            flights: {
                axis: "y",
                title: {
                    display: true,
                    text: "Daily Flights"
                },
                backgroundColor: "#ffcba255",
                type: "linear",
                display: "auto"
            }
        }
    },
    data: {
        labels: [],
        datasets: [{
                label: 'Cumulative COVID-19 Cases',
                yAxisID: "covid_cases_cum",
                data: [],
                borderColor: "#ff968a",
                backgroundColor: "#ff968a22",
                tension: 0.4,
                fill: true,
                hidden: true
            },
            {
                label: 'Daily COVID-19 Cases',
                yAxisID: "covid_cases_daily",
                data: [],
                borderColor: "#55cbcd",
                backgroundColor: "#55cbcd22",
                tension: 0.4,
                fill: true,
                hidden: false
            },
            {
                label: 'Daily Flights',
                yAxisID: "flights",
                data: [],
                borderColor: "#ffcba2",
                backgroundColor: "#ffcba222",
                tension: 0.4,
                fill: true,
                hidden: true
            }
        ]
    }
});

// document.getElementById("graphing-date-input").addEventListener("change", function(e) {
//     document.getElementById("graphing-date-output").innerText = e.target.value
// });

function convertDateToJSDate(inputDate) {
    let dateParts = inputDate.split("/");
    return new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
}

function chartUpdate(county) {
    let covidPromise = (county === "all" ? fetch("/covid/summary/all") : fetch("/covid/summary/" + county)).then(r => {
        if (r.ok) return r.text()
        return ""
    });

    let flightPromise = (county === "all" ? fetch("/flights/summary/all") : fetch("/flights/summary/" + county)).then(r => {
        if (r.ok) return r.text()
        return ""
    });

    Promise.all([covidPromise, flightPromise]).then(responses => {

        let [covidData, flightData] = responses;

        const dates = []

        for (let d = new Date(2020, 0, 31); d <= new Date(2020, 11, 31); d.setDate(d.getDate() + 1)) {
            dates.push(`${(d.getDate()+"").padStart(2, 0)}/${(d.getMonth() + 1 +"").padStart(2, 0)}/${d.getFullYear()}`)
        }

        const cumulative = {}
        const daily = {}
        covidData.split("\n").forEach(row => {
            splitRow = row.split(",")
            cumulative[splitRow[0]] = +splitRow[1]
            daily[splitRow[0]] = +splitRow[2]
        });

        const flights = {}
        flightData.split("\n").forEach(row => {
            splitRow = row.split(",")
            flights[splitRow[0]] = +splitRow[1]
        })

        let cumulativeData = []
        let dailyData = []
        let flightsData = []
        for (let date of dates) {
            cumulativeData.push(cumulative[date] || undefined)
            dailyData.push(daily[date] || undefined)
            flightsData.push(flights[date] || undefined)
        }

        chart.data.labels = dates
        chart.data.datasets[0].data = cumulativeData
        chart.data.datasets[1].data = dailyData
        chart.data.datasets[2].data = flightsData

        chart.update()
    });
}

chartUpdate(document.getElementById("graphing-county-input").value)

document.getElementById("graphing-county-input").addEventListener("change", function(e) {
    chartUpdate(e.target.value)
});