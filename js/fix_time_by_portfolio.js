var ideal_time = 7200000;
var legend_offset = 195;

var main_margin = {top: 20, right: 80, bottom: 100, left: 40},
    mini_margin = {top: 460, right: 80, bottom: 20, left: 40},
    main_width = 1300 - main_margin.left - main_margin.right,
    main_height = 525 - main_margin.top - main_margin.bottom,
    mini_height = 525 - mini_margin.top - mini_margin.bottom,
    legend_text_offset = {height: 393, width: 195},
    legend_rect_offset = {height: 400, width: 235},
    legend_interval = 40;

// Define line colors
//var color = d3.scale.category10();
var color = d3.scale.ordinal()
    .range(["#5D5CD6","#FF7236","#5FD664","#D64041","#C53AD6"]);
  //.range(["#405774","#6787B0","#B1B17B","#CD6607","#F6A03D"]);
  //.range(["#48729C","#729DC8","#485712","#B3A72D","#86701D"]);
  //.range(["#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c"]);

// x0 is the time scale on the X axis
var main_x0 = d3.scale.ordinal().rangeRoundBands([0, main_width-275], 0.2); 
var mini_x0 = d3.scale.ordinal().rangeRoundBands([0, main_width-275], 0.2);

// x1 is the portfolio scale on the X axis
var main_x1 = d3.scale.ordinal();
var mini_x1 = d3.scale.ordinal();

// y is the fix time scal on the Y axis
var main_y  = d3.scale.linear().range([main_height, 0] );
var mini_y  = d3.scale.linear().range([mini_height, 0] );

// Date format for the X axis
var dateFormat = d3.time.format("%a %d");

// Define the X axis
var main_xAxis = d3.svg.axis()
    .scale(main_x0)
    .tickFormat(dateFormat)
    .orient("bottom");

var mini_xAxis = d3.svg.axis()
    .scale(mini_x0)
    .tickFormat(dateFormat)
    .orient("bottom");

// Define the Y axis
var main_yAxis = d3.svg.axis()
    .scale(main_y)
    .tickFormat(function(d) { return d3.round((d / 1000 / 60 / 60), 0); } )
    .orient("left");

// Define main svg element in #graph
var svg = d3.select("#graph").append("svg")
    .attr("width", main_width + main_margin.left + main_margin.right)
    .attr("height", main_height + main_margin.top + main_margin.bottom);

var main = svg.append("g")
    .attr("transform", "translate(" + main_margin.left + "," + main_margin.top + ")");

var mini = svg.append("g")
    .attr("transform", "translate(" + mini_margin.left + "," + mini_margin.top + ")");

var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

/*
 * Pull in the data
 */
