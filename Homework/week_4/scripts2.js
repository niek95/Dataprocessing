var fileName = "Super_bowl.json";
var txtFile = new XMLHttpRequest();
txtFile.onreadystatechange = function() {
  if (txtFile.readyState === 4 && txtFile.status == 200) {
    data = JSON.parse(txtFile.responseText);
    log_files(data);
  }
};
let log_files = function(data) {
  d3.select("body").selectAll("p")
    .data(data)
    .enter()
    .append("p")
    .text(function(d) {
      var return_val = d["Winner"];
      return return_val})
    .style("color", "green")
    .append("p")
    .text(function(d) {
      return " - "})
    .append("p")
    .text(function(d) {
      return d["Loser"]})
    .style("color", "red")
};
txtFile.open("GET", fileName);
txtFile.send();
