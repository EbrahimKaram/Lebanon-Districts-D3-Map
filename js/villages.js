var margin = {top: 10, left: 10, bottom: 10, right: 10},
    width = parseInt(d3.select('#villages').style('width')),
    width = width - margin.left - margin.right,
    mapRatio = 0.6,
    height = width * mapRatio,
    mapRatioAdjuster = 15; // adjust map ratio here without changing map container size.
    syria_center =  [35.1026268, 33.9]; // Syria's geographical center

//Define map projection
var projection1 = d3.geo.mercator()
                   .center(syria_center) // sets map center to Syria's center
                   .translate([width/2, height/2])
                   .scale(width * [mapRatio + mapRatioAdjuster]);

// adjust map size when browser window size changes
function resize() {
    width = parseInt(d3.select('#villages').style('width'));
    width = width - margin.left - margin.right;
    height = width * mapRatio;

    // update projection
    projection1.translate([width / 2, height / 2])
              .center(syria_center)
              .scale(width * [mapRatio + mapRatioAdjuster]);

    // resize map container
    svg1.style('width', width + 'px')
       .style('height', height + 'px');

    // resize map
    svg1.selectAll("path").attr('d', path1);
    
    //For the second map
    projection.translate([width / 2, height / 2])
              .center(syria_center)
              .scale(width * [mapRatio + mapRatioAdjuster]);

    // resize map container
    svg.style('width', width + 'px')
       .style('height', height + 'px');

    // resize map
    svg.selectAll("path").attr('d', path);
    
    /////For the first map [mohafaza]
     projection2.translate([width / 2, height / 2])
              .center(syria_center)
              .scale(width * [mapRatio + mapRatioAdjuster]);

    // resize map container
    svg2.style('width', width + 'px')
       .style('height', height + 'px');

    // resize map
    svg2.selectAll("path").attr('d', path);
}

// adds zoom function to map
var zoom1 = d3.behavior.zoom()
                      .translate([0, 0])
                      .scale(1)
                      .scaleExtent([1, 25]) // defines how far users can zoom in and out
                      .on("zoom", zoomed);

// zoom function. allows users to zoom in and out of map
function zoomed() {
  features1.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

// when window size changes, resize the map
d3.select(window).on('resize', resize);

// create SVG element
var svg1 = d3.select("#villages")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .call(zoom1); //Call zoom function on map

//Define path generator
var path1 = d3.geo.path()
             .projection(projection1);

//Group SVG elements together
var features1 = svg1.append("g");


//Load TopoJSON data
d3.json("Lebanon_Level3.json", function(error, leb) {

  if (error) return console.error(error);

  var subunits1 = topojson.feature(leb, leb.objects.gadm36_LBN_3);

    // Bind data and create one path per TopoJSON feature
    features1.selectAll("path")
    .data(topojson.feature(leb, leb.objects.gadm36_LBN_3).features)
    .enter()
    .append("path")
    //Added An ID for each in order to search for them later
    .attr("mohafaza",function(d) {return d.properties.NAME_1.replace(/\s/g, '');})
    .attr("district", function(d) {return d.properties.NAME_2.replace(/\s/g, '');})
    .attr("village",function(d) {return d.properties.NAME_3.replace(/\s/g, '');})
    .attr("d", path)

    // Sets colors of fill and stroke for each district. Sets stroke width, too.
    .attr("fill", "#e8d8c3")
    .attr("stroke", "#404040")
    .attr("stroke-width", .3)

    // Update tooltip and info boxes when user hovers over a district on map
    .on("mousemove", function(d) {
        
        var district=d.properties.NAME_2.replace(/\s/g, '');
        
        d3.selectAll("path[district="+district+"]").attr("fill","#ffffff")
       
        //Update the tooltip position and value
       d3.select("#tooltip")
       .style("top", (d3.event.pageY) + 20 + "px")
       .style("left", (d3.event.pageX) + 20 + "px")

       // update governorate name
       .select('#governorate')
       .text(d.properties.NAME_1);

       // update district name
       d3.select("#tooltip")
       .select("#district")
       .text(d.properties.NAME_2);
        
        d3.select("#tooltip")
        .select("#village")
        .text(d.properties.NAME_3);

       // Update province and district names in info box
       d3.select('#governorate-name-1')
       .text(d.properties.NAME_1);

       d3.select('#district-name-1')
       .text(d.properties.NAME_2);
        
        d3.select('#village-name-1').
        text(d.properties.NAME_3);

       // Show tooltip
       d3.select("#tooltip").classed("hidden", false);
        d3.select("#tooltip").select("#villageEntry").classed("hidden", false);
        d3.select("#tooltip").select("#districtEntry").classed("hidden",false);
       })

       // Hide tooltip when user stops hovering over map
       .on("mouseout", function() {
        d3.selectAll("path").attr("fill","#e8d8c3");
       d3.select("#tooltip").classed("hidden", true);
        d3.select("#tooltip").select("#villageEntry").classed("hidden", true);
        d3.select("#tooltip").select("#districtEntry").classed("hidden",false);
       });
});
