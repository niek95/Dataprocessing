d3.select("head")
  .append("title")
  .text("Number of superbowl appearances per team");
d3.select("body")
  .append("h3")
  .text("Number of superbowl appearances per team");
d3.select("body")
  .append("p")
  .text("Niek Slemmer " + "12639184");
d3.select("body")
  .append("p")
  .text("Here you see a visualization of every Super bowl ever played. " +
    "The chart is sorted by the amount of wins, represented by the green " +
    "part of the bar");

var fileName = "Super_bowl.json";
var txtFile = new XMLHttpRequest();
txtFile.onreadystatechange = function() {
  if (txtFile.readyState === 4 && txtFile.status == 200) {
    data = JSON.parse(txtFile.responseText);
    build_chart(data);
  }
}

txtFile.open("GET", fileName);
txtFile.send();

var team = function(name) {
  this.name = name;
  this.wins = 0;
  this.losses = 0;
}

var build_chart = function(data) {
  var w = 600;
  var h = 600;
  var dataset = [ 5, 10, 15, 20, 25 ];
  var barPadding = 2;
  var topPadding = 25;
  var sidePadding = 150;
  var teams = import_teams(data);
  var x_domain = [0,12];
  var x_range = [0, w - (sidePadding * 2)]

  // set scale for x-axis
  var x_scale = d3.scaleLinear()
    .domain(x_domain)
    .range(x_range);
  var axis_scale = d3.scaleLinear()
    .domain(x_domain)
    .range([sidePadding, w - sidePadding]);

  var x_axis = d3.axisTop(axis_scale)
    .ticks(x_domain[1])
    .tickFormat(function(d) {
      return d;
    });

  // create svg and draw axis and text
  var svg = d3.select("body")
    .append("svg")
    .attr("width", w)
    .attr("height", h)

  g_axis = svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + topPadding + ")")
    .call(x_axis);

  svg.append("text")
    .attr("x", w / 2)
    .attr("y", h - topPadding / 2)
    .style("text-anchor", "middle")
    .text("appearances")

  for(var i = 0; i < teams.length; i++) {
    let textSize = 15;
    svg.append("text")
      .attr("x", 0)
      .attr("y", i * ((h - topPadding * 2) / teams.length) + topPadding + textSize)
      .text(teams[i].name)
      .style("font-size", textSize)
  }


  for(let i = 2; i < x_domain[1]; i = i + 2) {
    console.log("drawing line")
    svg.append("line")
      .attr("x1", sidePadding + x_scale(i))
      .attr("y1", topPadding)
      .attr("x2", sidePadding + x_scale(i))
      .attr("y2", h - topPadding)
      .attr("stroke-width", 1)
      .attr("stroke", "gray")
    }

  // draw bars
  var g = svg.selectAll("rect-win")
    .data(teams)
    .enter()
    .append("g")
    .classed("rect-win", true);

  // draw wins
  g.append("rect")
    .attr("x", sidePadding)
    .attr("width", function(d) {
      return x_scale(d.wins);
    })
    .attr("height", (h - topPadding) / teams.length - barPadding)
    .attr("y", function(d, i) {
      return i * ((h - topPadding * 2) / teams.length) + topPadding;
    })
    .attr("fill", "green")
    .on("mouseover", mouse_over_win)
    .on("mouseout", mouse_out_win);

  var g = svg.selectAll("rect-lose")
    .data(teams)
    .enter()
    .append("g")
    .classed("rect-lose", true);

  // draw losses
  g.append("rect")
    .attr("width", function(d) {
      return x_scale(d.losses);
    })
    .attr("height", (h - topPadding) / teams.length - barPadding)
    .attr("x", function(d, i) {
      return x_scale(d.wins) + sidePadding;
    })
    .attr("y", function(d, i) {
      return i * ((h - topPadding * 2) / teams.length) + topPadding;
    })
    .attr("fill", "red")
    .on("mouseover", mouse_over_lose)
    .on("mouseout", mouse_out_lose);;

  // add interactivity
  function mouse_over_win(d, i) {
    d3.select(this).attr("fill", "rgb(0,100,0)");
  }

  function mouse_out_win(d, i) {
    d3.select(this).attr("fill", "green")
  }
  function mouse_over_lose(d, i) {
    d3.select(this).attr("fill", "rgb(139,0,0)");
  }

  function mouse_out_lose(d, i) {
    d3.select(this).attr("fill", "red")
  }

}

var import_teams = function(data) {
  console.log("importing teams")
  var teams = [];
  for(let i = 0; i < data.length; i++) {
    let superbowl = data[i];
    console.log(data[i]["Winner"]);
    console.log(data[i]["Loser"])
    let winner_added = false;
    let loser_added = false;
    for(let j = 0; j < teams.length; j++) {
      if (teams[j].name === superbowl["Winner"]) {
        teams[j].wins++;
        winner_added = true;
      }
      if (teams[j].name === superbowl["Loser"]) {
        teams[j].losses++;
        loser_added = true;
      }
    }
    if (!winner_added) {
      teams.push(new team(superbowl["Winner"]));
      teams[teams.length - 1].wins++;
      console.log("winner added");
    }
    if (!loser_added) {
      teams.push(new team(superbowl["Loser"]));
      teams[teams.length - 1].losses++
      console.log("loser added");
    }
  }
  return sort_by_win(teams);
}

var sort_by_total = function(teams) {
  function compare(a, b) {
    if (a.wins + a.losses > b.wins + b.losses) {
      return -1;
    }
    if (a.wins + a.losses < b.wins + b.losses) {
      return 1;
    }
    return sort_by_lose([a,b]);
  }
  return teams.sort(compare);
}

var sort_by_win = function(teams) {
  function compare(a, b) {
    if (a.wins > b.wins) {
        return -1;
    } else if (a.wins < b.wins) {
        return 1;
    } else if (a.wins + a.losses > b.wins + b.losses) {
        return -1;
    } else if (a.wins + a.losses < b.wins + b.losses) {
        return +1;
    }
    return sort_by_total([a,b]);
  }
  return teams.sort(compare);
}

var sort_by_lose = function(teams) {
  function compare(a, b) {
    if (a.losses > b.losses) {
      return -1;
    }
    if (a.losses < b.losses) {
      return 1;
    }
    return 0;
  }
  return teams.sort(compare);
}
