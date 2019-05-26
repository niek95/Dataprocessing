window.onload = function() {
  main();
};

var main = async function() {
  let  fileName = "Data/ghg_data.json";
  let country_data = await d3v5.json(fileName);
  countries = preprocess(country_data);
  console.log(countries);
};

var preprocess = function(json_data) {
  countries = [];
  let i = 0;
  while (i < json_data.length) {
    country_name = json_data[i].country_or_area;
    let country = {
      name:country_name
    };
    category_name = json_data[i].category;
    values = {};
    while (i < json_data.length && json_data[i].country_or_area == country_name) {
      values[json_data[i].year] = json_data[i].value;
      i++;
    }
    country[category_name] = values;
    countries.push(country);
  }
  return countries;
};
