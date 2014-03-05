var dataFile = "data/passfail.json";

var chart = stackedAreaChart()
    .x(function(d) { return d.date; })
    .y(function(d) { return d.count; })
    .yLabel("Total Number")
    .dimKey(function(d) { return d._id.buildResult; })
    .yTickFormat(function(d) { return d3.round(d); })
    .categories(["ABORTED","SUCCESS","UNSTABLE","FAILURE"])
    .colors(["#C0C0C0","#6FB200","#FCE338","#EF3434"]);

drawChart(dataFile);

function drawChart(dataFile) {
    d3.json(dataFile, function(data) {
        d3.select("#graph")
            .datum(data)
            .call(chart);
    });
}