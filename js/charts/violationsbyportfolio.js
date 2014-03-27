var chart = stackedGroupedBarChart()
    .x0(function(d) { return d.date; })
    .x1(function(d) { return d.portfolio; })
    .y(function(d) { return d.violations; })
    .yLabel("Count of Violations")
    .dimKey(function(d) { return d._id.portfolio; })
    .yTickFormat(function(d) { return d3.round((d), 1); })
    //.colors(d3.scale.ordinal().range(["#5D5CD6","#5FD664","#FF7236","#D64041","#C53AD6"]));
    .colors(d3.scale.ordinal().range(["#D64041","#FF7236","#5FD664","#5D5CD6","#C53AD6"]));

d3.json('data/violations_by_portfolio.json', function(data) {
    d3.select("#graph")
        .datum(data)
        .call(chart);
});
