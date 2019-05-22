window.onload = function() {
  main();
};

var main = async function() {
  var year = "2010";
  var fileName = "Data/ghg_data.json";
  country_data = await fetch(fileName)
    .then((response) => {
      return response.json();
    });
};

var preprocess = function(data, year) {
  json_data = JSON.parse(data);
  countries = [];
  for (let i = 0; i < json_data.length; i++) {
    country_name = json_data[i].country_or_area;
    let country = {
      name:country_name
    };
    i++;
    while (i < json_data.length || json_data[i].country_or_area == country_name) {
      eval("country." + Object.keys(json_data[i])[3] + ":" + json_data[i].value);
      i++;
    }


  }
  return json_data;
};
