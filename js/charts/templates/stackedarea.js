function stackedAreaChart() {

    // parsed date
    var parseDate = d3.time.format("%Y-%m-%d");

    // The label for the Y axis
    var yLabel = "Duration";

    // These are the x and y dimensions supplied by the calling chart
    var xValue, yValue;

    // Setup X time scale
    var main_x = d3.time.scale()
        .range([0, main_width - axis_offset]);

    var mini_x = d3.time.scale()
        .range([0, main_width - axis_offset]);

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
        .range([main_height, 0]);

    var mini_y = d3.scale.linear()
        .range([mini_height, 0]);

    var main_yAxis = d3.svg.axis()
        .scale(main_y)
        .tickFormat(function(d) { return yTickFormat(d) })
        .orient("left");

    // Create the brush for the mini chart
    var brush = d3.svg.brush()
        .x(mini_x)
        .on("brush", brushed);

    var categories = ["ABORTED","SUCCESS","UNSTABLE","FAILURE"];
    var z = d3.scale.ordinal().domain(categories).range(["#C0C0C0","#6FB200","#FCE338","#EF3434"]);

    // Create the area stack
    var stack = d3.layout.stack()
              .offset("zero")
              .values(function(d) { return d.values; })
              .x(function(d) { return xValue(d); })
              .y(function(d) { return yValue(d); });

    // Define the area
    var main_area = d3.svg.area()
              .interpolate("basis")
              .x(function(d) { return main_x(xValue(d)); })
              .y0(function(d) { return main_y(d.y0); })
              .y1(function(d) { return main_y(d.y0 + d.y); });

    var mini_area = d3.svg.area()
              .interpolate("basis")
              .x(function(d) { return mini_x(xValue(d)); })
              .y0(function(d) { return mini_y(d.y0); })
              .y1(function(d) { return mini_y(d.y0 + d.y); });


    function chart(selection) {
        selection.each(function(data) {

            // Loop through the data and add elements
            data.result.forEach(function(d) {
                d.date = new Date(d._id.year, d._id.month-1, d._id.day);
            });

            // Group the data by date
            var nestByDate = d3.nest()
                .key(function(d) { return d.date; })
                .entries(data.result);

            // This adds missing records.  I.e. records where the count is 0
            nestByDate.forEach(function(d) {
                var dateObj = new Date(d.key);
                var statusHolding = new Array();
                var i = 0;

                d.values.forEach(function(d) {
                    statusHolding[i] = d._id.buildResult;
                    i++;
                });

                if (statusHolding.length < 4) {
                    var difference = diff(categories, statusHolding);
                    
                    for (var k = 0; k < difference.length; k++) {
                        data.result.push({
                            "_id": {
                                "buildResult": difference[k]
                            },
                            "count": 0,
                            "date": dateObj
                        });
                    }
                }
            });
            




            // Nest/group by dimKey
            var nested = d3.nest()
                .key(dimKey)
                .sortKeys(function(a,b) { return categories.indexOf(a) - categories.indexOf(b)})
                .sortValues(function(a,b) { return ((a.date < b.date)
                    ? -1
                    : 1);
                    return 0;
                })
                .entries(data.result);


            // Create the layers
            var layers = stack(nested);

            // Set the x and y domains
            main_x.domain(d3.extent(data.result, function(d) { return xValue(d); }));
            main_y.domain([0, d3.max(data.result, function(d) { return d.y0 + d.y; })]);

            mini_x.domain(d3.extent(data.result, function(d) { return xValue(d); }));
            mini_y.domain([0, d3.max(data.result, function(d) { return d.y0 + d.y; })]);

            

            // Add the line paths
            main.selectAll(".layer")
                .data(layers)
              .enter().append("path")
                .attr("clip-path", "url(#clip)")
                .attr("class", "layer")
                .attr("d", function(d) { return main_area(d.values); })
                .style("fill", function(d, i) { return z(i); });

            mini.selectAll(".mini-layer")
                .data(layers)
              .enter().append("path")
                .attr("class", "mini-layer")
                .attr("d", function(d) { return mini_area(d.values); })
                .style("fill", function(d, i) { return z(i); });

            // Add the X and Y axis
            main.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + main_height + ")")
                .call(main_xAxis);

            mini.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + mini_height + ")")
                .call(mini_xAxis);

            main.append("g")
                .attr("class", "y axis")
                .attr("transform", "translate(0,0)")
                .call(main_yAxis)
              .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text(yLabel)
                .attr("class","y_label");

            mini.append("g")
                .attr("class", "x brush")
                .call(brush)
              .selectAll("rect")
                .attr("y", -10)
                .attr("height", mini_height + 15);

            // Add the legend
            var legend = main.selectAll(".legendLabel")
                .data(nested)
              .enter().append("g")
                .attr("class", "legendLabel")
                .attr("transform", function(d,i) { return "translate(0," + i * 20 + ")"; });

            legend.append("text")
                .attr("class", "legendLabel")
                .attr("x", function(d) { return main_width - legend_text_offset.width; })
                .attr("y", function(d,i) { return main_height - legend_text_offset.height + (i * legend_interval); })
                .text( function (d, i) { return d.key; })
                .attr("font-family", "sans-serif")
                .attr("font-size", "10px")
                .attr("fill", "black");

            legend.append("rect")
                .attr("height",10)
                .attr("width", 25)
                .attr("x",main_width - legend_rect_offset.width)
                .attr("y", function(d,i) { return main_height - legend_rect_offset.height + (i * legend_interval); })
                .attr("class", function(d) { return d.key; })
                .attr("stroke", function(d) { return z(d.key);})
                .attr("fill", function(d) { return z(d.key); });
            


            

        });
    }


    function diff(A, B) {
        return A.filter(function(a) {
            return B.indexOf(a) == -1;
        });
    }

    // Brush/select function
    function brushed() {
        main_x.domain(brush.empty() ? mini_x.domain() : brush.extent());
        main.selectAll(".layer").attr("d", function(d) { return main_area(d.values); })
        main.select(".x.axis").call(main_xAxis);
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