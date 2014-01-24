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
    .scale(main_x)
    .ticks(d3.time.day, 1)
    .orient("bottom");

// Setup the portfolio scale
var main_x1 = d3.ordinal.scale();

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
d3.json('fix_time_by_portfolio.json', function(data) {

  console.log(data);

  data.result.forEach(function(d) {
    //d.portfolios = d.port
    d.date = new Date(d._id.year, d._id.month-1, d._id.day);
  });

  // define the axis domains
  main_x0.domain(d3.extent(data.result, function(d) { return d.date; }));
  main_x1.domain(data.map(function(d) { return d.portfolio; } ));
  main_y.domain(d3.extent(data.result, function(d) { return (d.buildFixTime / 1000) / 60 + 2 ; }));

  // flatten out the data
  var nested = d3.nest().key(function(d) { return d._id.portfolio; })
      .entries(data.result);

  // Define the bars???


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

});