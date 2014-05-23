var chartName = "sitespeed";

var chart = multiLineChart()
    .x(function(d) { return d.date; })
    .y(function(d) { return d.ruleScore; })
    .yLabel("Score")
    .dimKey(function(d) { return d._id.env })
    .yTickFormat(function(d) { return d3.round(d); })
    .yScale(d3.scale.linear())
    .color(d3.scale.category10());
    //.brushChart(false);

d3.json('data/sitespeed.json', function(data) {
    d3.select("#graph")
        .datum(data)
        .call(chart);
});


/*
$(".metric-select").change(function() {
    metric = $(".metric-select").val();
});
*/