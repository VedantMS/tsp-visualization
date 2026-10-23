// dp_algorithm.js - TSP by dynamic programming

// [3,4] -> "{3,4}"   (an empty list gives "{}")
function subsetText(list) {
    return '{' + list.join(',') + '}';
}

// returns the subset without one city
function removeCity(list, city) {
    var result = [];

    for (var i = 0; i < list.length; i++) {
        if (list[i] != city) {
            result.push(list[i]);
        }
    }

    return result;
}

// all subsets of {2,...,n} that have exactly s cities.
// Every number "mask" from 0 to 2^(n-1)-1 is one subset: binary digit b is 1 -> city b+2 is inside.
function getSubsets(s, n) {
    var subsets = [];

    for (var mask = 0; mask < Math.pow(2, n - 1); mask++) {
        var subset = [];

        for (var b = 0; b < n - 1; b++) {
            if (Math.floor(mask / Math.pow(2, b)) % 2 == 1) {
                subset.push(b + 2);
            }
        }

        if (subset.length == s) {
            subsets.push(subset);
        }
    }

    return subsets;
}

function solveDP(matrix) {
    var startTime = performance.now();
    var n = matrix.length;
    var C = {};          // C["3|{4,5}"] means C(3,{4,5})
    var parent = {};     // which k gave the minimum to find the tour at the end
    var steps = [];
    var count = 0;       // how many cells are computed

    var all = [];        // {2,3,...,n}

    for (var city = 2; city <= n; city++) {
        all.push(city);
    }

    // s = size of S. s = 0 is the base case, s = n-1 is the last cell C(1, {2..n}).
    for (var s = 0; s <= n - 1; s++) {
        var subsets = getSubsets(s, n);
        
        for (var a = 0; a < subsets.length; a++) {
            var S = subsets[a];

            // which cities i get a cell in this row? every i outside S (city 1 only in the last row)
            var starts = [];

            if (s == n - 1) {
                starts.push(1);
            }
            
            else {
                for (var c = 2; c <= n; c++) {
                    if (S.indexOf(c) < 0) {
                        starts.push(c);
                    }
                }
            }

            for (var b = 0; b < starts.length; b++) {
                var i = starts[b];
                var key = i + '|' + subsetText(S);
                var text, candidates = [], bestTotal, from;

                if (s == 0) {
                    // base case: go straight back to city 1
                    bestTotal = matrix[i - 1][0];
                    from = 1;
                    text = 'C(' + i + ',{}) = d(' + i + ',1) = ' + bestTotal;
                }
                
                else {
                    // try every k in S as the NEXT city and keep the smallest total
                    var parts = '';
                
                    for (var x = 0; x < S.length; x++) {
                        var k = S[x];
                        var rest = removeCity(S, k);                        // S - {k}
                        var after = C[k + '|' + subsetText(rest)];          // C(k, S-{k})
                        var distance = matrix[i - 1][k - 1];                // d(i,k)
                        candidates.push({k: k, restName: subsetText(rest), d: distance, c: after, total: distance + after});
                
                        if (parts != '') {
                            parts += ' , ';
                        }
                        
                        parts += 'd(' + i + ',' + k + ')+C(' + k + ',' + subsetText(rest) + ')=' + distance + '+' + after;
                    }

                    var best = candidates[0];
                    
                    for (x = 1; x < candidates.length; x++) {
                        if (candidates[x].total < best.total) {
                            best = candidates[x];
                        }
                    }

                    bestTotal = best.total;
                    from = best.k;
                    text = 'C(' + i + ',' + subsetText(S) + ') = min{ ' + parts + ' } = ' + bestTotal;
                }

                C[key] = bestTotal;
                parent[key] = from;
                count++;
                steps.push({
                    final: (s == n - 1), s: s, i: i, name: subsetText(S), cities: S,
                    cands: candidates, best: bestTotal, from: from, count: count, text: text
                });
            }
        }
    }

    // go forwards through the table to get the tour: 1 -> k1 -> k2 -> ... -> 1
    var path = [1];
    var currentCity = 1;
    var left = all;
    
    while (left.length > 0) {
        var next = parent[currentCity + '|' + subsetText(left)];
        path.push(next);
        left = removeCity(left, next);
        currentCity = next;
    }

    path.push(1);

    // the last step is C(1, {2..n}); add the tour to its text and save it
    var last = steps[steps.length - 1];
    last.path = path;
    last.text = last.text + '. Best tour: ' + path.join(' -> ');

    var timeTaken = Math.round((performance.now() - startTime) * 1000) / 1000;
    
    return {steps: steps, best_cost: last.best, best_path: path, total_cells: (n - 1) * Math.pow(2, n - 2) + 1, time_ms: timeTaken};
}