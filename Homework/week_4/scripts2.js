svg.selectAll("rect")
  .data(teams)
  .enter()
  .append("rect")
  .attr("x", 0)
  .attr("y", 0)
  .attr("width", function(d) {
    return d.losses * 20;
  })
  .attr("height", h / teams.length - barPadding)
  .attr("x", function(d, i) {
    return d.wins * 20;
  })
  .attr("y", function(d, i) {
    return i * (h / teams.length);
  })
  .attr("fill", "red");


  else if (a.wins + a.losses > b.wins + b.losses) {
      return -1;
  } else if (a.wins + a.losses > b.wins + b.losses) {
      return -1;
  } 
