// Fetch Variables
let url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json';
let req = new XMLHttpRequest();

// Temperature Scale Variables
let xScale, yScale;

// Min, Max and Number of Years Variables
let minYear, maxYear, numberYears;

// Array of Months
const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

// SVG Dimensions Variables
let width = 1000, height = 400, padding = 60;

// Store the SVG Element
let svg = d3.select('#HeatMap');

// Function to add the base temperature
function baseTemperature(BaseTemp) {
    document.getElementById('BaseTemperature').innerHTML = `Base Temperature: ${BaseTemp} °C`;
}

// Function to add the width and height to the svg
function drawSvg() {
    svg.attr('width', width)
        .attr('height', height);
}

// Function to generate the scales and the min and max year
function generateScales(data) {
    minYear = d3.min(data, (d) => {
        return d.year
    });

    maxYear = d3.max(data, (d) => {
        return d.year
    });

    xScale = d3.scaleLinear()
        .domain([minYear, maxYear + 1])
        .range([padding, width - padding]);

    yScale = d3.scaleTime()
        .domain([new Date(0, 0, 0, 0, 0, 0, 0), new Date(0, 12, 0, 0, 0, 0, 0)])
        .range([padding, height - padding]);
}

// Function to generate the axes
function generateAxes() {
    // Move the x-axis
    let xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'));
    svg.append('g')
        .call(xAxis)
        .attr('id', 'x-axis')
        .attr('transform', `translate(0, ${height - padding})`);

    // Move the y-axis
    let yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat('%B'));
    svg.append('g')
        .call(yAxis)
        .attr('id', 'y-axis')
        .attr('transform', `translate(${padding}, 0)`);
}

// Function to create the cells
function drawCells(data, BaseTemp) {
    //Creating the Tooltip
    d3.select("main")
        .append("div")
        .attr("id", "tooltip")
        .style("position", "absolute")
        .style("background-color", "rgba(0,0,0,0.8)")
        .style("padding", "10px")
        .style("color", "#ffffff")
        .style("border-radius", "15px")
        .style("opacity", 0);

    //Creating the Cells
    svg.selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'cell')
        .attr('fill', (d) => {
            let variance = d.variance;
            let varianceAboveOne = variance <= 1 ? 'Orange' : 'Crimson';
            let varianceEqualZero = variance <= 0 ? 'LightSteelBlue' : varianceAboveOne;
            let varianceUnderOne = variance <= -1 ? 'SteelBlue' : varianceEqualZero;

            return varianceUnderOne;
        })
        .attr('data-year', (d) => {
            return d.year
        })
        .attr('data-month', (d) => {
            return d.month - 1
        })
        .attr('data-temp', (d) => {
            return BaseTemp + d.variance
        })
        .attr('height', (height - (2 * padding)) / 12)
        .attr('y', (d) => {
            return yScale(new Date(0, d.month - 1, 0, 0, 0, 0, 0))
        })
        .attr('width', (d) => {
            numberYears = maxYear - minYear;
            return (width - (2 * padding)) / numberYears
        })
        .attr('x', (d) => {
            return xScale(d.year)
        })
        .on("mousemove", (event, d) => {
            const tooltip = d3.select("#tooltip");

            tooltip
                .style("left", event.pageX + 10 + "px")
                .style("top", event.pageY + 10 + "px")
                .style("opacity", 0.9)
                .style("border-radius", "8px")
                .style("font-size", "12px");

            tooltip.attr("data-year", d.year).html(`
                <p>${d.year} - ${months[d.month - 1]}</p>
                <p>Temp: ${(BaseTemp + d.variance).toFixed(2)}℃</p>
              `);
        })
        .on("mouseout", () => {
            d3.select("#tooltip").style("opacity", 0);
        });
}

/**
 * We make the request to the url and we tell it that we are making a 'GET' request 
 * and that the function is asynchronous.
 */
req.open('GET', url, true);
req.onload = () => {
    // Response Variables
    let response = JSON.parse(req.responseText);
    let BaseTemp = response.baseTemperature;
    let data = response.monthlyVariance;

    // We call the functions and pass the data to those who need it
    baseTemperature(BaseTemp);
    drawSvg();
    generateScales(data);
    drawCells(data, BaseTemp);
    generateAxes();
}
req.send();