var chart = multiLineChart()
	.x(function(d) { return d.date; })
	.y(function(d) { return d.buildFixTime; });

d3.json('duration_by_stream.json', function(data) {
	d3.select("#graph")
		.datum(data)
		.call(chart);
});