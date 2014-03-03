var chart = stackedAreaChart()
    .x(function(d) { return d.date; })
    .y(function(d) { return d.total; })
    .yLabel("Total Number")
    .dimKey(function(d) { return d._id.portfolio; })
    .yTickFormat(function(d) { return d3.round(d); });

d3.json('data/unit_by_portfolio.json', function(data) {
    d3.select("#graph")
        .datum(data)
        .call(chart);
});