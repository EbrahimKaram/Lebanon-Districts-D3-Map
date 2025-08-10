const moMargin = { top: 10, left: 10, bottom: 10, right: 10 };
let moWidth = parseInt(d3.select('#mohafaza').style('width')) - moMargin.left - moMargin.right;
const moMapRatio = 0.6;
let moHeight = moWidth * moMapRatio;
const moScaleAdjuster = 15;
const moCenter = [35.86, 33.9]; // Lebanon center

const moProjection = d3.geoMercator()
    .center(moCenter)
    .translate([moWidth / 2, moHeight / 2])
    .scale(moWidth * (moMapRatio + moScaleAdjuster));

const moPath = d3.geoPath().projection(moProjection);

const moZoom = d3.zoom()
    .scaleExtent([1, 8])
    .on("zoom", moZoomed);

const moSvg = d3.select("#mohafaza")
    .append("svg")
    .attr("width", moWidth)
    .attr("height", moHeight)
    .call(moZoom);

const moFeatures = moSvg.append("g");

function moResize() {
    moWidth = parseInt(d3.select('#mohafaza').style('width')) - moMargin.left - moMargin.right;
    moHeight = moWidth * moMapRatio;

    moProjection
        .translate([moWidth / 2, moHeight / 2])
        .center(moCenter)
        .scale(moWidth * (moMapRatio + moScaleAdjuster));

    moSvg.attr("width", moWidth).attr("height", moHeight);
    moFeatures.selectAll("path").attr("d", moPath);
}

function moZoomed(event) {
    moFeatures.attr("transform", event.transform);
}

d3.select(window).on('resize.mohafaza', moResize);

d3.json("Lebanon_Level1.json").then(data => {
    const subunits = topojson.feature(data, data.objects.gadm36_LBN_1);

    moFeatures.selectAll("path")
        .data(subunits.features)
        .enter().append("path")
        .attr("d", moPath)
        .attr("fill", "#f4e5c2")
        .attr("stroke", "#444")
        .attr("stroke-width", 0.6)
        .on("mousemove", (event, d) => {
            d3.select("#tooltip")
                .style("top", (event.pageY + 20) + "px")
                .style("left", (event.pageX + 20) + "px")
                .select("#governorate").text(d.properties.NAME_1);

            d3.select("#tooltip").select("#governorate-arabic").text(d.properties.Arabic_NAME_1);

            
            // Update province and district names in info box
            d3.select("#Mohafaza-name")
                .text(d.properties.NAME_1);
            d3.select("#Mohafaza-name-arabic")
                .text(d.properties.Arabic_NAME_1);
            d3.select("#tooltip").classed("hidden", false);
            d3.select("#tooltip").selectAll(".districtEntry").classed("hidden", true);
        })
        .on("mouseout", () => {
            d3.select("#tooltip").classed("hidden", true);
            d3.selectAll('.districtEntry').classed("hidden", false);
        });
});
