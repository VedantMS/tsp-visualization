// dp.js - draws one step of the Dynamic Programming page
initInput(10);                // at most 10 cities
var matrix = [];
var result = null;
var rowNames = [];            // name of every row of the table, e.g. "{1,2,3}"
var rowCities = [];           // cities inside every row

function startRun() {
  matrix = readMatrix();
  if (matrix == null) { return; }
  result = solveDP(matrix);

  // the rows of the table = every subset, in the order they appear in the steps
  rowNames = [];
  rowCities = [];
  for (var t = 0; t < result.steps.length; t++) {
    var s = result.steps[t];
    if (rowNames.length == 0 || rowNames[rowNames.length - 1] != s.name) {
      rowNames.push(s.name);
      rowCities.push(getSubsetCities(s.name));
    }
  }
  document.getElementById('result').innerHTML = '<b>Best cost: ' + result.best_cost + '</b><br>Best path: ' +
    result.best_path.join(' -> ') + '<br>Time taken: ' + result.time_ms + ' ms';
  setSteps(result.steps, drawDP);
  playSteps();
}
// "{1,2,3}" -> [1,2,3]    "{}" -> []
function getSubsetCities(name) {
  var text = name.replace('{', '').replace('}', '');
  if (text == '') { return []; }
  var parts = text.split(',');
  var cities = [];
  for (var i = 0; i < parts.length; i++) { cities.push(Number(parts[i])); }
  return cities;
}

// draws everything for step number k
function drawDP(k) {
  var step = steps[k];
  var n = matrix.length;

  // value of every cell that is finished up to step k (key = "i|{S}")
  var filled = {};
  for (var t = 0; t <= k; t++) {
    filled[steps[t].i + '|' + steps[t].name] = steps[t].best;
  }
  // which cell is being calculated and which cells are compared?
  var nowKey = step.i + '|' + step.name;
  var candidateKeys = [];
  for (var q = 0; q < step.cands.length; q++) {
    candidateKeys.push(step.cands[q].k + '|' + step.cands[q].restName);     // C(k, S-{k})
  }

  // build the table: one row per subset S, one column per start city i = 1..n
  var html = '<table class="dp"><tr><th>S \\ i</th>';
  for (var i = 1; i <= n; i++) { html += '<th>' + i + '</th>'; }
  html += '</tr>';
  for (var r = 0; r < rowNames.length; r++) {
    html += '<tr><th>' + rowNames[r] + '</th>';
    var lastRow = (rowCities[r].length == n - 1);
    for (i = 1; i <= n; i++) {
      var key = i + '|' + rowNames[r];
      var possible = (rowCities[r].indexOf(i) < 0);          // i must not be inside S
      if (i == 1 && !lastRow) { possible = false; }          // city 1 only starts in the last row
      if (i != 1 && lastRow) { possible = false; }
      if (!possible) {
        html += '<td class="na">-</td>';
        continue;
      }
      var cssClass = '';                                      // grey = not computed yet
      if (filled[key] !== undefined) { cssClass = 'done'; }
      if (candidateKeys.indexOf(key) >= 0) { cssClass = 'cand'; }
      if (key == nowKey) { cssClass = 'now'; }
      var value = '';
      if (filled[key] !== undefined) { value = filled[key]; }
      var id = '';
      if (key == nowKey) { id = ' id="nowCell"'; }
      html += '<td class="' + cssClass + '"' + id + '>' + value + '</td>';
    }
    html += '</tr>';
  }
  var box = document.getElementById('tableBox');
  box.innerHTML = html + '</table>';
  var nowCell = document.getElementById('nowCell');      // scroll so the current cell is visible
  if (nowCell) { box.scrollTop = nowCell.offsetTop - 120; }

  // graph, texts and bars
  if (step.final) {
    drawGraph('graphCanvas', matrix, step.path, true, []);
    document.getElementById('round').innerText = '(Last cell: C(1, {2..' + n + '}) = the answer)';
  } else {
    drawGraph('graphCanvas', matrix, [step.from, step.i], false, step.cities);
    document.getElementById('round').innerText = '(|S| = ' + step.s + ' of ' + (n - 1) + ')';
  }
  document.getElementById('explain').innerText = step.text;
  showLog(k);
  drawBars('barCanvas', ['Cells computed', 'Total cells'], [step.count, result.total_cells], ['#48bb78', '#a0aec0']);
  document.getElementById('resources').innerText = 'Memory used: ' + step.count + ' of ' + result.total_cells + ' table cells';
}

function sendSalesman() {
  if (result == null) { alert('Press Start first'); return; }
  driveSalesman('graphCanvas', matrix, result.best_path);
}