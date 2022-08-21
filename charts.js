function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("samples.json").then((data) => {
    var sampleNames = data.names;

    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    var firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

// Initialize the dashboard
init();

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildMetadata(newSample);
  buildCharts(newSample);
  
}

// Demographics Panel 
function buildMetadata(sample) {
  d3.json("samples.json").then((data) => {
    var metadata = data.metadata;
    // Filter the data for the object with the desired sample number
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];
    // Use d3 to select the panel with id of `#sample-metadata`
    var PANEL = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    PANEL.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
    });

  });
}

// Bar and Bubble charts
// Create the buildCharts function.
function buildCharts(sample) {
  // Use d3.json to load and retrieve the samples.json file 
  d3.json("samples.json").then((data) => {
    var samplesArray = data.samples;
    var resultArray = samplesArray.filter(sampleObj =>
      sampleObj.id == sample);
    var result = resultArray[0];
    var otu_ids = result.otu_ids;
    var otu_labels = result.otu_labels;
    var sample_values = result.sample_values;

    // Build a bar chart with the top 10 bacterial samples
    var topTenIDs = otu_ids.slice(0,10).reverse();
    var yticks = topTenIDs.map(function(ID) {
      return "OTU " + ID})
    var topTenSamples = sample_values.slice(0,10).reverse();
    var topTenLabels = otu_labels.slice(0,10).reverse();
    var barData = [{
      x: topTenSamples,
      y: yticks,
      type: "bar",
      text: topTenLabels,
      orientation: 'h',
      marker: {color: "darkslategray"}}];
    var barLayout = {title: "<b>Top 10 Bacteria Cultures Found</b>", font: {family: "Times New Roman"}};
    Plotly.newPlot("bar", barData, barLayout);

    // Create a bubble chart of bacterial samples
    var bubbleData = [{
      x: otu_ids,
      y: sample_values,
      text: otu_labels,
      mode: "markers",
      marker: {
        size: sample_values,
        color: otu_ids,
        colorscale: 'YlGnBu',
        type: "scatter"} }];

    var bubbleLayout = {
      title: "<b>Bacteria Cultures Per Sample</b>",
      xaxis: {title: "OTU ID"},
      margin: {autoexpand: true},
      hovermode: "closest",
      autosize: true,
      font: {family: "Times New Roman"}};

    Plotly.newPlot("bubble", bubbleData, bubbleLayout); 

    // Create a gauge chart for weekly washing
    var metadata = data.metadata;
    var metadataArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var thisMetadata = metadataArray[0];
    var wfreq = parseFloat(thisMetadata.wfreq);
    
    var html = "<b>Belly Button Washing Frequency</b><br><i>Scrubs Per Week</i>"
    var gaugeData = [
      {domain: { x: [0, 1], y: [0, 1] },
      value: wfreq,
      title: {text: html},
      type: "indicator",
      mode: "gauge+number",
      gauge: {
        axis: {range: [null,10], tickwidth: 2},
        bar: {color: "black"},
        steps: [
          {range: [0, 2], color: "darkslategray"},
          {range: [2,4], color: "teal"},
          {range: [4,6], color: "mediumaquamarine"},
          {range: [6,8], color: "mediumseagreen"},
          {range: [8,10], color: "palegreen"}]}}
    ];

    var gaugeLayout = {margin: {t: 0, b: 0}, font: {family: "Times New Roman"}};

    Plotly.newPlot("gauge", gaugeData, gaugeLayout);
  });
}
