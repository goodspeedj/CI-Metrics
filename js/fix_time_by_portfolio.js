var main_margin = {top: 20, right: 80, bottom: 100, left: 100},
    mini_margin = {top: 460, right: 80, bottom: 20, left: 40},
    main_width = 1300 - main_margin.left - main_margin.right,
    main_height = 525 - main_margin.top - main_margin.bottom,
    mini_height = 525 - mini_margin.top - mini_margin.bottom;

// Define line colors
var color = d3.scale.category10();


// x0 is the time scale on the X axis
var main_x0 = d3.scale.ordinal().rangeRoundBands([0, main_width-275], 0.2); 

// x1 is the portfolio scale on the X axis
var main_x1 = d3.scale.ordinal();

// y is the fix time scal on the Y axis
//var main_y  = d3.scale.linear().range([main_height, 0] );
var main_y  = d3.scale.linear().range([main_height, 0] );


var dateFormat = d3.time.format("%Y-%m-%d");
var formatTime = d3.time.format("%X");
var formatMillis = function(d) { return formatTime(new Date(2012, 0, 1, 0, 0, 0, d)); };
var y_format = d3.format("1");

// Define the X axis
var main_xAxis = d3.svg.axis()
    .scale(main_x0)
    .tickFormat(dateFormat)
    .orient("bottom");

// Define the Y axis
var main_yAxis = d3.svg.axis()
    .scale(main_y)
    .tickFormat(function(d) { return d3.round((d / 1000 / 60), 0); } )
    .orient("left");

// Define main svg element in #graph
var svg = d3.select("#graph").append("svg")
    .attr("width", main_width + main_margin.left + main_margin.right)
    .attr("height", main_height + main_margin.top + main_margin.bottom);

var main = svg.append("g")
    .attr("transform", "translate(" + main_margin.left + "," + main_margin.top + ")");


/*
 * Pull in the data
 */
d3.json('fix_time_by_port.json', function(error, data) {


  // This adds new elements to the data object
  data.result.forEach(function(d) {
    d.portfolio = d._id.portfolio;
    d.date = new Date(d._id.year, d._id.month-1, d._id.day);
    //d.vis = 1;
  });

  // define the axis domains
  main_x0.domain(data.result.map( function(d) { return d.date; } )
                          .sort(d3.ascending));

  main_x1.domain(data.result.map( function(d) { return d.portfolio; } )
                          .sort(d3.ascending))
       .rangeRoundBands([0, main_x0.rangeBand() ], 0);

  main_y.domain([0, d3.max(data.result, function(d) { return d.buildFixTime; })]);


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
      .text("Build Fix Time (Minutes)")
      .attr("class","y_label");

  var bar = main.selectAll(".bars")
      .data(nested)
    .enter().append("g")
      .attr("class", function(d) { return d.key + "-group"; })
      .attr("fill", function(d) { return color(d.key); } );

  bar.selectAll("rect").append("rect")
      .data(function(d) { return d.values; })
    .enter().append("rect")
      .attr("class", function(d) { return d.portfolio; })
      .attr("transform", function(d) { return "translate(" + main_x0(d.date) + ",0)"; })
      .attr("width", function(d) { return main_x1.rangeBand(); })
      .attr("x", function(d) { return main_x1(d.portfolio); })
      .attr("y", function(d) { return main_y(d.buildFixTime); })
      .attr("height", function(d) { return main_height - main_y(d.buildFixTime); });

  var legend = main.selectAll(".legendLabel")
      .data(nested)
    .enter().append("g")
      .attr("class", "legendLabel")
      .attr("transform", function(d,i) { return "translate(0," + i * 20 + ")"; });

  legend.append("text")
      .attr("class", "legendLabel")
      .attr("x", function(d) { return main_width-195; })
      .attr("y", function(d,i) { return main_height-393 + (i*40); })
      .text( function (d) { return d.key; })
      .attr("font-family", "sans-serif")
      .attr("font-size", "10px")
      .attr("fill", "black");

  legend.append("rect")
      .attr("height",10)
      .attr("width", 25)
      .attr("x",main_width-235)
      .attr("y", function(d,i) { return main_height-400 + (i*40); })
      .attr("stroke", function(d) { return color(d.key);})
      .attr("fill", function(d) {
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

          main.select(".y.axis").transition().call(main_yAxis);

          main.selectAll("." + d.key + "-group").transition()
              .attr("fill", function(d) {
                  if (d.vis=="1") {
                      return color(d.key);
                  }
                  else {
                      return "white";
                  }
              });

 
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
