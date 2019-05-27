window.onload = function() {
  main();
};

var main = async () => {
  let fileName = "Data/ghg_data.json";
  let country_data = await d3v5.json(fileName);
  let countries = await preprocess(country_data);
  console.log(countries);
  visualize(countries, "carbon_dioxide_co2_emissions_without_land_use_land_use_change_and_forestry_lulucf_in_kilotonne_co2_equivalent", 2012);
};

var preprocess = async (json_data) => {
// Add country and its categories to list
  let countries = {};
  let i = 0;
  while (i < json_data.length) {
    let country_name = json_data[i].country_or_area;
    if (!countries[country_name]) {
      countries[country_name] = {};
    }
    // For each category, loop and add the values for each year
    let category_name = json_data[i].category;
    let values = {};
    while (i < json_data.length && json_data[i].country_or_area === country_name) {
      values[json_data[i].year] = json_data[i].value;
      i++;
    }
    countries[country_name][category_name] = values;
  }
  countries = await add_country_codes(countries);
  return countries;
};

var visualize = (countries, category, year) => {
  series = select_data(countries, category, year);
  let min_max = get_min_max(countries, category, year);
  let paletteScale = d3v3.scale.linear()
            .domain([min_max[0], min_max[1]])
            .range(["#EFEFFF","#02386F"]);

  series.forEach(function(item){ //
        // item example value ["USA", 70]
        var iso = item[0],
                value = item[1];
        dataset[iso] = { numberOfThings: value, fillColor: paletteScale(value) };
    });

  var map = new Datamap({
    element: document.getElementById("container"),
    fills: { defaultFill: "#F5F5F5" },
          data: dataset
  });
};

var add_country_codes = async (countries) => {
  let response = await fetch("data/country_codes.txt");
  let text = await response.text();
  text = text.split("\n");
  text.forEach((element) => {
    split = element.split(": ");
    if (countries[split[1]]) {
      countries[split[1]].code = split[0];
    }
  });
  return countries;
};

var get_min_max = (dataset) => {
  let curr_min = Number.MAX_SAFE_INTEGER;
  let curr_max = 0;
  for (let i = 0; i < dataset.length; i++) {
    curr_min = Math.min(curr_min, dataset[i][1]);
    curr_max = Math.min(curr_max, dataset[i][1]);
  }
  return [curr_min, curr_max];
};

select_data = (countries, category, year) => {
  dataset = [];
  for (let country in countries) {
    if (countries.hasOwnProperty(country)) {
      if (countries[country][category].hasOwnProperty(year)) {
        dataset.push([countries[country][code], countries[country][category][year]]);
      }
    }
  }
  return dataset;
};
