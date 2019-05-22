window.onload = function() {
  var year = "2000";
  var fileName = 'Data/ghg_data.json';
  var txtFile = new XMLHttpRequest();
  txtFile.onreadystatechange = () => {
    if (txtFile.readyState === 4 && txtFile.status == 200) {
      main(preprocess(txtFile.responseText));
    }
  }
  txtFile.open("GET", fileName);
  txtFile.send();
};

var main = function(year) {

}

var preprocess = function(data, year) {
  json_data = JSON.parse(data);
  console.log(json_data);
  for (let i = 0; i < json_data.length; i++) {
    categories = [];
    country_name = json_data[i]["country_or_area"];
    let country = {
      name:country_name
    };
    i++;
    while (i < json_data.length || json_data[i]["country_or_area"] == country_name) {
      eval("country." + Object.keys(json_data[i])[3] + ":" + json_data[i]["value"]);
    }
  }
  return json_data;
}
