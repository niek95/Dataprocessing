window.onload = function() {
  main();
};

var main = async () => {
  let fileName = "Data/ghg_data.json";
  let country_data = await d3v5.json(fileName);
  let countries = await preprocess(country_data);
  console.log(countries);
  let cat_select = document.getElementById("cat_select");
  cat_select.onchange = () => {
    d3v5.select(".bar-chart").remove();
    populate_years(countries, cat_select.value);
  };
  let year_select = document.getElementById("year_select");
  year_select.onchange = () => {
    build_map(countries, cat_select.value, year_select.value);
  };
};

var preprocess = async (json_data) => {
// Add country and its categories to list
  let countries = {};
  let categories = [];
  let i = 0;
  while (i < json_data.length) {
    // Add country names to countries list
    let country_name = json_data[i].country_or_area;
    if (!countries[country_name]) {
      countries[country_name] = {};
    }
    // For each category, add available years to selection
    let category_name = json_data[i].category;
    if (!categories.includes(category_name)) {
      categories.push(category_name);
      var select = document.getElementById("cat_select");
      select.options[select.options.length] = new Option(category_name, category_name);
    }
    // For each category, add values by year to country
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

var build_map = (countries, category, year) => {
  d3v5.select("svg").remove();
  series = select_data(countries, category, year);
  let min_max = get_min_max(series);
  let paletteScale = d3v3.scale.linear()
            .domain([min_max[0], min_max[1]])
            .range(["#EFEFFF","#02386F"]);

  // Map values to colours
  series.forEach(item => { //
        // item example value ["USA", 70]
        var iso = item[0],
                value = item[1];
        dataset[iso] = { numberOfThings: value, fillColor: paletteScale(value) };
    });

  var map = new Datamap({
    element: document.getElementById("container"),
    projection: 'mercator',
    fills: { defaultFill: "#F5F5F5" },
    data: dataset,
    done: datamap => {
      datamap.svg.selectAll('.datamaps-subunit').on('click', geography => {
        if (countries.hasOwnProperty(geography.properties.name)) {
          build_barchart(countries[geography.properties.name][category],
                         category, geography.properties.name);
        }
      });
    },
    geographyConfig: {
      popupTemplate: function(geo, data) {
        return ['<div class="hoverinfo"><strong>',
                geo.properties.name,
                ': ' + data.numberOfThings,
                '</strong></div>'].join('');
      }
    }
  });
};

var build_barchart = (country_cat_data, category, country_name) => {
  d3v5.select(".bar-chart").remove();
  let dataset = Object.keys(country_cat_data).map((key) => {
    return [key, country_cat_data[key]];
  });
  let w = 700;
  let h = 400;
  let barPadding = 4;
  let topPadding = 35;
  let sidePadding = 120;
  let y_domain = [0, get_min_max(dataset)[1]];
  let y_range = [0, h - (topPadding * 2)];

  // set scale for x-axis
  let y_scale = d3v5.scaleLinear()
    .domain(y_domain)
    .range(y_range);

  let descale = d3v5.scaleLinear()
    .domain(y_range)
    .range(y_domain);

  let y_axis_scale = d3v5.scaleLinear()
    .domain(y_domain)
    .range([h - topPadding, topPadding]);

  let x_axis_scale = d3v5.scaleBand()
    .domain(dataset.map(element => {
      return element[0];
    }))
    .range([sidePadding, w - sidePadding]);

  let y_axis = d3v5.axisLeft(y_axis_scale)
    .ticks(10);

  let x_axis = d3v5.axisBottom(x_axis_scale);

  // Create svg and draw axis and text
  var svg = d3v5.select("body")
    .append("svg")
    .attr("width", w)
    .attr("height", h)
    .attr("class", "bar-chart");

  g_axis = svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + sidePadding + ", 0)")
    .call(y_axis);

  svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0, " + (h - topPadding) + ")")
    .call(x_axis)
    .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");

  svg.append("text")
    .attr("x", w / 2)
    .attr("y", topPadding / 3)
    .attr("text-anchor", "middle")
    .text(country_name);

  svg.append("text")
    .attr("x", w / 2)
    .attr("y", 3 * topPadding / 4)
    .attr("text-anchor", "middle")
    .text(category)
    .style("font-size", "12");

  // Draw bars
  svg.selectAll("rect")
    .data(dataset)
    .enter()
    .append("rect")
    .attr("x", (d,i) => {
      return i * ((w - sidePadding * 2) / dataset.length) + sidePadding;
    })
    .attr("y", (d) => {
      return h - topPadding - y_scale(d[1]);
    })
    .attr("width", (w - sidePadding * 2) / dataset.length - barPadding)
    .attr("height", (d) => {
      return y_scale(d[1]);
    })
    .attr("fill", "rgb(51, 153, 255)")
    .on("mouseover", function(d) {
      d3v5.select(this)
        .attr("fill", "rgb(153, 204, 255)");
      svg.append("text")
        .attr("class", "tooltip")
        .attr("x", w - sidePadding)
        .attr("y", h / 2)
        .attr("text-anchor", "left")
        .text(country_name + ": " + d[1])
        .style("font-size", "10");
      })
    .on("mouseout", function() {
      d3v5.select(this)
        .attr("fill", "rgb(51, 153, 255)");
      d3v5.select(".tooltip").remove();
      });
};

var add_country_codes = async (countries) => {
  // Add country codes based on txt file
  let response = await fetch("Data/country_codes.txt");
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
    curr_max = Math.max(curr_max, dataset[i][1]);
  }
  return [curr_min, curr_max];
};

var select_data = (countries, category, year) => {
  // Selects requested data and returns pairs of country code and value
  dataset = [];
  for (let country in countries) {
    if (countries.hasOwnProperty(country) &&
        countries[country].hasOwnProperty("code") &&
        countries[country].hasOwnProperty(category) &&
        countries[country][category].hasOwnProperty(year)) {
        dataset.push([countries[country].code , countries[country][category][year]]);
    }
  }
  return dataset;
};

var populate_years = (countries, category) => {
  let years = [];
  let select = document.getElementById("year_select");
  select.options.length = 0;
  select.options[0] = new Option("Select year", "");
  select.options[0].disabled = true;
  select.options[0].selected = true;
  for (let country in countries) {
    if (countries.hasOwnProperty(country) && countries[country].hasOwnProperty("code")) {
      for (let year in countries[country][category]) {
        if (countries[country][category].hasOwnProperty(year) && !years.includes(year)) {
          years.push(year);
          select.options[select.options.length] = new Option(year, year);
        }
      }
    }
  }
};
