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
  movies = preprocess(movie_data);
  console.log(movies)
};

var preprocess = function(data) {
  console.log("importing movies");
  movies = data.results.map(async function(item) {
    let movie = {
      id:item.id,
      title:item.title,
      vote_average:item.vote_average,
      genre:item.genre_ids
    };
    return await get_financial_data(movie);
  });

  return movies;
};

var get_financial_data = async function(movie) {
  console.log("adding budget and revenue");
  return await fetch("https://api.themoviedb.org/3/movie/" + movie.id +
    "?api_key=2fcecca4f148e5898e10016fc6753ff4&language=en-US")
    .then(function(response) {
      return response.json();
    })
    .then(function(details) {
      movie.budget = details.budget;
      movie.revenue = details.revenue;
      return movie;
    });
};

var convert_genres = function(movies) {

};

var build_chart = function(movies) {
  sorted_movies = sort_list(movies, "budget");
  console.log(sorted_movies);
  var w = 600;
  var h = 600;
  var topPadding = 25;
  var sidePadding = 25;
  var x_max = 0;
  var x_domain = [0, sorted_movies[movies.length - 1].budget];
  var x_range = [0, w - (sidePadding * 2)];

  //Create SVG element
  var svg = d3.select("body")
    .append("svg")
    .attr("width", w)
    .attr("height", h);
};

var sort_list = function(movies, criterium) {
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
