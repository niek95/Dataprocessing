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
d3.select("body").selectAll("p")
  .data()
