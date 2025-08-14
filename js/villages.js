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


const baseFill = "#e6f4d8";
// let villageData = [];
let villageNamesArray = [];

// Normalization utility: lowercase, trim, collapse internal whitespace, remove diacritics & punctuation
function normalizeName(str) {
    return str
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove diacritics
        .replace(/['`´’]/g, "") // unify apostrophes
        .replace(/[_.,/\\-]+/g, " ") // punctuation to space
        .replace(/\s+/g, " ") // collapse spaces
        .trim();
}

// Optional alias mapping (extend as needed)
const villageAliases = {
    "tyre": "sour (tyr)",
    "tyr": "sour (tyr)",
    "sur": "sour (tyr)",
    "sour": "sour (tyr)" // helps if dataset lists full "Sour (Tyr)"
};

d3.json("Lebanon_Level3.json").then(data => {
    const subunits = topojson.feature(data, data.objects.gadm36_LBN_3);
    villageData = subunits.features;
    villageNamesArray = villageData.map(v => v.properties.NAME_3);

    // Precompute normalized lookup for faster flexible matching
    villageData.forEach(v => {
        v._normalized = normalizeName(v.properties.NAME_3);
    });

    villFeatures.selectAll("path")
        .data(subunits.features)
        .enter().append("path")
        .attr("d", villPath)
        .attr("fill", baseFill)
        .attr("stroke", "#222")
        .attr("stroke-width", 0.3)
        .on("mousemove", (event, d) => {


            // Store original color for reset


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
            d3.select("#tooltip").selectAll(".villageEntry").classed("hidden", false);
        })
        .on("mouseout", () => {
            d3.select("#tooltip").classed("hidden", true);
            villFeatures.selectAll("path").attr("fill", "#e6f4d8");

            d3.select("#tooltip").selectAll(".districtEntry").classed("hidden", true);
            d3.select("#tooltip").selectAll(".villageEntry").classed("hidden", true);
        });

    autocomplete(
        document.getElementById("myInput"),
        villageNamesArray,
        (selectedName) => {
            document.getElementById("myInput").value = selectedName;
            highlight();
        }
    );


});

function highlight() {
    const inputEl = document.getElementById("myInput");
    if (!inputEl) return;
    let raw = inputEl.value.trim();
    if (!raw) return;

    // Apply alias if user typed a known alternative
    const aliasKey = normalizeName(raw);
    if (villageAliases[aliasKey]) raw = villageAliases[aliasKey];

    const normalizedInput = normalizeName(raw);
    const tokens = normalizedInput.split(/\s+/);

    // Exact normalized match first
    let match = villageData.find(v => v._normalized === normalizedInput);

    // Fallback: all tokens present (order agnostic)
    if (!match) {
        match = villageData.find(v => tokens.every(t => v._normalized.includes(t)));
    }

    if (!match) {
        console.error("No matching village found");
        return;
    }

    // Reset fills
    villFeatures.selectAll("path").attr("fill", baseFill);

    // Highlight district
    const district = match.properties.NAME_2;
    villFeatures.selectAll("path")
        .filter(v => v.properties.NAME_2 === district)
        .attr("fill", "white");



    villFeatures.selectAll("path")
        .filter(v => v === match || v._normalized === match._normalized)
        .attr("fill", "grey");

    // Zoom to village bounds
    const bounds = villPath.bounds(match);
    const dx = bounds[1][0] - bounds[0][0];
    const dy = bounds[1][1] - bounds[0][1];
    const x = (bounds[0][0] + bounds[1][0]) / 2;
    const y = (bounds[0][1] + bounds[1][1]) / 2;
    const scale = Math.max(1, Math.min(15, 0.9 / Math.max(dx / villWidth, dy / villHeight)));
    const translate = [villWidth / 2 - scale * x, villHeight / 2 - scale * y];

    villSvg.transition().duration(750).call(
        villZoom.transform,
        d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
    );

    // Show tooltip at centroid
    const centroid = villPath.centroid(match);
    d3.select("#tooltip")
        .style("top", (centroid[1] + 40) + "px")
        .style("left", (centroid[0] + 40) + "px")
        .classed("hidden", false);

    d3.select("#tooltip").select("#governorate").text(match.properties.NAME_1);
    d3.select("#tooltip").select("#governorate-arabic").text(match.properties.Arabic_NAME_1);
    d3.select("#tooltip").select("#district").text(match.properties.NAME_2);
    d3.select("#tooltip").select("#district-arabic").text(match.properties.Arabic_NAME_2);
    d3.select("#tooltip").select("#village").text(match.properties.NAME_3);
    d3.select("#tooltip").select("#village-arabic").text(match.properties.Arabic_NAME_3);


    d3.select('#governorate-name-1')
        .text(match.properties.NAME_1);

    d3.select('#governorate-name-1-arabic')
        .text(match.properties.Arabic_NAME_1);

    d3.select('#district-name-1')
        .text(match.properties.NAME_2);

    d3.select('#district-name-1-arabic')
        .text(match.properties.Arabic_NAME_2);

    d3.select('#village-name-1').
        text(match.properties.NAME_3);

    d3.select('#village-name-1-arabic').
        text(match.properties.Arabic_NAME_3);
}




