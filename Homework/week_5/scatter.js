/*jshint esversion: 8 */

window.onload = function() {
  var year = "2000";
  var dependant = "revenue";
  d3.selectAll(".year")
    .on("click", function() {
        main(this.getAttribute("value"), dependant);
        year = this.getAttribute("value");
    });
  d3.selectAll(".dependant")
    .on("click", function() {
        main(year, this.getAttribute("value"));
        dependant = this.getAttribute("value");
    });
  main(year, dependant);
};


var main = async function(year, dependant) {
  d3.select("svg").remove();
  movie_data = await fetch("https://api.themoviedb.org/3/discover/movie?api_key=" +
  "2fcecca4f148e5898e10016fc6753ff4&language=en-US&sort_by=vote_count.desc" +
  "&include_adult=false&include_video=false&primary_release_year=" + year +
  "&vote_count.gte=1000")
    .then(function(response) {
      return response.json();
    });
  movies = await preprocess(movie_data);
  build_chart(movies, dependant);
};

var preprocess = function(data) {
  // turn data into js objects and import additional info
  console.log("importing movies");
  var movies = data.results.map(function(item) {
    let movie = {
      id:item.id,
      title:item.title,
      vote_average:item.vote_average,
      genre:item.genre_ids
    };
    return movie;
  });
  let urls = [];
  for(let i in movies) {
    urls.push(fetch("https://api.themoviedb.org/3/movie/" + movies[i].id +
      "?api_key=2fcecca4f148e5898e10016fc6753ff4&language=en-US")
        .then(function(response) {
          return response.json();
        })
        .then(function(details) {
          movies[i].budget = details.budget;
          movies[i].revenue = details.revenue;
        }));
  }
  return Promise.all(urls)
    .then(function() {
      return(clean(movies));
    });
};

var clean = function(movies) {
  movies.forEach(function(element) {
    if(typeof element.revenue == "undefined" ||
      typeof element.budget == "undefined" ||
      typeof element.vote_average == "undefined") {
        movies.remove(element);
    }
  });
  return movies;
};

var convert_genres = function(movies) {

};

var build_chart = function(movies, dependant) {
  sorted_movies = sort_by_budget(movies, "budget");
  console.log(sorted_movies);
  var w = 600;
  var h = 600;
  var topPadding = 50;
  var sidePadding = 50;
  var point_size = w / 100;
  var max_x = sort_by_budget(movies)[movies.length - 1].budget;
  if(dependant == "revenue") {
    var max_y = sort_by_revenue(movies)[movies.length - 1].revenue;
  } else {
    var max_y = 10;
  }
  var x_domain = [0, max_x];
  var x_range = [0, w - (sidePadding * 2)];
  var y_domain = [0, max_y];
  var y_range = [h - (topPadding * 2), 0];

  var x_scale = d3.scaleLinear()
    .domain(x_domain)
    .range(x_range);

  var y_scale = d3.scaleLinear()
    .domain(y_domain)
    .range(y_range);

  var descale = d3.scaleLinear()
    .domain(x_range)
    .range(x_domain);

  var x_axis_scale = d3.scaleLinear()
    .domain(x_domain)
    .range([sidePadding, w - sidePadding]);

  var y_axis_scale = d3.scaleLinear()
    .domain(y_domain)
    .range([h - topPadding, topPadding]);


  var x_axis = d3.axisBottom(x_axis_scale)
    .ticks(10)
    .tickFormat(function(d) {
      return d / 1000000;
    });

  var y_axis = d3.axisLeft(y_axis_scale)
    .ticks(10)
    .tickFormat(function(d) {
      if(dependant == "revenue") {
        return d / 1000000;
      }
      return d;
    });

  //Create SVG element
  var svg = d3.select("body")
    .append("svg")
    .attr("width", w)
    .attr("height", h);

  svg.selectAll("circle")
   .data(sorted_movies)
   .enter()
   .append("circle")
   .attr("cx", function(d) {
     return sidePadding + x_scale(d.budget);
   })
   .attr("cy", function(d) {
     if(dependant == "revenue") {
       return topPadding + y_scale(d.revenue);
     }
     return topPadding + y_scale(d.vote_average);
   })
   .attr("r", point_size);

   // create svg and draw axis and text
   g_x_axis = svg.append("g")
     .attr("class", "axis")
     .attr("transform", "translate(0," + (h - topPadding) + ")")
     .call(x_axis);

   g_y_axis = svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + (sidePadding) + ",0)")
    .call(y_axis);

   svg.append("text")
     .attr("x", w / 2)
     .attr("y", h - topPadding / 3)
     .style("text-anchor", "middle")
     .text("Budget(# million dollars)");

   if(dependant == "revenue") {
     svg.append("text")
      .attr("x", w / 2)
      .attr("y", - topPadding / 6)
      .style("text-anchor", "middle")
      .attr("transform", "rotate(90)")
      .text("Revenue(# million dollars)");
   } else {
     svg.append("text")
      .attr("x", w / 2)
      .attr("y", - topPadding / 6)
      .style("text-anchor", "middle")
      .attr("transform", "rotate(90)")
      .text("Vote average");
   }
};

var sort_by_budget = function(movies, criterium) {
  function compare(a, b) {
    if (a.budget > b.budget) {
      return 1;
    }
    if (a.budget < b.budget) {
      return -1;
    }
    return 0;
  }
  return movies.sort(compare);
};

var sort_by_revenue = function(movies) {
  function compare(a, b) {
    if (a.revenue > b.revenue) {
      return 1;
    }
    if (a.revenue < b.revenue) {
      return -1;
    }
    return 0;
  }
  return movies.sort(compare);
};

var sort_by_vote = function(movies) {
  function compare(a, b) {
    if (a.vote_average > b.vote_average) {
      return 1;
    }
    if (a.vote_average < b.vote_average) {
      return -1;
    }
    return 0;
  }
  return movies.sort(compare);
};
