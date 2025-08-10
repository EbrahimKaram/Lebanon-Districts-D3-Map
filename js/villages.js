const villMargin = { top: 10, left: 10, bottom: 10, right: 10 };
let villWidth = parseInt(d3.select('#villages').style('width')) - villMargin.left - villMargin.right;
const villMapRatio = 0.6;
let villHeight = villWidth * villMapRatio;
const villScaleAdjuster = 15;
const villCenter = [35.86, 33.9];

const villProjection = d3.geoMercator()
    .center(villCenter)
    .translate([villWidth / 2, villHeight / 2])
    .scale(villWidth * (villMapRatio + villScaleAdjuster));

const villPath = d3.geoPath().projection(villProjection);

const villZoom = d3.zoom()
    .scaleExtent([1, 15])
    .on("zoom", villZoomed);

const villSvg = d3.select("#villages")
    .append("svg")
    .attr("width", villWidth)
    .attr("height", villHeight)
    .call(villZoom);

const villFeatures = villSvg.append("g");

function villResize() {
    villWidth = parseInt(d3.select('#villages').style('width')) - villMargin.left - villMargin.right;
    villHeight = villWidth * villMapRatio;

    villProjection
        .translate([villWidth / 2, villHeight / 2])
        .center(villCenter)
        .scale(villWidth * (villMapRatio + villScaleAdjuster));

    villSvg.attr("width", villWidth).attr("height", villHeight);
    villFeatures.selectAll("path").attr("d", villPath);
}

function villZoomed(event) {
    villFeatures.attr("transform", event.transform);
}

d3.select(window).on('resize.villages', villResize);

d3.json("Lebanon_Level3.json").then(data => {
    const subunits = topojson.feature(data, data.objects.gadm36_LBN_3);

    villFeatures.selectAll("path")
        .data(subunits.features)
        .enter().append("path")
        .attr("d", villPath)
        .attr("fill", "#e6f4d8")
        .attr("stroke", "#222")
        .attr("stroke-width", 0.3)
        .on("mousemove", (event, d) => {


            // Store original color for reset
            const baseFill = "#e6f4d8";

            // // Reset all fills to base color first
            // villFeatures.selectAll("path").attr("fill", baseFill);

            const currentDistrict = d.properties.NAME_2;
            villFeatures.selectAll("path")
                .attr("fill", v => v.properties.NAME_2 === currentDistrict ? "white" : baseFill);

            d3.select("#tooltip")
                .style("top", (event.pageY + 20) + "px")
                .style("left", (event.pageX + 20) + "px")
                .select("#governorate").text(d.properties.NAME_1);

            d3.select("#tooltip").select("#governorate-arabic").text(d.properties.Arabic_NAME_1);
            d3.select("#tooltip").select("#district").text(d.properties.NAME_2);
            d3.select("#tooltip").select("#district-arabic").text(d.properties.Arabic_NAME_2);
            d3.select("#tooltip").select("#village").text(d.properties.NAME_3);
            d3.select("#tooltip").select("#village-arabic").text(d.properties.Arabic_NAME_3);


            // Update province and district names in info box
            d3.select('#governorate-name-1')
                .text(d.properties.NAME_1);

            d3.select('#governorate-name-1-arabic')
                .text(d.properties.Arabic_NAME_1);

            d3.select('#district-name-1')
                .text(d.properties.NAME_2);

            d3.select('#district-name-1-arabic')
                .text(d.properties.Arabic_NAME_2);

            d3.select('#village-name-1').
                text(d.properties.NAME_3);

            d3.select('#village-name-1-arabic').
                text(d.properties.Arabic_NAME_3);

            // Show tooltip
            d3.select("#tooltip").classed("hidden", false);
            d3.select("#tooltip").selectAll(".districtEntry").classed("hidden", false);
        })
        .on("mouseout", () => {
            d3.select("#tooltip").classed("hidden", true);
            villFeatures.selectAll("path").attr("fill", "#e6f4d8");
        });


});
