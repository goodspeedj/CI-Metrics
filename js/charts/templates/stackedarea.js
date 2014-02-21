function stackedAreaChart() {

    // parsed date
    //var parsedDate = dateFormat.parse;
    var parseDate = d3.time.format("%Y-%m-%d");

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

    var categories = ["SUCCESS","UNSTABLE","FAILURE","ABORTED"];
    var z = d3.scale.ordinal().domain(categories).range(["#A2C21D","#FCE338","#EF3434"]);

    // Create the area stack
    var stack = d3.layout.stack()
              .offset("zero")
              .values(function(d) { return d.values; })
              .x(function(d) { return xValue(d); })
              .y(function(d) { return yValue(d); });

    // Define the area
    var area = d3.svg.area()
              .interpolate("basis")
              //.x(function(d) { return main_x(xValue(d)); })
              .x(function(d) { console.log(main_x(parseDate(d.date).parse)); return main_x(parseDate(d.date).parse); })
              .y0(function(d) { return main_y(d.y0); })
              .y1(function(d) { return main_y(d.y0 + d.y); });


    function chart(selection) {
        selection.each(function(data) {

            // Loop through the data and add elements
            data.result.forEach(function(d) {
                d.date = new Date(d._id.year, d._id.month-1, d._id.day);
                //d.date = parseDate.parse(d._id.year + "-" + d._id.month-1 + "-" + d._id.day);
                //d.date1 = parseDate.parse("2011-01-01");
                //d.buildResult = d._id.buildResult;
            });

            // Nest by name aka status
            var nested = d3.nest()
              .key(dimKey);

            // Create the layers
            var layers = stack(nested.entries(data.result));
            console.log(layers);

            main_x.domain(d3.extent(data, function(d) { return xValue(d); }));

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
              .attr("transform", "translate(0," + main_height + ")")
              .call(main_xAxis);

            svg.append("g")
              .attr("class", "y axis")
              .call(main_yAxis);
        });
    }


    // Get/set main_margin
    chart.main_margin = function(value) {
        if (!arguments.length) return main_margin;
        main_margin = value;
        return chart;
    }

    // Get/set mini_margin
    chart.mini_margin = function(value) {
        if (!arguments.length) return mini_margin;
        mini_margin = value;
        return chart;
    }

    // Get/set main_width
    chart.main_width = function(value) {
        if (!arguments.length) return main_width;
        main_width = value;
        return chart;
    }

    // Get/set main_height
    chart.main_height = function(value) {
        if (!arguments.length) return main_height;
        main_height = value;
        return chart;
    }

    // Get/set mini_height
    chart.mini_height = function(value) {
        if (!arguments.length) return mini_height;
        mini_height = value;
        return chart;
    }

    chart.x = function(value) {
        if (!arguments.length) return xValue;
        xValue = value;
        return chart;
    }

    chart.y = function(value) {
        if (!arguments.length) return yValue;
        yValue = value;
        return chart;
    }

    // Get/set the Y axis label
    chart.yLabel = function(value) {
        if (!arguments.length) return yLabel;
        yLabel = value;
        return chart;
    }

    // Get/set the dimension key
    chart.dimKey = function(value) {
        if (!arguments.length) return dimKey;
        dimKey = value;
        return chart;
    }
  
    chart.yTickFormat = function(value) {
        if (!arguments.length) return yTickFormat;
        yTickFormat = value;
        return chart;
    }

    return chart;
}