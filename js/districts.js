const distMargin = { top: 10, left: 10, bottom: 10, right: 10 };
let distWidth = parseInt(d3.select('#districts').style('width')) - distMargin.left - distMargin.right;
const distMapRatio = 0.6;
let distHeight = distWidth * distMapRatio;
const distScaleAdjuster = 15;
const distCenter = [35.86, 33.9];

const distProjection = d3.geoMercator()
    .center(distCenter)
    .translate([distWidth / 2, distHeight / 2])
    .scale(distWidth * (distMapRatio + distScaleAdjuster));

const distPath = d3.geoPath().projection(distProjection);

const distZoom = d3.zoom()
    .scaleExtent([1, 10])
    .on("zoom", distZoomed);

const distSvg = d3.select("#districts")
    .append("svg")
    .attr("width", distWidth)
    .attr("height", distHeight)
    .call(distZoom);

const distFeatures = distSvg.append("g");

function distResize() {
    distWidth = parseInt(d3.select('#districts').style('width')) - distMargin.left - distMargin.right;
    distHeight = distWidth * distMapRatio;

    distProjection
        .translate([distWidth / 2, distHeight / 2])
        .center(distCenter)
        .scale(distWidth * (distMapRatio + distScaleAdjuster));

    distSvg.attr("width", distWidth).attr("height", distHeight);
    distFeatures.selectAll("path").attr("d", distPath);
}

function distZoomed(event) {
    distFeatures.attr("transform", event.transform);
}

d3.select(window).on('resize.districts', distResize);

d3.json("Lebanon_Level2.json").then(data => {
    const subunits = topojson.feature(data, data.objects.gadm36_LBN_2);

    distFeatures.selectAll("path")
        .data(subunits.features)
        .enter().append("path")
        .attr("d", distPath)
        .attr("fill", "#d8ecf3")
        .attr("stroke", "#333")
        .attr("stroke-width", 0.4)
        .on("mousemove", (event, d) => {
            d3.select("#tooltip")
                .style("top", (event.pageY + 20) + "px")
                .style("left", (event.pageX + 20) + "px")
                .select("#governorate").text(d.properties.NAME_1);

            d3.select("#tooltip").select("#governorate-arabic").text(d.properties.Arabic_NAME_1);
            d3.select("#tooltip").select("#district").text(d.properties.NAME_2);
            d3.select("#tooltip").select("#district-arabic").text(d.properties.Arabic_NAME_2);



            // Update province and district names in info box
            d3.select('#governorate-name')
                .text(d.properties.NAME_1);
            d3.select('#governorate-name-arabic')
                .text(d.properties.Arabic_NAME_1);

            d3.select('#district-name')
                .text(d.properties.NAME_2);
            d3.select('#district-name-arabic')
                .text(d.properties.Arabic_NAME_2);

            d3.select("#tooltip").classed("hidden", false);
            d3.select("#tooltip").selectAll(".districtEntry").classed("hidden", false);
        })
        .on("mouseout", () => {
            d3.select("#tooltip").classed("hidden", true);
            d3.select("#tooltip").selectAll(".districtEntry").classed("hidden", true);
        });
});
