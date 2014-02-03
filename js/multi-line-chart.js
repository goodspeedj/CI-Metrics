function multiLineChart() {
    var main_margin = {top: 20, right: 80, bottom: 100, left: 40},
        mini_margin = {top: 460, right: 80, bottom: 20, left: 40},
        main_width = 1300 - main_margin.left - main_margin.right,
        main_height = 525 - main_margin.top - main_margin.bottom,
        mini_height = 525 - mini_margin.top - mini_margin.bottom;

    // Define line colors
    var color = d3.scale.category20();

    // These are the x and y dimensions supplied by the calling chart
    var xValue, yValue;

    // The label for the Y axis
    var yLabel = "Duration";

    // The dimension key
    var dimKey;

    // Setup X time scale
    var main_x = d3.time.scale()
        .range([0, main_width-275]);

    var mini_x = d3.time.scale()
        .range([0, main_width-275]);

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
        .tickFormat(function(d) { return d3.round((d / 1000 / 60 / 60), 0); } )
        .orient("left");

    // Define main svg element in #graph
    var svg = d3.select("#graph").append("svg")
        .attr("width", main_width + main_margin.left + main_margin.right)
        .attr("height", main_height + main_margin.top + main_margin.bottom);

    svg.append("defs").append("clipPath")
        .attr("id", "clip")
      .append("rect")
        .attr("width", main_width-275)
        .attr("height", main_height);

    var main = svg.append("g")
        .attr("transform", "translate(" + main_margin.left + "," + main_margin.top + ")")
        .attr("id", "main");

    var mini = svg.append("g")
        .attr("transform", "translate(" + mini_margin.left + "," + mini_margin.top + ")")
        .attr("id", "mini");

    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);



    function chart(selection) {
        selection.each(function(data) {

            // Add the date field to the data set
            data.result.forEach(function(d) {
                d.date = new Date(d._id.year, d._id.month-1, d._id.day);
            });

            // Create the axis domains
            main_x.domain(d3.extent(data.result, xValue));
            mini_x.domain(d3.extent(data.result, xValue));
            main_y.domain([0, d3.max(data.result, yValue)]);
            mini_y.domain([0, d3.max(data.result, yValue)]);

            //var brush = d3.svg.brush()
            //    .x(mini_x)
            //    .on("brush", brushed);

            // Flatten out the data
            var nested = d3.nest().key(dimKey)
                .entries(data.result);

            // Add the X axis
            main.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + main_height + ")")
                .call(main_xAxis);

            // Add the Y axis
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

            // Add the Mini X axis
            mini.append("g")
                .attr("class", "x axis mini_axis")
                .attr("transform", "translate(0," + mini_height + ")")
                .call(mini_xAxis);

            // Create the main line elements
            var main_line = d3.svg.line()
                .interpolate("cardinal")
                //.x(main_x(xValue))
                //.y(main_y(yValue));
                .x(function(d) { return main_x(d.date); })
                .y(function(d) {
                    return main_y(yLiteral); 
                });

            // Create the mini line elements
            var mini_line = d3.svg.line()
                .interpolate("cardinal")
                //.x(function(d) { return mini_x(xValue); })
                .x(mini_x(xValue))
                //.y(function(d) { return mini_y(yValue); });
                .y(mini_y(yValue));

            var main_stream = main.selectAll(".main_stream")
                .data(nested)
              .enter().append("g")
                .attr("class", function(d) {
                    d.vis = "1";
                    return "main_stream";
                });

            var mini_stream = mini.selectAll(".mini_stream")
                .data(nested)
              .enter().append("g")
                .attr("class", function(d) {
                    d.vis = "1";
                    return "mini_stream";
                });

            // Draw the lines
            main_stream.append("path")
                .style("stroke", function(d) { return color(d.key); })
                .attr("clip-path", "url(#clip)")
                .attr("class", function(d) { return d.key + " lines"; })
                .attr("d", function(d) {
                    if (d.vis == 1) {
                        console.log(d.values);
                        return main_line(d.values);
                    }
                    else {
                        return null;
                    }
                })
                .on("mouseover", function(d) {

                    // Make the line bold
                    d3.select(this).transition().duration(200)
                        .style("stroke-width", "4px");

                    // Fade out the other lines
                    var otherlines = $('path').not(this);
                    d3.selectAll(otherlines).transition().duration(200).style("opacity", .4);

                    // Show tooltip
                    tooltip.transition().duration(200)
                        .style("opacity", .8);
                    tooltip
                        .html(d.key)
                          .style("left", (d3.event.pageX + 10) + "px")
                          .style("top", (d3.event.pageY - 25) + "px");
                })
                .on("mouseout", function(d) {

                    // Make the line normal again
                    d3.select(this).transition().duration(100)
                        .style("stroke-width", "2px");

                    // Make the other lines normal again
                    var otherlines = $('path').not(this);
                    d3.selectAll(otherlines).transition().duration(100)
                        .style("opacity", 1);   

                    // Hide the tooltip
                    tooltip.transition().duration(500).style("opacity", 0);
                });
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

    chart.xLiteral = function(value) {
        if (!arguments.length) return xLiteral;
        xLiteral = value;
        return chart;
    }

    chart.yLiteral = function(value) {
        if (!arguments.length) return yLiteral;
        yLiteral = value;
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


    return chart;
}
