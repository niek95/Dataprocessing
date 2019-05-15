/*jshint esversion: 6 */

window.onload = function() {
  main("2001");
};


var main = function(year) {
  var requestURL = "https://api.themoviedb.org/3/discover/movie?api_key=" +
  "2fcecca4f148e5898e10016fc6753ff4&language=en-US&sort_by=vote_count.desc" +
  "&include_adult=false&include_video=false&primary_release_year=" + year +
  "&vote_count.gte=1000";
  var request1 = new XMLHttpRequest();
  request1.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        var movie_data = JSON.parse(this.responseText);
        movies = preprocess(movie_data);
        build_chart(movies);
    }
  };
  request1.open("GET", requestURL);
  request1.send();
};

var preprocess = function(data) {
  console.log("importing movies");
  movies = [];
  urls = [];
  for(let i in data.results) {
    let movie = {
      id:data.results[i].id,
      title:data.results[i].title,
      vote_average:data.results[i].vote_average,
      genre:data.results[i].genre_ids
    };
    movie = get_financial_data(movie);
    movies.push(movie);
  }
  console.log(movies);
  };

var get_financial_data = function(movie) {
  console.log("adding budget and revenue");
  fetch("https://api.themoviedb.org/3/movie/" + movie.id +
    "?api_key=2fcecca4f148e5898e10016fc6753ff4&language=en-US")
    .then(function(response) {
      return response.json();
    })
    .then(function(details) {
      movie.budget = details.budget;
      movie.revenue = details.revenue;
    });
    return movie;
};

var convert_genres = function(movies) {

};

var build_chart = function() {

};

var sort_list = function() {

};
