var dataFile = "data/passfail.json";

var chart = stackedAreaChart()
    .x(function(d) { return d.date; })
    .y(function(d) { return d.count; })
    .yLabel("Total Number")
    .dimKey(function(d) { return d._id.buildResult; })
    .yTickFormat(function(d) { return d3.round(d); });

drawChart(dataFile);

d3.selectAll(".filter").on("change", filter);

function filter() {
    var dataFile;

    switch(this.value) {
        case "Analytics":
            dataFile = "data/passfail-analytics.json";
            break;
        case "eSales":
            dataFile = "data/passfail-test.json";
            break;
        case "eService":
            dataFile = "data/passfail-eservice.json";
            break;
        case "LMcom":
            dataFile = "data/passfail-lmcom.json";
            break;
        case "Shared":
            dataFile = "data/passfail-shared.json";
            break;
        default:
            dataFile = "data/passfail.json";
    }

    redraw(dataFile);
}

function drawChart(dataFile) {
    d3.json(dataFile, function(data) {
        d3.select("#graph")
            .datum(data)
            .call(chart);
    });
}