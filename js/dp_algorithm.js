// dp_algorithm.js - TSP by dynamic programming, exactly sir's algorithm:
//   C({1},1) = 0
//   for s = 2 to n
//     for all subsets S of size s containing 1
//       for all j in S, j != 1
//         C(S,j) = min{ C(S-{j}, i) + d(i,j)  for i in S, i != j }
//   answer = min over j of  C({1..n}, j) + d(j,1)
// Cities are numbered 1..n here, so d(i,j) is matrix[i-1][j-1].

// [1,2,3] -> "{1,2,3}"   (used as the name of a subset)
function subsetText(list) {
  return '{' + list.join(',') + '}';
}
// returns the subset without one city
function removeCity(list, city) {
  var result = [];
  for (var i = 0; i < list.length; i++) {
    if (list[i] != city) { result.push(list[i]); }
  }
  return result;
}
// all subsets of size s that contain city 1.
// Every number "mask" from 0 to 2^(n-1)-1 is one subset: binary digit b is 1 -> city b+2 is inside.
function getSubsets(s, n) {
  var subsets = [];
  for (var mask = 0; mask < Math.pow(2, n - 1); mask++) {
    var subset = [1];
    for (var b = 0; b < n - 1; b++) {
      if (Math.floor(mask / Math.pow(2, b)) % 2 == 1) { subset.push(b + 2); }
    }
    if (subset.length == s) { subsets.push(subset); }
  }
  return subsets;
}

function solveDP(matrix) {
  var startTime = performance.now();
  var n = matrix.length;
  var C = {};          // C["{1,2,3}|3"] means C({1,2,3}, 3)
  var parent = {};     // remembers which i gave the minimum (to find the tour at the end)
  var steps = [];
  var count = 0;       // how many cells are computed

  C['{1}|1'] = 0;      // C({1},1) = 0

  for (var s = 2; s <= n; s++) {
    var subsets = getSubsets(s, n);
    for (var a = 0; a < subsets.length; a++) {
      var S = subsets[a];
      for (var b = 1; b < S.length; b++) {               // S[0] is city 1, so j starts from S[1]
        var j = S[b];
        var rest = removeCity(S, j);                     // S - {j}

        // try every i in S - {j} and keep the smallest total
        var candidates = [];
        var parts = '';
        for (var c = 0; c < rest.length; c++) {
          var i = rest[c];
          var before = C[subsetText(rest) + '|' + i];
          if (before == undefined) { continue; }         // this combination is not possible
          var distance = matrix[i - 1][j - 1];
          candidates.push({i: i, c: before, d: distance, total: before + distance});
          if (parts != '') { parts += ' , '; }
          parts += 'C(' + subsetText(rest) + ',' + i + ')+d(' + i + ',' + j + ')=' + before + '+' + distance;
        }
        var best = candidates[0];
        for (var x = 0; x < candidates.length; x++) {
          if (candidates[x].total < best.total) { best = candidates[x]; }
        }

        C[subsetText(S) + '|' + j] = best.total;
        parent[subsetText(S) + '|' + j] = best.i;
        count++;
        steps.push({
          final: false, s: s, name: subsetText(S), restName: subsetText(rest), j: j,
          cands: candidates, best: best.total, from: best.i, count: count,
          text: 'C(' + subsetText(S) + ',' + j + ') = min{ ' + parts + ' } = ' + best.total
        });
      }
    }
  }

  // last line: add the road back to city 1 and take the minimum
  var all = [];
  for (var city = 1; city <= n; city++) { all.push(city); }
  var fullName = subsetText(all);
  var options = [];
  var bestTotal = Infinity;
  var lastCity = 2;
  var finalParts = '';
  for (j = 2; j <= n; j++) {
    var inside = C[fullName + '|' + j];
    var back = matrix[j - 1][0];
    options.push({j: j, c: inside, d: back, total: inside + back});
    if (inside + back < bestTotal) { bestTotal = inside + back; lastCity = j; }
    if (finalParts != '') { finalParts += ' , '; }
    finalParts += 'C(all,' + j + ')+d(' + j + ',1)=' + inside + '+' + back;
  }

  // go backwards through the table to get the tour
  var path = [];
  var S2 = all;
  var j2 = lastCity;
  while (j2 != 1) {
    path.push(j2);
    var previous = parent[subsetText(S2) + '|' + j2];
    S2 = removeCity(S2, j2);
    j2 = previous;
  }
  path.push(1);
  path.reverse();
  path.push(1);

  steps.push({
    final: true, fullName: fullName, lastCity: lastCity, options: options, best: bestTotal, path: path, count: count,
    text: 'Final: min{ ' + finalParts + ' } = ' + bestTotal + '. Best tour: ' + path.join(' -> ')
  });

  var timeTaken = Math.round((performance.now() - startTime) * 1000) / 1000;
  return {steps: steps, best_cost: bestTotal, best_path: path, total_cells: (n - 1) * Math.pow(2, n - 2), time_ms: timeTaken};
}
