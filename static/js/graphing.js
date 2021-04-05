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
                hidden: false
            },
            {
                label: 'Daily COVID-19 Cases',
                yAxisID: "covid_cases_daily",
                data: [],
                borderColor: "#55cbcd",
                backgroundColor: "#55cbcd22",
                tension: 0.4,
                fill: true,
                hidden: true
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

(async function() {
    const counties = await fetch("/counties").then(r => r.json())
    const select = document.getElementById("graphing-county-input")
    for (let county of Object.keys(counties)) {
        const opt = document.createElement("option")
        opt.value = county
        opt.innerText = counties[county]
        select.appendChild(opt)
    }
    chartUpdate(document.getElementById("graphing-county-input").value)
})()

function chartUpdate(county) {
    fetch("/covid/" + county).then(r => r.text()).then(t => {
        let lines = t.split("\n")
        const sortedLines = lines.sort((a, b) => {
            let aDate = convertDateToJSDate(a.split(",")[0]);
            let bDate = convertDateToJSDate(b.split(",")[0]);

            return aDate - bDate;
        })
        const dates = sortedLines.map(line => line.split(",")[0].replace(/\//g, "-"))
        const cumulative = sortedLines.map(line => line.split(",")[2])
        const daily = sortedLines.map(line => line.split(",")[3])
        chart.data.labels = dates
        chart.data.datasets[0].data = cumulative
        chart.data.datasets[1].data = daily
        chart.update()
    });
}

document.getElementById("graphing-county-input").addEventListener("change", function(e) {
    chartUpdate(e.target.value)
});