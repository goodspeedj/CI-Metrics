function stackedAreaChart() {

	// The label for the Y axis
    var yLabel = "Duration";

    // These are the x and y dimensions supplied by the calling chart
    var xValue, yValue;

    // Setup X time scale
    var main_x = d3.time.scale()
        .range([0, main_width-axis_offset]);

    var mini_x = d3.time.scale()
        .range([0, main_width-axis_offset]);

    var main_xAxis = d3.svg.axis()
        .scale(main_x)
        .ticks(10)
        .orient("bottom");

    var mini_xAxis = d3.svg.axis()
      .scale(mini_x)
      .ticks(d3.time.day, 2)
      .orient("bottom");

    // Setup Y axis
    var main_y = d3.scale.linear()
        .range([main_height, 10]);

    var mini_y = d3.scale.linear()
        .range([mini_height, 0]);

    var main_yAxis = d3.svg.axis()
        .scale(main_y)
        .tickFormat(function(d) { return yTickFormat(d) })
        .orient("left");

    var categories = ["Stable","Unstable","Failed"];
	var z = d3.scale.ordinal().domain(categories).range(["#A2C21D","#FCE338","#EF3434"]);

	// Create the area stack
	var stack = d3.layout.stack()
              .offset("zero")
              .values(function(d) { return d.values; })
              .x(function(d) { return d.date; })
              .y(function(d) { return d.Count; });

    // Nest by name aka status
	var nest = d3.nest()
              .key(function(d) { return d.Name; });

    // Define the area
	var area = d3.svg.area()
              .interpolate("basis")
              .x(function(d) { return x(d.date); })
              .y0(function(d) { return y(d.y0); })
              .y1(function(d) { return y(d.y0 + d.y); });


	function chart(selection) {
        selection.each(function(data) {

        	// Loop through the data and add elements
			data.forEach(function(d) {
			  var date = new Date(d.date);
			  //var date = moment(d.date).format('MM/DD/YY');
			  d.date = format.parse(date);
			  d.Count = +d.Count;
			});

			// Create the layers
			var layers = stack(nest.entries(data));

			layers = stack(nest.entries(data));
			main_x.domain(d3.extent(data, function(d) { return d.date; }));
			main_y.domain([0, d3.max(data, function(d) { return d.y0 + d.y; })]);

			// Add the line paths
			svg.selectAll(".layer")
			  .data(layers)
			.enter().append("path")
			  .attr("class", "layer")
			  .attr("d", function(d) { return area(d.values); })
			  .style("fill", function(d, i) { return z(i); });

			// Add the X and Y axis
			svg.append("g")
			  .attr("class", "x axis")
			  .attr("transform", "translate(0," + height + ")")
			  .call(main_xAxis);

			svg.append("g")
			  .attr("class", "y axis")
			  .call(main_yAxis);
        }
    }

    return chart;
}