d3.json('fix_time_by_port.json', function(error, data) {


  // This adds new elements to the data object
  data.result.forEach(function(d) {
    d.portfolio = d._id.portfolio;
    d.date = new Date(d._id.year, d._id.month-1, d._id.day);
  });



  // This is needed for the y0 and y1 values required for the stacked chart
  var nestByDate = d3.nest()
        .key(function(d) { return d.date; })
        .entries(data.result);


  nestByDate.forEach(function(d) {
      var y0 = 0;
      var y1 = 0;
      d.vis = 1;
      d.values.forEach(function(d) {
          d.y0 = y0 + y1;
          y1 = d.buildFixTime;
          d.y1 = y1;
          d.vis = 1;
      });
  });
  

  // define the axis domains
  main_x0.domain(data.result.map( function(d) { return d.date; } )
        .sort(d3.ascending));
  mini_x0.domain(data.result.map( function(d) { return d.date; } )
        .sort(d3.ascending));

  main_x1.domain(data.result.map( function(d) { return d.portfolio; } )
        .sort(d3.ascending))
        .rangeRoundBands([0, main_x0.rangeBand() ], 0);
  mini_x1.domain(data.result.map( function(d) { return d.portfolio; } )
        .sort(d3.ascending))
        .rangeRoundBands([0, main_x0.rangeBand() ], 0);

  main_y.domain([0, d3.max(data.result, function(d) { return d.buildFixTime; })]);
  mini_y.domain([0, d3.max(data.result, function(d) { return d.buildFixTime; })]);


  // Create brush for mini graph
  var brush = d3.svg.brush()
      .x(mini_x0)
      .on("brush", brushed);

  // flatten out the data
  var nested = d3.nest()
      .key(function(d) { return d._id.portfolio; })
      .entries(data.result);

  // Add the vis element to the nested data structure
  nested.forEach(function(d) {
      d.vis = 1;
  });

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
      .text("Build Fix Time (Hours)")
      .attr("class","y_label");

  // Add the mini x axis
  mini.append("g")
      .attr("class", "x axis mini_axis")
      .attr("transform", "translate(0," + mini_height + ")")
      .call(mini_xAxis);

  mini.append("g")
      .attr("class", "x brush")
      .call(brush)
    .selectAll("rect")
      .attr("y", -10)
      .attr("height", mini_height + 15);

  // Create the bars
  var bar = main.selectAll(".bars")
      .data(nested)
    .enter().append("g")
      .attr("class", function(d) { return d.key + "-group bar"; })
      .attr("fill", function(d) { return color(d.key); } )
      .on("mouseover", function(d) {
          var otherbars = $('rect').not('rect.' + d.key);
          d3.selectAll(otherbars).transition().duration(200).style("opacity", .4);

          tooltip.transition().duration(200)
              .style("opacity", .8);
          tooltip
              .html(d.key)
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY - 25) + "px");
      })
      .on("mouseout", function(d) {
          var otherbars = $('rect').not('rect.' + d.key);
          d3.selectAll(otherbars).transition().duration(200).style("opacity", 1);

          tooltip.transition().duration(500).style("opacity", 0);
 
      });

  bar.selectAll("rect")
      .data(function(d) { return d.values; })
    .enter().append("rect")
      .attr("class", function(d) { return d.portfolio; })
      .attr("transform", function(d) { return "translate(" + main_x0(d.date) + ",0)"; })
      .attr("width", function(d) { return main_x1.rangeBand(); })
      .attr("x", function(d) { return main_x1(d.portfolio); })
      .attr("y", function(d) { return main_y(d.buildFixTime); })
      .attr("height", function(d) { return main_height - main_y(d.buildFixTime); });

  // Create the bars
  var mini_bar = mini.selectAll(".mini_bars")
      .data(nested)
    .enter().append("g")
      .attr("class", function(d) { return d.key + "-group mini_bar"; })
      .attr("fill", function(d) { return color(d.key); } );

  mini_bar.selectAll("rect")
      .data(function(d) { return d.values; })
    .enter().append("rect")
      .attr("class", function(d) { return d.portfolio; })
      .attr("transform", function(d) { return "translate(" + mini_x0(d.date) + ",0)"; })
      .attr("width", function(d) { return mini_x1.rangeBand(); })
      .attr("x", function(d) { return mini_x1(d.portfolio); })
      .attr("y", function(d) { return mini_y(d.buildFixTime); })
      .attr("height", function(d) { return mini_height - mini_y(d.buildFixTime); });

  // Add the ideal fix time line
  var line = main.append("line")
      .attr("class", "ideal")
      .attr("x1", 0)
      .attr("y1", main_y(ideal_time))    
      .attr("x2", main_width-main_margin.right - legend_text_offset.width)
      .attr("y2", main_y(ideal_time))
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "10,10")
      .attr("stroke", "gray");

  main.append("text")
      .attr("x", 10)
      .attr("y", main_y(ideal_time) - 5)
      .attr("fill", "gray")
      .attr("font-size", "11px")
      .attr("font-family", "sans-serif")
      .text("Ideal fix time");

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
      .text( function (d) { return d.key; })
      .attr("font-family", "sans-serif")
      .attr("font-size", "10px")
      .attr("fill", "black");

  legend.append("rect")
      .attr("height",10)
      .attr("width", 25)
      .attr("x",main_width - legend_rect_offset.width)
      .attr("y", function(d,i) { return main_height - legend_rect_offset.height + (i * legend_interval); })
      .attr("class", function(d) { return d.key; })
      .attr("stroke", function(d) { return color(d.key);})
      .attr("fill", function(d) {
          if(d.vis=="1") {
              return color(d.key);
          }
          else {
              return "white";
          }
      })
      .on("mouseover", function(d) {
          // Make the line bold
          d3.select(this).transition().duration(200)
              .style("stroke-width", "4px");

          var otherbars = $('rect').not('rect.' + d.key);
          d3.selectAll(otherbars).transition().duration(200).style("opacity", .4);
      })
      .on("mouseout", function(d) {
          d3.select(this).transition().duration(100)
            .style("stroke-width", "2px");

          var otherbars = $('rect').not('rect.' + d.key);
          d3.selectAll(otherbars).transition().duration(200).style("opacity", 1);
      })
      .on("click", function(d) { 
          if(d.vis=="1") {
              d.vis="0";
              d.values.forEach(function(d) {
                d.vis="0";
              });
          }
          else{
              d.vis="1";
              d.values.forEach(function(d) {
                d.vis="1";
              });
          }

          // update the Y axis
          maxY=findMaxY(nested);
          minY=findMinY(nested);
          main_y.domain([0,maxY]);
          mini_y.domain([0,maxY]);

          main.select(".y.axis").transition().call(main_yAxis);

          // Update the ideal dashed line
          main.selectAll(".ideal").transition()
              .attr("y1", main_y(ideal_time))
              .attr("y2", main_y(ideal_time));

          
          // Show or hide the bars
          main.selectAll("." + d.key + "-group").transition()
              .attr("fill-opacity", function(d) {
                  if (d.vis=="1") {
                      return "1.0";
                  }
                  else {
                      return "0.0";
                  }
              });

          mini.selectAll("." + d.key + "-group").transition()
              .attr("fill-opacity", function(d) {
                  if (d.vis=="1") {
                      return "1.0";
                  }
                  else {
                      return "0.0";
                  }
              });
          

          // Change the transition calc based on the type of chart
          if ($('input[name=orientation]:checked').val() == 'grouped') {
              bar.selectAll("rect").transition()
                  .attr("y", function(d) { return main_y(d.buildFixTime); })
                  .attr("height", function(d) { return main_height - main_y(d.buildFixTime); });

              mini_bar.selectAll("rect").transition()
                  .attr("y", function(d) { return mini_y(d.buildFixTime); })
                  .attr("height", function(d) { return mini_height - mini_y(d.buildFixTime); });
          }
          else {

              // This is needed for the y0 and y1 values required for the stacked chart
              updateStack();

              bar.selectAll("rect").transition()
                  .attr("y", function(d) { return main_y(d.y1); })
                  .attr("height", function(d) { return main_y(d.y0) - main_y(d.y1); });

              mini_bar.selectAll("rect").transition()
                  .attr("y", function(d) { return mini_y(d.y1); })
                  .attr("height", function(d) { return mini_y(d.y0) - mini_y(d.y1); });
          }

          // Update the legend 
          legend.select("rect").transition()
              .attr("fill", function(d) {
                  if (d.vis=="1") {
                      return color(d.key);
                  }
                  else {
                      return "white";
                  }
              });
      });

      d3.selectAll(".offOn").on("change", toggle);      
      d3.selectAll(".orientation").on("change", orientation);      

      // Turn off and on all bars
      function toggle() {
          
          if (this.value === "enable") {
              nested.forEach(function(d) {
                  d.vis = 1;
              });
              main.selectAll(".bar").transition()
                .delay(function(d,i) { return i * 50; })
                .attr("fill", function(d) { return color(d.key); });

              mini.selectAll(".bar").transition()
                .delay(function(d,i) { return i * 50; })
                .attr("fill", function(d) { return color(d.key); });

              legend.selectAll("rect").transition()
                .attr("fill", function(d) { return color(d.key); });
          }
          else {
              nested.forEach(function(d) {
                  d.vis = 0;
              });
              main.selectAll(".bar").transition()
                .delay(function(d,i) { return i * 50; })
                .attr("fill", "white");

              mini.selectAll(".bar").transition()
                .delay(function(d,i) { return i * 50; })
                .attr("fill", "white");

              legend.selectAll("rect").transition()
                .attr("fill", "white");
          }
      }

      
      // Change the orientation of the graph
      function orientation() {
          if (this.value === "grouped") {
              transitionGrouped();
          }
          else {
              transitionStacked();
          }

      }


      // Switch to a grouped bar orientation
      function transitionGrouped() {
          bar.selectAll("rect").transition()
              .duration(300)
              .delay(function(d, i) { return i * 10; })
              .attr("transform", function(d) { return "translate(" + main_x0(d.date) + ",0)"; })
              .attr("width", function(d) { return main_x1.rangeBand(); })
              .attr("x", function(d) { return main_x1(d.portfolio); })
            .transition()
              .attr("y", function(d) { return main_y(d.buildFixTime); })
              .attr("height", function(d) { return main_height - main_y(d.buildFixTime); });    

          mini_bar.selectAll("rect").transition()
              .duration(300)
              .delay(function(d, i) { return i * 10; })
              .attr("transform", function(d) { return "translate(" + mini_x0(d.date) + ",0)"; })
              .attr("width", function(d) { return mini_x1.rangeBand(); })
              .attr("x", function(d) { return mini_x1(d.portfolio); })
            .transition()
              .attr("y", function(d) { return mini_y(d.buildFixTime); })
              .attr("height", function(d) { return mini_height - mini_y(d.buildFixTime); });  
      }

      // Switch to a stacked orientation
      function transitionStacked() {
          updateStack();
          bar.selectAll("rect").transition()
              .duration(300)
              .delay(function(d, i) { return i * 10; })
              .attr("transform", function(d) { return "translate(" + main_x1(d.date) + ",0)"; })
              .attr("width", function(d) { return main_x0.rangeBand(); })
              .attr("x", function(d) { return main_x0(d.date); })
            .transition()
              .attr("y", function(d) { return main_y(d.y1); })
              .attr("height", function(d) { return main_y(d.y0) - main_y(d.y1); });

          mini_bar.selectAll("rect").transition()
              .duration(300)
              .delay(function(d, i) { return i * 10; })
              .attr("transform", function(d) { return "translate(" + mini_x1(d.date) + ",0)"; })
              .attr("width", function(d) { return mini_x0.rangeBand(); })
              .attr("x", function(d) { return mini_x0(d.date); })
            .transition()
              .attr("y", function(d) { return mini_y(d.y1); })
              .attr("height", function(d) { return mini_y(d.y0) - mini_y(d.y1); });
      }

      // This function updates the y0 and y1 values after sections are enabled or disabled
      function updateStack() {
          nestByDate.forEach(function(d) {
              var y0 = 0;
              var y1 = 0;
              d.values.forEach(function(d) {
                  if (d.vis == 1) {
                      d.y0 = y0 + y1;
                      y1 = d.buildFixTime;
                      d.y1 = y1;
                  }
              });
          });    
      }

      
      function brushed() {
          main_x0.domain(brush.empty() ? mini_x0.domain() : brush.extent());
        
          //main.select("rect")
              //.attr("x", function(d) { return d.values; })
              //.attr("width", function(d) { return d.values; });
          bar.selectAll("rect")
              .attr("width", function(d) { return main_x1.rangeBand(); })
              .attr("x", function(d) { return main_x1(d.portfolio); });
              //.attr("y", function(d) { console.log(d); return main_y(d.buildFixTime); })
              //.attr("height", function(d) { return main_height - main_y(d.buildFixTime); });
          
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
                if (buildData[j].buildFixTime > max){
                    max=buildData[j].buildFixTime;
                }
            }
        }
    }
  return max;
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
                if (buildData[j].buildFixTime < min) {
                    min = buildData[j].buildFixTime;
                }
            }
        }
    }
  return min;
}
