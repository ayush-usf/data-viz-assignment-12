// ref d3 v4 : https://www.d3-graph-gallery.com/graph/parallel_custom.html
// Converted manually to d3v6

let  margin = {top: 120, right: 150, bottom: 10, left: 150},
    width = 760 - margin.left - margin.right,
    height = 550 - margin.top - margin.bottom;

// append the svg object to the body of the page
let  svg = d3.select("#chart-area")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);
let g = svg.append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// Parse the Data
d3.csv("cars.csv")
    .then(data =>{

    let reqdColumns = ['Dimensions.Height',  'Dimensions.Length',  'Dimensions.Width',  'Engine Information.Engine Statistics.Torque','Category']
    let reqdCategory = ["Audi", "BMW", "Cadillac"]

    let newData = {}
    let idx = 0;

    data.forEach((val,mainKey)=> {
        if (reqdCategory.includes(val["Identification.Make"])) {
            newData[idx] = {
                "Dimensions.Height": +val['Dimensions.Height'],
                "Dimensions.Length": +val['Dimensions.Length'],
                "Dimensions.Width": +val['Dimensions.Width'],
                "Engine Information.Engine Statistics.Torque": +val['Engine Information.Engine Statistics.Torque'],
                "Category": val['Identification.Make']
            }
            idx++;
        }
    })
    newData.columns = reqdColumns;
    newData.length = idx;

    // Color scale: give me a specie name, returning a color
    let  color = d3.scaleOrdinal()
        .domain(['Dimensions.Height',  'Dimensions.Length',  'Dimensions.Width',  'Engine Information.Engine Statistics.Torque' ])
        .range([ "#440154ff", "#0e0e0e", "#223cbd", "#700a16"])

    // Setting the list of dimension manually to control the order of axis:
    dimensions = ['Dimensions.Height',  'Dimensions.Length',  'Dimensions.Width',  'Engine Information.Engine Statistics.Torque']

    // For each dimension, building a linear scale, storing all in a y object
    let  y = {}
    for (i in dimensions) {
        name = dimensions[i]
        y[name] = d3.scaleLinear()
            .domain( [0,600] ) // --> Same axis range for each group
            .range([height, 0])
    }

    // Build the X scale -> it find the best position for each Y axis
    x = d3.scalePoint()
        .range([0, width])
        .domain(dimensions);

    // Highlight the Food item that is hovered
    let  highlight = function(d, e){

        selected_category = d.Category
        if(!selected_category){
            selected_category = e.Category
        }
        // first every group turns grey
        d3.selectAll(".line")
            .transition().duration(200)
            .style("stroke", "lightgrey")
            .style("opacity", "0.2")

        // Second the hovered food item takes its color
        // d3.selectAll("." + d.target.className.baseVal.split(" ")[1])
        d3.selectAll("." + selected_category)
            .transition().duration(200)
            .style("stroke", color(selected_category))
            .style("opacity", "1")
    }

    // Unhighlight
    let  doNotHighlight = function(d, e){

        d3.selectAll(".line")
            .transition().duration(200).delay(1000)
            .style("stroke", function(d){ return( color(d.Category))} )
            .style("opacity", "1")
    }

    // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
    function path(d) {
        return d3.line()(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
    }

    // Draw the lines
    g.selectAll("myPath")
        .data(newData)
        .enter()
        .append("path")
        .attr("class", function (d) { return "line " + d.Category } ) // 2 class for each line: 'line' and the group name
        .attr("d",  path)
        .style("fill", "none" )
        .style("stroke", function(d){ return( color(d.Category))} )
        .style("opacity", 0.5)
        .on("mouseover", highlight)
        .on("mouseleave", doNotHighlight )

    // Draw the axis:
    g.selectAll("myAxis")
        // For each dimension of the dataset, added a 'g' element:
        .data(dimensions).enter()
        .append("g")
        .attr("class", "axis")
        // Translate this element to its right position on the x axis
        .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
        // Building the axis with the call function
        .each(function(d) { d3.select(this).call(d3.axisLeft().ticks(5).scale(y[d])); })
        // Add axis title
        .append("text")
        .style("text-anchor", "middle")
        .attr("y", -9)
        .text(function(d) { return d; })
        .style("fill", "black")

    g.selectAll("mydots")
        .data(reqdCategory)
        .enter()
        .append("circle")
        .attr("cx", width + 40)
        .attr("cy", function(d,i){ return 100 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("r", 7)
        .style("fill", function(d){ return color(d)})

    // Add one dot in the legend for each name.
    g.selectAll("mylabels")
        .data(reqdCategory)
        .enter()
        .append("text")
        .attr("x", width +60)
        .attr("y", function(d,i){ return 100 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", "black")
        .text(function(d){ return d.charAt(0) + d.slice(1).toLowerCase()})
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")

    // Adding chart label
    g.append("text")
        .attr("class", "chart-label")
        .attr("x",  0)
        .attr("y", -70)
        .text("Supermacy of Cadillac over competitiors (High Torquest torque due to Lowest vehicle length)")
})
