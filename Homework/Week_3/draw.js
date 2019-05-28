var fileName = 'co2.json';
var txtFile = new XMLHttpRequest();
txtFile.onreadystatechange = function() {
  if (txtFile.readyState === 4 && txtFile.status == 200) {
    data = JSON.parse(txtFile.responseText);
    drawCanvas(data);
  }
}
txtFile.open("GET", fileName);
txtFile.send();

let drawCanvas = function(data){
  // set up canvas
  const canvas = document.getElementById('plot');
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;

  var padding = 40;
  var range = [0 + padding, width - padding];
  var rangeSize = range[1] - range[0];
  var domain = [0 + padding, height - padding];
  var domainSize = domain[1] - domain[0];

  // draw border
  ctx.strokeRect(range[0], domain[0], range[1] - padding, domain[1] - padding)

  // draw title and labels
  ctx.textAlign = 'center';
  ctx.fillText('CO2 concentration in atmosphere, 1958 - 2018', width / 2, padding / 3);
  ctx.fillText('Date', width/2, canvas.height - padding / 3);
  ctx.save();
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = 'left'
  ctx.fillText('CO2 concentration in ppm', width / 2 - width, padding / 4);
  ctx.restore();

  // draw gridlines
  var lineAmount = 5;
  var yStep = domainSize/(lineAmount + 1);
  for (var i = 0; i < lineAmount; i++) {
    ctx.beginPath();
    ctx.strokeStyle = 'gray'
    ctx.moveTo(range[0], domain[0] + (i + 1) * yStep);
    ctx.lineTo(range[1], domain[0] + (i + 1) * yStep);
    ctx.stroke();
    ctx.closePath();
  }

  // preprocess data by extracting co2 level, date and putting them in an
  // array dataPoints, which is ordered by date
  var dataPoints = [];
  var i = 0;
  minValue = data[0].Trend
  maxValue = 0;
  data.forEach(function(element){
    dataPoints.push({'x': i, 'y': Number(element.Trend), 'date': element.Date});
    i++;
    minValue = Math.min(minValue, Number(element.Trend))
    maxValue = Math.max(maxValue, Number(element.Trend))
  })

  // create line functions for x and y
  var xDataSpace = [dataPoints[0].x, dataPoints[dataPoints.length - 1].x];
  var yDataSpace = [minValue, maxValue];
  var xLine = createTransform(xDataSpace, range);
  var yLine = createTransform(yDataSpace, domain);

  // add value labels
  topValue = maxValue;
  for (i = 0; i < lineAmount + 2; i++) {
    ctx.fillText(Math.floor(topValue), range[0] - (padding / 2), domain[0] + i * yStep);
    topValue -= (maxValue - minValue)/lineAmount;
  }
  // set lowest point in bottom left corner and draw line
  ctx.save()
  ctx.translate(0, height)
  ctx.scale(1, -1);
  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'blue';
  ctx.moveTo(xLine(dataPoints[0].x), yLine(dataPoints[0].y));
  for (var i = 1; i < dataPoints.length - 1; i++) {
    var xNew = xLine(dataPoints[i].x);
    var yNew = yLine(dataPoints[i].y);
    ctx.lineTo(xNew, yNew);
  ctx.stroke();
  }

  ctx.restore();
  ctx.textAlign = 'center'
  for (var i = 0; i < dataPoints.length - 1; i++) {
    if (i % 80 === 0) {
      ctx.fillText(dataPoints[i].date, xLine(i), height - 2 * padding / 3 );
    }
  }
}


function createTransform(domain, range){
	// domain is a two-element array of the data bounds [domain_min, domain_max]
	// range is a two-element array of the screen bounds [range_min, range_max]
	// this gives you two equations to solve:
	// range_min = alpha * domain_min + beta
	// range_max = alpha * domain_max + beta
 		// a solution would be:

    var domain_min = domain[0]
    var domain_max = domain[1]
    var range_min = range[0]
    var range_max = range[1]

    // formulas to calculate the alpha and the beta
   	var alpha = (range_max - range_min) / (domain_max - domain_min)
    var beta = range_max - alpha * domain_max

    // returns the function for the linear transformation (y= a * x + b)
    return function(x){
      return alpha * x + beta;
    }
}
