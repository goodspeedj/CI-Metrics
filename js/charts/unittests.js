var chart = stackedAreaChart()
    .x(function(d) { return d.date; })
    .y(function(d) { return d.total; })
    .yLabel("Total Number (Thousands)")
    .dimKey(function(d) { return d._id.portfolio; })
    .yTickFormat(function(d) { return d3.round(d / 1000); })
    .categories(["failed", "skipped", "total"])
    .stackColors(["#ff8c00","#6b486b", "#98abc5"])
    .yScale(d3.scale.sqrt());

d3.json('data/unit_by_portfolio.json', function(data) {
    d3.select("#graph")
        .datum(data)
        .call(chart);
});