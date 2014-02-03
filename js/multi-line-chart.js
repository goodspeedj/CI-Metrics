function multiLineChart() {
    var main_margin = {top: 20, right: 80, bottom: 100, left: 40},
        mini_margin = {top: 460, right: 80, bottom: 20, left: 40},
        main_width = 1300 - main_margin.left - main_margin.right,
        main_height = 525 - main_margin.top - main_margin.bottom,
        mini_height = 525 - mini_margin.top - mini_margin.bottom;

    // Define line colors
    var color = d3.scale.category20();

    var xValue, yValue;

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

            data.result.forEach(function(d) {
                d.date = new Date(d._id.year, d._id.month-1, d._id.day);
            });

            // Create the axis domains
            //main_x.domain(d3.extent(data.result, function(d) { return d.date; }));
            //mini_x.domain(d3.extent(data.result, function(d) { return d.date; }))
            //main_y.domain([0, d3.max(data.result, function(d) { return (d.buildDuration / 1000) / 60 + 2; })]);  
            //mini_y.domain([0, d3.max(data.result, function(d) { return (d.buildDuration / 1000) / 60 + 2; })]); 
            main_x.domain(d3.extent(data.result, xValue));
            main_y.domain([0, d3.max(data.result, yValue)]);

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


    return chart;
}