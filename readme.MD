# D3.js Map: Lebanon

## How it was done
This Repository is a very slightly modified verion of [Gary Pang's repository.](https://github.com/CodeWritingCow/d3-js-maps-syria-districts)


This will hopefully allow other developer to show their data on a Lebanese map and make it easier for data visualization.

The Map is based on 3 ShapeFile files downloaded from this [website](https://gadm.org/download_country_v3.html)

The Json is a TOPOJSON file which takes less space then your your typical geojson file.

In order to convert the ShapeFile to a topo Json I used the following [site](http://mapshaper.org/).

## The Actual Site

You can check the interactive D3 map on the link below
>https://ebrahimkaram.github.io/Lebanon-Districts-D3-Map/

It's divided into 3 sections.
### Mohafaza / Governorates
You can use your mouse to hover over the different areas and check their name.

Now developers can add data for each region that would show on the tooltip.

### Qada2 / Districts

As you hover your mouse on the region. The tooltip shows the name of the Qada2 and the region that is in.

### Diya3 / Villages

The tooltip would show the name of the Village, the name of the district it is apart of, and the Mohafaza it is apart of.


## Acknowledgments
I would like to give credit [CodeWritingCow](https://github.com/CodeWritingCow) for making his [D3.js map of Syria repository](https://github.com/CodeWritingCow/d3-js-maps-syria-districts) public making the development of this repository much easier.

## Further Info

Please feel free to submit any issues, star the repository, and fork it for your personal projects. I'm putting this project under an MIT open License to encourage as many projects as possible for whatever purpose they serve. I'm also available on twitter at @BahoKaram
