var margin = {
        top: 10,
        left: 10,
        bottom: 10,
        right: 10
    },
    width = parseInt(d3.select('#districts').style('width')),
    width = width - margin.left - margin.right,
    mapRatio = 0.6,
    height = width * mapRatio,
    mapRatioAdjuster = 15; // adjust map ratio here without changing map container size.
syria_center = [35.1026268, 33.9]; // Syria's geographical center

//Define map projection
var projection = d3.geo.mercator()
    .center(syria_center) // sets map center to Syria's center
    .translate([width / 2, height / 2])
    .scale(width * [mapRatio + mapRatioAdjuster]);

// adjust map size when browser window size changes
function resize() {
    width = parseInt(d3.select('#districts').style('width'));
    width = width - margin.left - margin.right;
    height = width * mapRatio;

    // update projection
    projection.translate([width / 2, height / 2])
        .center(syria_center)
        .scale(width * [mapRatio + mapRatioAdjuster]);

    // resize map container
    svg.style('width', width + 'px')
        .style('height', height + 'px');

    // resize map
    svg.selectAll("path").attr('d', path);
}

// adds zoom function to map
var zoom = d3.behavior.zoom()
    .translate([0, 0])
    .scale(1)
    .scaleExtent([1, 10]) // defines how far users can zoom in and out
    .on("zoom", zoomed);

// zoom function. allows users to zoom in and out of map
function zoomed() {
    features.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

// when window size changes, resize the map
d3.select(window).on('resize', resize);

// create SVG element
var svg = d3.select("#districts")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .call(zoom); //Call zoom function on map

//Define path generator
var path = d3.geo.path()
    .projection(projection);

//Group SVG elements together
var features = svg.append("g");


//Load TopoJSON data
d3.json("Lebanon_Level2.json", function (error, syr) {

    if (error) return console.error(error);

    var subunits = topojson.feature(syr, syr.objects.gadm36_LBN_2);

    // Bind data and create one path per TopoJSON feature
    features.selectAll("path")
        .data(topojson.feature(syr, syr.objects.gadm36_LBN_2).features)
        .enter()
        .append("path")
        .attr("d", path)

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
            d3.select("#tooltip")
                .select("#district-arabic")
                .text(d.properties.Arabic_NAME_2);


            // update district name
            d3.select("#tooltip")
                .select("#district")
                .text(d.properties.NAME_2);


            // Update province and district names in info box
            d3.select('#governorate-name')
                .text(d.properties.NAME_1);
            d3.select('#governorate-name-arabic')
                .text(d.properties.Arabic_NAME_1);

            d3.select('#district-name')
                .text(d.properties.NAME_2);
            d3.select('#district-name-arabic')
                .text(d.properties.Arabic_NAME_2);


            // Show tooltip
            d3.select("#tooltip").classed("hidden", false);
            d3.select("#tooltip").selectAll(".districtEntry").classed("hidden", false);

        })

        // Hide tooltip when user stops hovering over map
        .on("mouseout", function () {
            d3.select("#tooltip").classed("hidden", true);
            d3.select("#tooltip").select("#districtEntry").classed("hidden", true);

        });
});
