var margin = {top: 20, right: 80, bottom: 30, left: 50},
    width = 1300 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;



d3.json('data.json', function(data) {

  data.result.forEach(function(d) {
      d.date = new Date(d._id.year, d._id.month-1, d._id.day);
  });


  // Define line colors
  var color = d3.scale.category10();


  // Setup X axis
  var x = d3.time.scale()
      .domain(d3.extent(data.result, function(d) { return d.date; }))
      .range([0, width-275]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .ticks(d3.time.day, 1)
      .orient("bottom");


  // Setup Y axis
  var y = d3.scale.linear()
      .domain(d3.extent(data.result, function(d) { return (d.buildDuration / 1000) / 60 ; }))
      .range([height, 0]);

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left");


  // flatten out the data
  var nested = d3.nest().key(function(d) { return d._id.stream; })
      .entries(data.result);


  var line = d3.svg.line()
      //.interpolate("basis")
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y((d.buildDuration / 1000) / 60 ); });


  // Define main svg element in #graph
  var svg = d3.select("#graph").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

  var main = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


  // Add the X axis
  main.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  // Add the Y axis
  main.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(0,0)")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Build Duration (Minutes)")
      .attr("class","tick-font");


  // Bind the data
  var stream = main.selectAll(".stream")
      .data(nested)
      .enter().append("g")
      .attr("class", function(d) {
          d.vis = "1";
          return "stream";
      });



  // Draw the lines
  stream.append("path")
      .style("stroke", function(d) { return color(d.key); })
      .attr("d", function(d) { 
          // Draw the lines or not depending on d.vis
          if (d.vis=="1") {
              return line(d.values); 
          }
          else {
              return null;
          }
      });


  // Add the text to the legend
  stream.append("text")
      .attr("class", "legendLabel")
      .attr("x", function(d) { return width-175; })
      .attr("y", function(d,i) { return height-393 + (i*40); })
      .text( function (d) { return d.key; })
      .attr("font-family", "sans-serif")
      .attr("font-size", "10px")
      .attr("fill", "black");


  // Add the color rectangles to the legend
  stream.append("rect")
      .attr("height",10)
      .attr("width", 25)
      .attr("x",width-215)
      .attr("y", function(d,i) { return height-400 + (i*40); })
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
          y.domain([minY-0.2,maxY+0.2]);

          main.select(".y.axis").call(yAxis);

          // Update the lines
          stream.select("path").transition()
            .attr("d", function(d) { 
              if(d.vis=="1") { 
                  return line(d.values);
              } 
              else { 
                  return null;
              } 
            })

          // Update the legend        
          stream.select("rect").transition()
            .attr("fill",function(d) {
              if (d.vis=="1") {
                  return color(d.key);
              }
              else {
                  return "white";
              }
            });
      });

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
  return (max / 1000) / 60;
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
