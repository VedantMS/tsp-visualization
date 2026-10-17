// common.js - code used by both algorithm pages

// Predefined 5-city distance matrix (Infinity = no road from a city to itself)
var PREDEFINED = [
  [Infinity, 20, 30, 10, 11],
  [15, Infinity, 16, 4, 2],
  [3, 5, Infinity, 2, 4],
  [19, 6, 18, Infinity, 3],
  [16, 4, 7, 16, Infinity]
];

var steps = [];            // every step of the algorithm
var current = 0;           // number of the step on the screen
var timer = null;          // timer that plays the steps one by one
var drawFunction = null;   // function of the page that draws one step
var truckTimer = null;     // timer of the salesman truck
var truck = {};            // information of the salesman truck

// ---------------- player: Start / Pause / Next / Previous / Reset ----------------
function setSteps(list, functionToDraw) {
  steps = list;
  drawFunction = functionToDraw;
  stopSteps();
  showStep(0);
}
function showStep(number) {
  current = number;
  drawFunction(number);
  document.getElementById('stepInfo').innerText = ' Step ' + (number + 1) + ' of ' + steps.length;
}
function nextStep() {
  if (current < steps.length - 1) {
    showStep(current + 1);
  } else {
    stopSteps();
  }
}
function prevStep() {
  if (current > 0) {
    showStep(current - 1);
  }
}
function playSteps() {
  if (steps.length == 0) { return; }
  stopSteps();
  var speed = document.getElementById('speed').value;     // 1 to 100
  timer = setInterval(nextStep, 1100 - speed * 10);       // big speed = small delay
}
function stopSteps() {
  clearInterval(timer);
  timer = null;
}
function resetSteps() {
  stopSteps();
  clearInterval(truckTimer);
  if (steps.length > 0) { showStep(0); }
}

// ---------------- input: predefined or user-defined matrix ----------------
function initInput(maxCities) {
  var select = document.getElementById('cityCount');
  for (var n = 3; n <= maxCities; n++) {
    select.innerHTML += '<option value="' + n + '">' + n + ' cities</option>';
  }
  select.value = 5;
  showMatrix();
}
function isUserMode() {
  return document.getElementById('modeSwitch').checked;     // switch ON = user-defined
}
// shows the matrix as a table (read-only for predefined, input boxes for user-defined)
function showMatrix() {
  var user = isUserMode();
  var n = PREDEFINED.length;
  if (user) {
    n = Number(document.getElementById('cityCount').value);
    document.getElementById('cityRow').style.display = 'block';
  } else {
    document.getElementById('cityRow').style.display = 'none';
  }
  var html = '<table class="matrix"><tr><th>d(i,j)</th>';
  for (var j = 0; j < n; j++) { html += '<th>' + (j + 1) + '</th>'; }
  html += '</tr>';
  for (var i = 0; i < n; i++) {
    html += '<tr><th>' + (i + 1) + '</th>';
    for (j = 0; j < n; j++) {
      if (i == j) {
        html += '<td>&infin;</td>';
      } else if (user) {
        var value = Math.floor(Math.random() * 20) + 3;       // random starting value
        html += '<td><input type="number" min="0" id="m_' + i + '_' + j + '" value="' + value + '"></td>';
      } else {
        html += '<td>' + PREDEFINED[i][j] + '</td>';
      }
    }
    html += '</tr>';
  }
  document.getElementById('matrixBox').innerHTML = html + '</table>';
}
// returns the matrix to solve (or null if the user typed something wrong)
function readMatrix() {
  if (!isUserMode()) { return PREDEFINED; }
  var n = Number(document.getElementById('cityCount').value);
  var matrix = [];
  for (var i = 0; i < n; i++) {
    var row = [];
    for (var j = 0; j < n; j++) {
      if (i == j) {
        row.push(Infinity);
      } else {
        var value = parseFloat(document.getElementById('m_' + i + '_' + j).value);
        if (isNaN(value) || value < 0) {
          alert('Please enter a number (0 or more) for d(' + (i + 1) + ',' + (j + 1) + ')');
          return null;
        }
        row.push(value);
      }
    }
    matrix.push(row);
  }
  return matrix;
}
// any matrix as an HTML table
function matrixHtml(m) {
  var html = '<table class="matrix">';
  for (var i = 0; i < m.length; i++) {
    html += '<tr>';
    for (var j = 0; j < m.length; j++) {
      if (m[i][j] == Infinity) {
        html += '<td>&infin;</td>';
      } else {
        html += '<td>' + m[i][j] + '</td>';
      }
    }
    html += '</tr>';
  }
  return html + '</table>';
}

