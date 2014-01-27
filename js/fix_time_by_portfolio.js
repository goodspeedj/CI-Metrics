var main_margin = {top: 20, right: 80, bottom: 100, left: 40},
    mini_margin = {top: 460, right: 80, bottom: 20, left: 40},
    main_width = 1300 - main_margin.left - main_margin.right,
    main_height = 525 - main_margin.top - main_margin.bottom,
    mini_height = 525 - mini_margin.top - mini_margin.bottom;

// Define line colors
var color = d3.scale.category20();

// Setup X time scale and axis
var main_x0 = d3.time.scale()
    .range([0, main_width-275]);

var main_xAxis = d3.svg.axis()
    .scale(main_x0)
    .ticks(d3.time.day, 1)
    .orient("bottom");

// Setup the portfolio scale
var main_x1 = d3.scale.ordinal();

// Setup Y scale and axis
var main_y = d3.scale.linear()
    .range([main_height + 10, 0]);

var main_yAxis = d3.svg.axis()
    .scale(main_y)
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

  console.log(data);

  // This adds new elements to the data object
  data.result.forEach(function(d) {
    d.portfolio = d._id.portfolio;
    d.date = new Date(d._id.year, d._id.month-1, d._id.day);
  });

  // define the axis domains
  main_x0.domain(d3.extent(data.result, function(d) { return d.date; }));
  //main_x1.domain(d3.extent(data.result, function(d) { console.log(d.portfolio); return d.portfolio; } ));
  main_x1.domain(["eSales","eService","LMcom","Shared","Analytics"]);
  main_y.domain(d3.extent(data.result, function(d) { return (d.buildFixTime / 1000) / 60 / 60 + 2 ; }));

  // flatten out the data
  var nested = d3.nest()
      .key(function(d) { return d._id.portfolio; })
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
      .text("Build Fix Time (Hours)")
      .attr("class","y_label");

  var bar = main.selectAll(".bars")
      .data(nested)
    .enter().append("g")
      .attr("class", "g");
      //.attr("transform", function(d) { console.log(d); return "translate(" + main_x0(d.values) + ",0)"; });

  bar.selectAll("rect").append("rect")
      .data(function(d) { return d.values; })
    .enter().append("rect")
      .attr("transform", function(d) { console.log(d.date); return "translate(" + main_x0(d.date) + ",0)"; })
      //.attr("width", main_x1.rangeBand())
      .attr("width", function(d) { console.log(main_x1.range()); return 50; })
      .attr("x", function(d) { return main_x1(d.date); })
      .attr("y", function(d) { return main_y(d.buildFixTime); })
      .attr("height", function(d) { return main_height - main_y(d.buildFixTime); })
      .style("fill", function(d) { return color(d.key); });
  
});
