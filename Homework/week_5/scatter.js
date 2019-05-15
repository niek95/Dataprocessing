/*jshint esversion: 8 */

window.onload = function() {
  main("2001");
};


var main = async function(year) {
  movie_data = await fetch("https://api.themoviedb.org/3/discover/movie?api_key=" +
  "2fcecca4f148e5898e10016fc6753ff4&language=en-US&sort_by=vote_count.desc" +
  "&include_adult=false&include_video=false&primary_release_year=" + year +
  "&vote_count.gte=1000")
    .then(function(response) {
      return response.json();
    });
  movies = await preprocess(movie_data);
  build_chart(movies);
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
      return movies;
    });
};

var convert_genres = function(movies) {

};

var build_chart = function(movies) {
  sorted_movies = sort_by_budget(movies, "budget");
  console.log(sorted_movies);
  var w = 600;
  var h = 600;
  var topPadding = 25;
  var sidePadding = 25;
  var point_size = w / 100;
  var max_x = sort_by_budget(movies, "budget")[movies.length - 1].budget;
  var max_y = sort_by_revenue(movies, "revenue")[movies.length - 1].revenue;
  var x_domain = [0, max_x];
  var x_range = [0, w - (sidePadding * 2)];
  var y_domain = [0, sorted_movies[movies.length - 1].revenue];
  var y_range = [0, w - (topPadding * 2)];

  var x_scale = d3.scaleLinear()
    .domain(x_domain)
    .range(x_range);

  var y_scale = d3.scaleLinear()
    .domain(y_domain)
    .range(y_range);

  var descale = d3.scaleLinear()
    .domain(x_range)
    .range(x_domain);

  var axis_scale = d3.scaleLinear()
    .domain(x_domain)
    .range([sidePadding, w - sidePadding]);

  var x_axis = d3.axisBottom(axis_scale)
    .ticks(w / 60)
    .tickFormat(function(d) {
      return d / 1000000;
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
        return h - topPadding - y_scale(d.revenue);
   })
   .attr("r", point_size);

   // create svg and draw axis and text
   g_axis = svg.append("g")
     .attr("class", "axis")
     .attr("transform", "translate(0," + topPadding + ")")
     .call(x_axis);
};

var sort_by_budget = function(movies, criterium) {
  console.log("sorting by " + criterium);
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

var sort_by_revenue = function(movies, criterium) {
  console.log("sorting by " + criterium);
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
