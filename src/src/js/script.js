load_barchart("2013");
$('.donut-chart-background').hide();

$('#select-year').change(function () {
    d3.select("g").remove();
    load_barchart($(this).val());
    $('.donut-chart-background').hide();
})

function load_barchart(year) {
    // set the dimensions and margins of the graph
    let margin = { top: 20, right: 20, bottom: 30, left: 40 },
        width = 960 - margin.left - margin.right,
        height = 680 - margin.top - margin.bottom;

    // set the ranges
    const y = d3.scaleBand()
        .range([height, 0])
        .padding(0.1);

    const x = d3.scaleLinear()
        .range([0, width]);

    // append the svg_donut object to the body of the page
    // append a 'group' element to 'svg_donut'
    // moves the 'group' element to the top left margin
    let svg_barchart = d3.select("#barchart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");


    d3.csv("data/" + year + ".csv", function (error, data) {

        // format the data
        data.forEach(function (d) {
            d.Unfall = +d.Unfall;
        });

        data.sort(function (a, b) {
            return a.Unfall - b.Unfall;
        });

        // Scale the range of the data in the domains
        x.domain([0, d3.max(data, function (d) {
            return d.Unfall;
        })]);

        y.domain(data.map(function (d) {
            return d.Kanton;
        }));
        //y.domain([0, d3.max(data, function(d) { return d.sales; })]);

        // append the rectangles for the bar chart
        svg_barchart.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            //.attr("x", function(d) { return x(d.sales); })
            .attr("width", function (d) {
                return x(d.Unfall);
            })
            .transition()
            .duration(200)
            .delay(function (d, i) {
                return i * 50;
            })
            .attr("y", function (d) {
                return y(d.Kanton);
            })
            .attr("height", y.bandwidth());

        svg_barchart.selectAll(".bar").on("mouseout", function () {
            console.log("UNhover the bar");
        });

        svg_barchart.selectAll(".bar").on("mouseover", function () {
            console.log("HOVER the bar");
        });

        svg_barchart.selectAll(".bar").on("click", function (d) {
            loadDonut(d.Fatal, d.Injured, d.heavy_Injured);
        });

        // add the x Axis
        svg_barchart.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        // add the y Axis
        svg_barchart.append("g")
            .call(d3.axisLeft(y));
    });
}

function loadDonut(fatal, injured, heavy_Injured) {
    $('.donut-chart-background').show();
    const data = [
        { name: "Fatal", value: fatal },
        { name: "Injured", value: injured },
        { name: "Heavy Injured", value: heavy_Injured }
    ];
    let text = "";

    const width = 460;
    const height = 300;
    const thickness = 40;
    const duration = 750;

    const radius = Math.min(width, height) / 2;
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    let svg_donut = d3.select("#donut")
        .attr('class', 'pie')
        .attr('width', width)
        .attr('height', height);

    let g = svg_donut.append('g')
        .attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')');

    let arc = d3.arc()
        .innerRadius(radius - thickness)
        .outerRadius(radius);

    let pie = d3.pie()
        .value(function (d) { return d.value; })
        .sort(null);

    let path = g.selectAll('path')
        .data(pie(data))
        .enter()
        .append("g")
        .on("mouseover", function (d) {
            let g = d3.select(this)
                .style("cursor", "pointer")
                .style("fill", "black")
                .append("g")
                .attr("class", "text-group");

            g.append("text")
                .attr("class", "name-text")
                .text(`${d.data.name}`)
                .attr('text-anchor', 'middle')
                .attr('dy', '-1.2em');

            g.append("text")
                .attr("class", "value-text")
                .text(`${d.data.value}`)
                .attr('text-anchor', 'middle')
                .attr('dy', '.6em');
        })
        .on("mouseout", function (d) {
            d3.select(this)
                .style("cursor", "none")
                .style("fill", color(this._current))
                .select(".text-group").remove();
        })
        .append('path')
        .attr('d', arc)
        .attr('fill', (d, i) => color(i))
        .on("mouseover", function (d) {
            d3.select(this)
                .style("cursor", "pointer");
        })
        .on("mouseout", function (d) {
            d3.select(this)
                .style("cursor", "none")
                .style("fill", color(this._current));
        })
        .each(function (d, i) { this._current = i; });

    g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '.35em')
        .text(text);

    $("html, body").animate({ scrollTop: document.body.scrollHeight }, "slow");
}