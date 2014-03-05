var chart = stackedAreaChart()
    .x(function(d) { return d.date; })
    .y(function(d) { return d.total; })
    .yLabel("Total Number")
    .dimKey(function(d) { return d._id.portfolio; })
    .yTickFormat(function(d) { return d3.round(d / 1000); })
    //.categories(["apples", "oranges"])
    //.stackColors(["red", "orange"]);
    .categories(["total","failed","skipped"])
    .stackColors(["#98ABC5","#6B486B","#FF8C00"]);

d3.json('data/unit_by_portfolio.json', function(data) {
    d3.select("#graph")
        .datum(data)
        .call(chart);
});