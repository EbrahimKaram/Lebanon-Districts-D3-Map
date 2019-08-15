var margin = {
        top: 10,
        left: 10,
        bottom: 10,
        right: 10
    },
    width = parseInt(d3.select('#mohafaza').style('width')),
    width = width - margin.left - margin.right,
    mapRatio = 0.6,
    height = width * mapRatio,
    mapRatioAdjuster = 15; // adjust map ratio here without changing map container size.
syria_center = [35.1026268, 33.9]; // Syria's geographical center

//Define map projection
var projection2 = d3.geo.mercator()
    .center(syria_center) // sets map center to Syria's center
    .translate([width / 2, height / 2])
    .scale(width * [mapRatio + mapRatioAdjuster]);

// adjust map size when browser window size changes
function resize() {
    width = parseInt(d3.select('#mohafaza').style('width'));
    width = width - margin.left - margin.right;
    height = width * mapRatio;

    // update projection
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
var zoom2 = d3.behavior.zoom()
    .translate([0, 0])
    .scale(1)
    .scaleExtent([1, 10]) // defines how far users can zoom in and out
    .on("zoom", zoomed);

// zoom function. allows users to zoom in and out of map
function zoomed() {
    features2.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

// when window size changes, resize the map
d3.select(window).on('resize', resize);

// create SVG element
var svg2 = d3.select("#mohafaza")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .call(zoom2); //Call zoom function on map

//Define path generator
var path2 = d3.geo.path()
    .projection(projection2);

//Group SVG elements together
var features2 = svg2.append("g");

//Load TopoJSON data
d3.json("Lebanon_Level1.json", function (error, leb1) {

    if (error) return console.error(error);

    var subunits2 = topojson.feature(leb1, leb1.objects.gadm36_LBN_1);

    // Bind data and create one path per TopoJSON feature
    features2.selectAll("path")
        .data(topojson.feature(leb1, leb1.objects.gadm36_LBN_1).features)
        .enter()
        .append("path")
        .attr("d", path2)

        // Sets colors of fill and stroke for each district. Sets stroke width, too.
        .attr("fill", "#e8d8c3")
        .attr("stroke", "#404040")
        .attr("stroke-width", .3)

        // Update tooltip and info boxes when user hovers over a district on map
        .on("mousemove", function (d) {

            //Update the tooltip position and value
            d3.select("#tooltip")
                .style("top", (d3.event.pageY) + 20 + "px")
                .style("left", (d3.event.pageX) + 20 + "px")

                // update governorate name
                .select('#governorate')
                .text(d.properties.NAME_1);
        d3.select("#tooltip")
       .select("#governorate-arabic")
       .text(d.properties.Arabic_NAME_1);    



            // Update province and district names in info box
            d3.select("#Mohafaza-name")
                .text(d.properties.NAME_1);
            d3.select("#Mohafaza-name-arabic")
                .text(d.properties.Arabic_NAME_1);


            // Show tooltip
            d3.select("#tooltip").classed("hidden", false);
            d3.select("#districtEntry").classed("hidden", true);
        })

        // Hide tooltip when user stops hovering over map
        .on("mouseout", function () {
            d3.select("#tooltip").classed("hidden", true);
            d3.select("#districtEntry").classed("hidden", false);
        });
});