// ---------------- drawing on canvas ----------------
// puts the cities on a circle
function cityPositions(width, height, n) {
  var points = [];
  for (var i = 0; i < n; i++) {
    var angle = 2 * Math.PI * i / n - Math.PI / 2;
    points.push({x: width / 2 + 0.38 * width * Math.cos(angle), y: height / 2 + 0.38 * height * Math.sin(angle)});
  }
  return points;
}
function drawLine(ctx, a, b, color, thickness) {
  ctx.strokeStyle = color;
  ctx.lineWidth = thickness;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
}
// path = cities (1,2,3...) joined by a thick line, visited = cities colored green
function drawGraph(canvasId, matrix, path, isFinal, visited) {
  var canvas = document.getElementById(canvasId);
  var ctx = canvas.getContext('2d');
  var n = matrix.length;
  var points = cityPositions(canvas.width, canvas.height, n);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = '12px Arial';

  // 1. all roads (grey) with their distance
  for (var i = 0; i < n; i++) {
    for (var j = i + 1; j < n; j++) {
      drawLine(ctx, points[i], points[j], '#cbd5e0', 1);
      var label = matrix[i][j];
      if (matrix[i][j] != matrix[j][i]) { label = matrix[i][j] + '|' + matrix[j][i]; }
      ctx.fillStyle = '#4a5568';
      ctx.fillText(label, (points[i].x + points[j].x) / 2, (points[i].y + points[j].y) / 2);
    }
  }
  // 2. the chosen path (green, or gold for the final tour)
  for (var k = 0; k < path.length - 1; k++) {
    var color = '#38a169';
    if (isFinal) { color = '#d69e2e'; }
    drawLine(ctx, points[path[k] - 1], points[path[k + 1] - 1], color, 4);
  }
  // 3. the cities
  for (i = 0; i < n; i++) {
    var cityColor = '#a0aec0';                                     // grey = not visited
    if (visited.indexOf(i + 1) >= 0) { cityColor = '#48bb78'; }    // green = visited
    if (!isFinal && path[path.length - 1] == i + 1) { cityColor = '#4299e1'; }   // blue = current city
    if (isFinal) { cityColor = '#ecc94b'; }                        // gold = final tour
    ctx.fillStyle = cityColor;
    ctx.beginPath();
    ctx.arc(points[i].x, points[i].y, 16, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = 'black';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(i + 1, points[i].x - 4, points[i].y + 5);
    ctx.font = '12px Arial';
  }
}
// simple bar chart
function drawBars(canvasId, labels, values, colors) {
  var canvas = document.getElementById(canvasId);
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  var biggest = 1;
  for (var i = 0; i < values.length; i++) {
    if (values[i] > biggest) { biggest = values[i]; }
  }
  var barSpace = canvas.width / labels.length;
  ctx.font = '12px Arial';
  for (i = 0; i < labels.length; i++) {
    var barHeight = values[i] / biggest * (canvas.height - 60);
    ctx.fillStyle = colors[i];
    ctx.fillRect(i * barSpace + 15, canvas.height - 30 - barHeight, barSpace - 30, barHeight);
    ctx.fillStyle = 'black';
    ctx.fillText(values[i], i * barSpace + 15, canvas.height - 35 - barHeight);
    ctx.fillText(labels[i], i * barSpace + 10, canvas.height - 10);
  }
}
// step log: text of all steps up to number k
function showLog(k) {
  var html = '';
  for (var t = 0; t <= k; t++) {
    html += '<p>' + (t + 1) + '. ' + steps[t].text + '</p>';
  }
  var box = document.getElementById('log');
  box.innerHTML = html;
  box.scrollTop = box.scrollHeight;
}

// ---------------- the salesman truck drives along the best route ----------------
function driveSalesman(canvasId, matrix, path) {
  var canvas = document.getElementById(canvasId);
  truck = {
    canvasId: canvasId, matrix: matrix, path: path,
    points: cityPositions(canvas.width, canvas.height, matrix.length),
    road: 0,            // number of the road (path[road] -> path[road+1])
    progress: 0,        // 0 = start of the road, 1 = end of the road
    travelled: 0        // total distance driven
  };
  stopSteps();
  clearInterval(truckTimer);
  truckTimer = setInterval(moveTruck, 40);
}
function moveTruck() {
  var path = truck.path;
  var from = truck.points[path[truck.road] - 1];
  var to = truck.points[path[truck.road + 1] - 1];
  var ctx = document.getElementById(truck.canvasId).getContext('2d');

  drawGraph(truck.canvasId, truck.matrix, path, true, []);
  ctx.font = '28px Arial';
  ctx.fillText('\uD83D\uDE9A', from.x + (to.x - from.x) * truck.progress - 14, from.y + (to.y - from.y) * truck.progress + 10);
  document.getElementById('salesmanInfo').innerText =
    'Driving ' + path[truck.road] + ' -> ' + path[truck.road + 1] + '   Distance so far: ' + truck.travelled;

  truck.progress = truck.progress + 0.05;
  if (truck.progress >= 1) {                       // reached the next city
    truck.travelled = truck.travelled + truck.matrix[path[truck.road] - 1][path[truck.road + 1] - 1];
    truck.progress = 0;
    truck.road = truck.road + 1;
  }
  if (truck.road >= path.length - 1) {             // back at the start city
    clearInterval(truckTimer);
    document.getElementById('salesmanInfo').innerText = 'Back home! Total distance = ' + truck.travelled;
  }
}
