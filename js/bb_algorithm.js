// bb_algorithm.js - TSP using LCBB (Least Cost Branch and Bound)
// Every important thing that happens is saved in the list "steps".
// The pages only play this list like a movie.

var steps, live, bestCost, bestPath, bestNode;          // steps list, live nodes, best tour so far
var created, expanded, pruned, maxQueue;      // counters for the resource graph

// makes a copy of a matrix
function copyMatrix(m) {
  var copy = [];
  for (var i = 0; i < m.length; i++) {
    copy.push(m[i].slice());
  }
  return copy;
}
// (0,2,1) -> [1,3,2]   (cities are shown from 1)
function cityNumbers(path) {
  var numbers = [];
  for (var i = 0; i < path.length; i++) {
    numbers.push(path[i] + 1);
  }
  return numbers;
}

// Row reduction then column reduction. Returns how much we subtracted in total.
function reduceMatrix(m) {
  var n = m.length;
  var total = 0;
  for (var i = 0; i < n; i++) {                    // rows
    var smallest = Infinity;
    for (var j = 0; j < n; j++) {
      if (m[i][j] < smallest) { smallest = m[i][j]; }
    }
    if (smallest != Infinity && smallest > 0) {
      total = total + smallest;
      for (j = 0; j < n; j++) { m[i][j] = m[i][j] - smallest; }
    }
  }
  for (var c = 0; c < n; c++) {                    // columns
    var smallestInColumn = Infinity;
    for (var r = 0; r < n; r++) {
      if (m[r][c] < smallestInColumn) { smallestInColumn = m[r][c]; }
    }
    if (smallestInColumn != Infinity && smallestInColumn > 0) {
      total = total + smallestInColumn;
      for (r = 0; r < n; r++) { m[r][c] = m[r][c] - smallestInColumn; }
    }
  }
  return total;
}

// saves one step
function addStep(node, status, text) {
  steps.push({
    id: node.id, parent: node.parent, label: node.label, cost: node.cost, status: status,
    path: cityNumbers(node.path), matrix: copyMatrix(node.matrix), text: text,
    created: created, expanded: expanded, pruned: pruned, maxQueue: maxQueue
  });
}
// removes and returns the live node with the least cost
function takeLeastCostNode() {
  var position = 0;
  for (var i = 1; i < live.length; i++) {
    if (live[i].cost < live[position].cost) { position = i; }
  }
  return live.splice(position, 1)[0];
}

function solveBB(matrix) {
  var startTime = performance.now();
  var n = matrix.length;
  steps = [];
  live = [];
  bestCost = Infinity;
  bestPath = [];
  bestNode = Infinity;
  created = 1;
  expanded = 0;
  pruned = 0;
  maxQueue = 1;
  var nextId = 1;

  // STEP 1: root node = reduce the original matrix
  var rootMatrix = copyMatrix(matrix);
  var rootCost = reduceMatrix(rootMatrix);
  var root = {id: 0, parent: null, label: '1', path: [0], matrix: rootMatrix, cost: rootCost};
  live.push(root);
  addStep(root, 'live', 'Root node: reduce rows and columns. Cost (lower bound) = ' + rootCost);

  // STEP 2: repeat while live nodes exist
  while (live.length > 0) {
    var node = takeLeastCostNode();

    if (node.cost >= bestCost) {                   // cannot beat the best tour -> prune
      pruned++;
      addStep(node, 'pruned', 'Node ' + node.id + ': cost ' + node.cost + ' >= best tour ' + bestCost + ', so it is PRUNED');
      continue;
    }

    expanded++;
    addStep(node, 'expanded', 'Expand node ' + node.id + '. It has the LEAST cost (' + node.cost + ') among live nodes');

    // make one child for every city we can still visit
    var i = node.path[node.path.length - 1];       // city where we are now
    for (var j = 0; j < n; j++) {
      if (node.path.indexOf(j) >= 0) { continue; } // already visited
      if (node.matrix[i][j] == Infinity) { continue; }

      var m = copyMatrix(node.matrix);
      var distance = m[i][j];
      for (var k = 0; k < n; k++) {                // row i and column j become infinity
        m[i][k] = Infinity;
        m[k][j] = Infinity;
      }
      if (node.path.length + 1 < n) {              // do not return to city 1 too early
        m[j][0] = Infinity;
      }
      var reduction = reduceMatrix(m);
      var childCost = node.cost + distance + reduction;

      var child = {id: nextId, parent: node.id, label: String(j + 1), path: node.path.concat([j]), matrix: m, cost: childCost};
      nextId++;
      created++;
      var text = 'Edge ' + (i + 1) + '->' + (j + 1) + ': cost = parent ' + node.cost + ' + d(' + (i + 1) + ',' + (j + 1) + ') ' +
                 distance + ' + reduction ' + reduction + ' = ' + childCost;

      if (child.path.length == n) {                // all cities visited: a complete tour
        if (childCost < bestCost) {
          bestCost = childCost;
          bestPath = cityNumbers(child.path).concat([1]);
          bestNode = child;
          addStep(child, 'best', text + '. All cities visited: NEW BEST TOUR, cost = ' + childCost);
        } else {
          pruned++;
          addStep(child, 'pruned', text + '. Tour is not better than ' + bestCost + ', PRUNED');
        }
      } else if (childCost >= bestCost) {          // too expensive: prune
        pruned++;
        addStep(child, 'pruned', text + '. ' + childCost + ' >= best ' + bestCost + ', so PRUNED');
      } else {                                     // keep it as a live node
        live.push(child);
        if (live.length > maxQueue) { maxQueue = live.length; }
        addStep(child, 'live', text + '. Added to live nodes');
      }
    }
  }

  if (bestNode != null) {
    addStep(bestNode, 'done', 'DONE: no live nodes left. Best tour = ' + bestPath.join(' -> ') + ', cost = ' + bestCost);
  }
  
  var timeTaken = Math.round((performance.now() - startTime) * 1000) / 1000;
  return {steps: steps, best_cost: bestCost, best_path: bestPath, time_ms: timeTaken};
}
