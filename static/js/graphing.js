const ctx = document.getElementById('graph');
const chart = new Chart(ctx, {
    type: 'line',
    options: {
        plugins: {
            legend: {
                position: "right"
            }
        }
    },
    data: {
        labels: [],
        datasets: [{
            label: 'Covid Cases',
            data: [],
            borderColor: "#ff0000",
            backgroundColor: "#ff000022",
            tension: 0.4,
            fill: true,
            hidden: true
        }]
    }
});

// document.getElementById("graphing-date-input").addEventListener("change", function(e) {
//     document.getElementById("graphing-date-output").innerText = e.target.value
// });

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
        console.log(lines)
        const sortedLines = lines.sort((a, b) => {
            let aParts = a.split(",")[0].split("/");
            let bParts = b.split(",")[0].split("/");
            let aDate = new Date(+aParts[2], aParts[1] - 1, +aParts[0]);
            let bDate = new Date(+bParts[2], bParts[1] - 1, +bParts[0]);
            console.log(aDate)
            console.log(bDate)
            return aDate - bDate;
        })
        const dates = sortedLines.map(line => line.split(",")[0])
        const values = sortedLines.map(line => line.split(",")[2])
        chart.data.labels = dates
        chart.data.datasets[0].data = values
        chart.update()
    });
}

document.getElementById("graphing-county-input").addEventListener("change", function(e) {
    chartUpdate(e.target.value)
});