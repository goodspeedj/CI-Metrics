var chart = stackedAreaChart()
	.x(function(d) { return d.date; })
	.y(function(d) { return d.count; })
  	.yLabel("Total Number")
  	.dimKey(function(d) { return d._id.buildResult; })
  	.yTickFormat(function(d) { return d3.round(d); });;

d3.json('data/passfail.json', function(data) {
	d3.select("#graph")
		.datum(data)
		.call(chart);
});