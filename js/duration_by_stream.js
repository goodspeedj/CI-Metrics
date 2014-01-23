var main_margin = {top: 20, right: 80, bottom: 100, left: 40},
    mini_margin = {top: 460, right: 80, bottom: 20, left: 40},
    legend_margin = {top: 20, right: 80, bottom: 100, left: 40},
    main_width = 1300 - main_margin.left - main_margin.right,
    main_height = 525 - main_margin.top - main_margin.bottom,
    mini_height = 525 - mini_margin.top - mini_margin.bottom,
    legend_width = 300 - main_margin.left - main_margin.right;


d3.json('data.json', function(data) {

  data.result.forEach(function(d) {
      d.date = new Date(d._id.year, d._id.month-1, d._id.day);
  });


  // Define line colors
  var color = d3.scale.category20();


  // Setup X axis
  main_x = d3.time.scale()
      .domain(d3.extent(data.result, function(d) { return d.date; }))
      .range([0, main_width-275]);

  var mini_x = d3.time.scale()
      .domain(d3.extent(data.result, function(d) { return d.date; }))
      .range([0, main_width-275]);

  var main_xAxis = d3.svg.axis()
      .scale(main_x)
      .ticks(d3.time.day, 1)
      .orient("bottom");

  var mini_xAxis = d3.svg.axis()
      .scale(mini_x)
      .ticks(d3.time.day, 1)
      .orient("bottom");


  // Setup Y axis
  var main_y = d3.scale.linear()
      .domain(d3.extent(data.result, function(d) { return (d.buildDuration / 1000) / 60 + 2 ; }))
      .range([main_height + 10, 0]);

  var mini_y = d3.scale.linear()
      .domain(d3.extent(data.result, function(d) { return (d.buildDuration / 1000) / 60 + 2; }))
      .range([mini_height, 0]);

  var main_yAxis = d3.svg.axis()
      .scale(main_y)
      .orient("left");


  // Create brush for mini graph
  var brush = d3.svg.brush()
      .x(mini_x)
      .on("brush", brushed);


  // flatten out the data
  var nested = d3.nest().key(function(d) { return d._id.stream; })
      .entries(data.result);


  var main_line = d3.svg.line()
      .interpolate("cardinal")
      .x(function(d) { return main_x(d.date); })
      .y(function(d) { return main_y((d.buildDuration / 1000) / 60 ); });

  var mini_line = d3.svg.line()
      .interpolate("cardinal")
      .x(function(d) { return mini_x(d.date); })
      .y(function(d) { return mini_y((d.buildDuration / 1000) / 60 ); });


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
      .attr("transform", "translate(" + main_margin.left + "," + main_margin.top + ")");

  var mini = svg.append("g")
      .attr("transform", "translate(" + mini_margin.left + "," + mini_margin.top + ")");

  var legend = d3.select("#legend").append("svg")
      .attr("width", legend_width + main_margin.left + main_margin.right)
      .attr("height", legend_height + main_margin.top + main_margin.bottom)
    .append("g")
      .attr("transform", "translate(" + legend_margin.left + "," + legend_margin.top + ")");



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
      .text("Build Duration (Minutes)")
      .attr("class","y_label");

  // Add the mini X axis
  mini.append("g")
      .attr("class", "x axis mini_axis")
      .attr("transform", "translate(0," + mini_height + ")")
      .call(mini_xAxis);


  // Bind the data
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
      .attr("d", function(d) { 
          // Draw the lines or not depending on d.vis
          if (d.vis=="1") {
              return main_line(d.values); 
          }
          else {
              return null;
          }
      });

  mini_stream.append("path")
      .style("stroke", function(d) { return color(d.key); })
      .attr("d", function(d) {
          // Draw the lines or not depending on d.vis
          if (d.vis=="1") {
              return mini_line(d.values);
          }
          else {
              return null;
          }
      });


  mini.append("g")
      .attr("class", "x brush")
      .call(brush)
    .selectAll("rect")
      .attr("y", -10)
      .attr("height", mini_height + 15);


  // Add the text to the legend
  main_stream.append("text")
      .attr("class", "legendLabel")
      .attr("x", function(d) { return main_width-195; })
      .attr("y", function(d,i) { return main_height-393 + (i*40); })
      .text( function (d) { return d.key; })
      .attr("font-family", "sans-serif")
      .attr("font-size", "10px")
      .attr("fill", "black");

  legend.append("text")
      .attr("x", function(d) { return legend_width; })
      .attr("y", function(d,i) { return legend_height + (i*40); })
      .text( function (d) { return d.key; })
      .attr("font-family", "sans-serif")
      .attr("font-size", "10px")
      .attr("fill", "black");

  // Add the color rectangles to the legend
  main_stream.append("rect")
      .attr("height",10)
      .attr("width", 25)
      .attr("x",main_width-235)
      .attr("y", function(d,i) { return main_height-400 + (i*40); })
      .attr("stroke", function(d) { return color(d.key);})
      .attr("fill",function(d) {
          if(d.vis=="1") {
              return color(d.key);
          }
          else {
              return "white";
          }
      })
      .on("click", function(d) {
          if(d.vis=="1") {
              d.vis="0";
          }
          else{
              d.vis="1";
          }
          
          // update the Y axis
          maxY=findMaxY(nested);
          minY=findMinY(nested);
          main_y.domain([minY-0.2,maxY+0.2]);
          mini_y.domain([minY-0.2,maxY+0.2]);

          main.select(".y.axis").call(main_yAxis);

          // Update the lines
          main_stream.select("path").transition()
            .attr("d", function(d) { 
              if(d.vis=="1") { 
                  return main_line(d.values);
              } 
              else { 
                  return null;
              } 
            })

          mini_stream.select("path").transition()
            .attr("d", function(d) {
              if(d.vis=="1") {
                  return mini_line(d.values);
              }
              else {
                  return null;
              }
            })


          // Update the legend        
          main_stream.select("rect").transition()
            .attr("fill",function(d) {
              if (d.vis=="1") {
                  return color(d.key);
              }
              else {
                  return "white";
              }
            });
      });

/*
  var focus = main.append("g")
      .attr("class", "focus")
      .style("display", "none");

  focus.append("line")
      .attr("class", "x")
      .attr("y1", main_y(0) - 6)
      .attr("y2", main_y(0) + 6)

  focus.append("line")
      .attr("class", "y0")
      .attr("x1", main_width - 6) 
      .attr("x2", main_width + 6);

  focus.append("line")
      .attr("class", "y1")
      .attr("x1", main_width - 6)
      .attr("x2", main_width + 6);

  focus.append("circle")
      .attr("class", "y0")
      .attr("r", 4);

  focus.append("text")
      .attr("class", "y0")
      .attr("dy", "-1em");

  focus.append("circle")
      .attr("class", "y1")
      .attr("r", 4);

  focus.append("text")
      .attr("class", "y1")
      .attr("dy", "-1em");

  main.append("rect")
      .attr("class", "overlay")
      .attr("width", main_width-215)
      .attr("height", main_height)
      .on("mouseover", function() { focus.style("display", null); })
      .on("mouseout", function() { focus.style("display", "none"); })
      .on("mousemove", mousemove);   
*/

function brushed() {
    main_x.domain(brush.empty() ? mini_x.domain() : brush.extent());
    main_stream.select("path").attr("d", function(d) {
      return main_line(d.values)
    });
    main.select(".x.axis").call(main_xAxis);
}


});


/**
 * Get the max Y value (build duration)
 */
function findMaxY(data) {

    var max = -9999999;

    for(var i = 0; i < data.length; i++) {
        if (data[i].vis=="1") {
            var buildData = data[i].values;   

            for(var j = 0; j < buildData.length; j++) {
                if (buildData[j].buildDuration > max){
                    max=buildData[j].buildDuration;
                }
            }
        }
    }
  return (max / 1000) / 60 + 2;
}


/**
 * Get the min Y value (build duration)
 */
function findMinY(data) {

    var min = 9999999;

    for(var i=0; i < data.length; i++) {

        if (data[i].vis == "1"){

            var buildData = data[i].values;

            for(var j = 0; j < buildData.length; j++) {
                if (buildData[j].buildDuration < min) {
                    min = buildData[j].buildDuration;
                }
            }
        }
    }
  return (min / 1000) / 60;
}

function mousemove() {
    //focus.select("circle").attr("transform", "translate(" + main_x(d.values + "," + main_y));
}


