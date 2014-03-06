function stackedAreaChart() {

    // parsed date
    var parseDate = d3.time.format("%Y-%m-%d");

    // The label for the Y axis
    var yLabel = "Duration";

    // These are the x and y dimensions supplied by the calling chart
    var xValue, yValue;

    // The stack area categories supplied by the calling chart
    var categories;

    // The colors of the stack area supplied by the calling chart
    var stackColors;

    // The Y Scale axis
    var yScale;

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
      .ticks(10)
      .orient("bottom");

    // Setup Y axis
    if (chartName === "unitTest") {
        var main_y = d3.scale.sqrt()
            .range([main_height, 0]);

        var mini_y = d3.scale.sqrt()
            .range([mini_height, 0]);
    }
    else {
        var main_y = d3.scale.linear()
            .range([main_height, 0]);

        var mini_y = d3.scale.linear()
            .range([mini_height, 0]);   
    }

    var main_yAxis = d3.svg.axis()
        .scale(main_y)
        .tickFormat(function(d) { return yTickFormat(d) })
        .ticks(5)
        .orient("left");

    // Create the brush for the mini chart
    var brush = d3.svg.brush()
        .x(mini_x)
        .on("brush", brushed);


    // Z scale is the different categories (i.e.: build success, fail, unstable)
    var z = d3.scale.ordinal();

    // Create the area stack
    var stack = d3.layout.stack()
              .offset("zero")
              .values(function(d) { return d.values; })
              .x(function(d) { return xValue(d); })
              .y(function(d) { return yValue(d); });

    // Define the area
    var main_area = d3.svg.area()
              .interpolate("cardinal")
              .x(function(d) { return main_x(xValue(d)); })
              .y0(function(d) { return main_y(d.y0); })
              .y1(function(d) { return main_y(d.y0 + d.y); });

    var mini_area = d3.svg.area()
              .interpolate("cardinal")
              .x(function(d) { return mini_x(xValue(d)); })
              .y0(function(d) { return mini_y(d.y0); })
              .y1(function(d) { return mini_y(d.y0 + d.y); });


    function chart(selection) {
        selection.each(function(data) {

            // Loop through the data and add elements
            data.result.forEach(function(d) {
                d.date = new Date(d._id.year, d._id.month-1, d._id.day);
            });


            // Get the data into the right format - categories are passed in from calling chart
            var dataSeries = categories.map(function(type) {
                var dataObj = {};
                dataObj.key = type;
                dataObj.vis = "1";

                dataObj.values = data.result.map(function(d) {
                    return { date: d.date, total: d[type] };  
                });

                return dataObj;
            });

            // Create the layers
            var layers = stack(dataSeries);

            // Set the x and y domains
            main_x.domain(d3.extent(data.result, function(d) { return xValue(d); }));
            main_y.domain([0, d3.max(data.result, function(d) { 
                var total = 0;
                categories.forEach(function(type) {
                    total = total + d[type];
                })
                return total; 
            })]);

            mini_x.domain(d3.extent(data.result, function(d) { return xValue(d); }));
            mini_y.domain([0, d3.max(data.result, function(d) { 
                var total = 0;
                categories.forEach(function(type) {
                    total = total + d[type];
                })
                return total; 
            })]);

            z.domain(categories).range(stackColors);

            // Add the line paths
            var main_layer = main.selectAll(".layer")
                .data(layers)
              .enter().append("g");

            main_layer.append("path")
                .attr("clip-path", "url(#clip)")
                .attr("class", "layer")
                .attr("d", function(d) { 
                    if(d.vis === "1") {
                        return main_area(d.values);
                    }
                    else {
                        return null;
                    }
                })
                .style("fill", function(d, i) { return z(i); });
                    

            var mini_layer = mini.selectAll(".mini-layer")
                .data(layers)
              .enter().append("g");


            mini_layer.append("path")
                .attr("class", "mini-layer")
                .attr("d", function(d) { 
                    if(d.vis === "1") {
                        return mini_area(d.values);
                    }
                    else {
                        return null;
                    }
                })
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
                .data(dataSeries)
              .enter().append("g")
                .attr("class", "legendLabel")
                .attr("transform", function(d,i) { return "translate(0," + i * 20 + ")"; });

            legend.append("text")
                .attr("class", "legendLabel")
                .attr("x", function(d) { return main_width - legend_text_offset.width; })
                .attr("y", function(d,i) { return main_height - legend_text_offset.height + (i * legend_interval); })
                .text( function (d, i) { return d.key; })
                //.attr("font-family", "sans-serif")
                .attr("font-size", "11px")
                .attr("fill", "black");

            legend.append("rect")
                .attr("height",10)
                .attr("width", 25)
                .attr("x",main_width - legend_rect_offset.width)
                .attr("y", function(d,i) { return main_height - legend_rect_offset.height + (i * legend_interval); })
                .attr("class", function(d) { return d.key; })
                .attr("stroke", function(d) { return z(d.key);})
                .attr("fill", function(d) { 
                    if(d.vis === "1") {
                        return z(d.key); 
                    }
                    else {
                        return "white";
                    }
                    
                })
                .on("click", function(d) {

                    if(d.vis === "1") {
                        d.vis = "0";
                    }
                    else {
                        d.vis = "1";
                    }

                    maxY = getMaxY();
                    main_y.domain([0,maxY]);
                    mini_y.domain([0,maxY]);

                    main.select(".y.axis")
                        .transition()
                          .duration(800)
                        .call(main_yAxis);

                    main_layer.select(".layer")
                        .transition()
                          .duration(500)
                        .attr("d", function(d) { 
                            if(d.vis === "1") {
                                return main_area(d.values);
                            }
                            else {
                                return null;
                            }
                        });

                    mini_layer.select(".mini-layer")
                        .transition()
                          .duration(500)
                        .attr("d", function(d) { 
                            if(d.vis === "1") {
                                return mini_area(d.values);
                            }
                            else {
                                return null;
                            }
                        });

                    legend.select("rect")
                        .transition()
                          .duration(500)
                        .attr("fill",function(d) {
                            if (d.vis=="1") {
                                return z(d.key);
                            }
                            else {
                                return "white";
                            }
                        });
                }); 


            // Get the max Y value
            function getMaxY() {
                var maxY = -1;
                
                dataSeries.forEach(function(d) {
                    if (d.vis === "1") {
                        d.values.forEach(function(d) {
                            if (yValue(d) > maxY){
                                maxY = yValue(d);
                            }
                        });
                    }
                });

                return maxY;
            }        

        });
    }


    // Brush/select function
    function brushed() {
        main_x.domain(brush.empty() ? mini_x.domain() : brush.extent());
        main.selectAll(".layer").attr("d", function(d) { 
            if (d.vis === "1") {
                return main_area(d.values);
            }
            else {
                return null;
            }           
        });

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
  
    // Y axis tick format
    chart.yTickFormat = function(value) {
        if (!arguments.length) return yTickFormat;
        yTickFormat = value;
        return chart;
    }


    // Stack area categories
    chart.categories = function(value) {
        if (!arguments.length) return categories;
        categories = value;
        return chart;
    }

    // Stack area colors
    chart.stackColors = function(value) {
        if (!arguments.length) return stackColors;
        stackColors = value;
        return chart;
    }

    // Y axis scale
    chart.yScale = function(value) {
        if (!arguments.length) return yScale;
        yScale = value;
        return chart;
    }

    return chart;
}