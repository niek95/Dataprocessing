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
  var w = 500;
  var h = 500;
  var dataset = [ 5, 10, 15, 20, 25 ];
  var barPadding = 1;
  var barsPadding = 15;
  var teams = import_teams(data);
  var x_domain = [0,12];
  var x_range = [0,w]

  var x_scale = d3.scaleLinear()
    .domain(x_domain)
    .range(x_range);

  var x_axis = d3.axisBottom(x_scale)
    .ticks(x_domain[1])
    .tickFormat(function(d) {
      return d;
    });
  var svg = d3.select("body")
    .append("svg")
    .attr("width", w)
    .attr("height", h)

  var g = svg.selectAll(".rect")
    .data(teams)
    .enter()
    .append("g")
    .classed("rect", true)

  g.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", function(d) {
      return x_scale(d.wins);
    })
    .attr("height", (h - barsPadding) / teams.length - barPadding)
    .attr("y", function(d, i) {
      return i * ((h - barsPadding) / teams.length) + barsPadding;
    })
    .attr("fill", "green");

  g.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", function(d) {
      return x_scale(d.losses);
    })
    .attr("height", (h - barsPadding) / teams.length - barPadding)
    .attr("x", function(d, i) {
      return x_scale(d.wins);
    })
    .attr("y", function(d, i) {
      return i * ((h - barsPadding) / teams.length) + barsPadding;
    })
    .attr("fill", "red");
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
