var chart = multiLineChart()
	.x(function(d) { return d.date; })
	.y(function(d) { return d.buildFixTime; })
  //.xLiteral("date")
  //.yLiteral(d.buildFixTime)
  .yLabel("Build Fix Time (Hours)")
  .dimKey(function(d) { return d._id.stream; });

d3.json('fix_time_by_stream.json', function(data) {
	d3.select("#graph")
		.datum(data)
		.call(chart);
});
