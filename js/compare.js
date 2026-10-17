// compare.js - complexity numbers, slider and the two line charts

// numbers for n = 2 to 20
var data = [];
var factorial = 1;
for (var n = 1; n <= 20; n++) {
  factorial = factorial * n;                     // n!
  if (n >= 2) {
    data.push({
      n: n,
      bb_time: factorial,                        // Branch and Bound worst case time: n!
      dp_time: n * n * Math.pow(2, n),           // DP time: n^2 * 2^n
      bb_space: n * n * factorial,               // B&B worst case space: n! nodes, each with an n x n matrix
      dp_space: n * Math.pow(2, n)               // DP space: n * 2^n table cells
    });
  }
}

// chart settings used by the helper functions below
var chartWidth = 520, chartHeight = 320, chartPad = 50;
var chartMax = 1;
var useLog = true;

function update() {
  var n = Number(document.getElementById('nSlider').value);
  useLog = document.getElementById('logScale').checked;
  document.getElementById('nValue').innerText = n;
  drawChart('timeCanvas', 'bb_time', 'dp_time', n);
  drawChart('spaceCanvas', 'bb_space', 'dp_space', n);

  var row = data[n - 2];
  var betterTime = 'Branch and Bound';
  if (row.dp_time < row.bb_time) { betterTime = 'Dynamic Programming'; }
  var betterSpace = 'Branch and Bound';
  if (row.dp_space < row.bb_space) { betterSpace = 'Dynamic Programming'; }

  document.getElementById('valueTable').innerHTML =
    '<table class="matrix"><tr><th></th><th>Time (operations)</th><th>Space (memory units)</th></tr>' +
    '<tr><th>Branch and Bound (worst case)</th><td>' + row.bb_time.toExponential(2) + '</td><td>' + row.bb_space.toExponential(2) + '</td></tr>' +
    '<tr><th>Dynamic Programming</th><td>' + row.dp_time.toExponential(2) + '</td><td>' + row.dp_space.toExponential(2) + '</td></tr>' +
    '<tr><th>Better (worst case)</th><td>' + betterTime + '</td><td>' + betterSpace + '</td></tr></table>' +
    '<p>Note: the B&B numbers are the worst case. With good pruning B&B usually needs much less.</p>';
}

// log scale turns 1000000 into 6, so huge and small numbers fit in one chart
function chartValue(v) {
  if (useLog) { return Math.log10(v); }
  return v;
}
function chartX(index) {
  return chartPad + index / (data.length - 1) * (chartWidth - 2 * chartPad);
}
function chartY(v) {
  return chartHeight - chartPad - chartValue(v) / chartMax * (chartHeight - 2 * chartPad);
}

function drawChart(canvasId, key1, key2, n) {
  var ctx = document.getElementById(canvasId).getContext('2d');
  ctx.clearRect(0, 0, chartWidth, chartHeight);

  // the biggest value decides the height of the chart
  chartMax = 1;
  for (var i = 0; i < data.length; i++) {
    if (chartValue(data[i][key1]) > chartMax) { chartMax = chartValue(data[i][key1]); }
    if (chartValue(data[i][key2]) > chartMax) { chartMax = chartValue(data[i][key2]); }
  }
  // grid lines and numbers on the left
  ctx.font = '11px Arial';
  ctx.fillStyle = 'black';
  for (var t = 0; t <= 4; t++) {
    var value = chartMax * t / 4;
    var y = chartHeight - chartPad - t / 4 * (chartHeight - 2 * chartPad);
    if (useLog) { ctx.fillText('10^' + Math.round(value), 2, y + 4); } else { ctx.fillText(value.toExponential(0), 2, y + 4); }
    drawLine(ctx, {x: chartPad, y: y}, {x: chartWidth - chartPad, y: y}, '#e2e8f0', 1);
  }
  // numbers of cities below
  for (i = 0; i < data.length; i += 3) { ctx.fillText(data[i].n, chartX(i) - 4, chartHeight - chartPad + 15); }
  ctx.fillText('n (cities)', chartWidth / 2 - 20, chartHeight - 8);

  // red line = Branch and Bound, blue line = DP
  for (i = 0; i < data.length - 1; i++) {
    drawLine(ctx, {x: chartX(i), y: chartY(data[i][key1])}, {x: chartX(i + 1), y: chartY(data[i + 1][key1])}, '#e53e3e', 3);
    drawLine(ctx, {x: chartX(i), y: chartY(data[i][key2])}, {x: chartX(i + 1), y: chartY(data[i + 1][key2])}, '#2b6cb0', 3);
  }
  // green vertical line = selected n
  drawLine(ctx, {x: chartX(n - 2), y: chartPad}, {x: chartX(n - 2), y: chartHeight - chartPad}, '#38a169', 2);
  ctx.fillStyle = '#e53e3e';
  ctx.fillText('Branch and Bound', chartPad + 10, chartPad - 25);
  ctx.fillStyle = '#2b6cb0';
  ctx.fillText('Dynamic Programming', chartPad + 130, chartPad - 25);
}

update();
