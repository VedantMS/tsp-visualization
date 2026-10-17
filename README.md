# TSP Visualization: Branch and Bound vs Dynamic Programming

**MSc Computer Science, Semester 1: Analysis of Algorithms + Full Stack mini project (Fergusson College)**

A web project that solves the **Traveling Salesman Problem (TSP)** in two ways, shows every step of each algorithm as an animation, and compares their time and space complexity.

Built with **only HTML, CSS and JavaScript**. There is no server, no framework and no library. Charts and graphs are drawn on the plain HTML `<canvas>`.

---

## 1. How to run

1. Unzip the project.
2. Double-click **`index.html`**. It opens in your browser.
3. Use the navigation bar to move between the 3 pages.

No installation is needed and it works offline.

---

## 2. What is the Traveling Salesman Problem?

A salesman must visit **every city exactly once** and **come back to the start city**. We want the tour with the **smallest total distance**.

The distance from city *i* to city *j* is written **d(i, j)** and stored in a table called the **distance matrix**. A city has no road to itself, so the diagonal is shown as ∞ (infinity).

The built-in example has 5 cities. The best tour costs **28**: `1 → 4 → 2 → 5 → 3 → 1`.

---

## 3. The 3 pages

| Page | File | What it shows |
|---|---|---|
| Page 1 | `index.html` | TSP solved by **Branch and Bound (LCBB)** |
| Page 2 | `dp.html` | TSP solved by **Dynamic Programming** |
| Page 3 | `compare.html` | **Time and space complexity** of both, with a slider and charts |

### Pages 1 and 2: common features

- **Toggle switch:** *Predefined input* (fixed 5-city matrix) or *User-defined input* (you choose the number of cities and type the distances).
  - Branch and Bound: 3 to 6 cities.
  - Dynamic Programming: 3 to 10 cities.
  - The limits keep the animation readable. DP grows as 2ⁿ, and the B&B tree gets too wide for the screen.
- **Controls:** Start, Pause, Resume, Previous, Next, Reset, and a Speed slider.
- **City graph:** cities are placed on a circle with the distance written on every road.
- **"What is happening now?"** panel: the current step explained with real numbers.
- **Step log:** a scrolling list of every step so far.
- **Resource usage bars:** counters that grow live while the algorithm runs.
- **Result box:** best cost, best path and the time taken.
- **Salesman truck 🚚:** after a run, click the button and a truck drives along the best tour, adding up the distance as it goes.
- **Explanation section** at the bottom of each page.

### Colour guide

**City graph (both pages)**

| Colour | Meaning |
|---|---|
| Blue | Current city (B&B) / city *j* being calculated (DP) |
| Green | Visited city (B&B) / city inside the subset S (DP) |
| Grey | Not visited / not in S |
| Gold | Final best tour |

**State-space tree (Page 1)**

| Colour | Meaning |
|---|---|
| Yellow | Live node (waiting to be expanded) |
| Light blue | Expanded node |
| Red | Pruned node (cut off) |
| Orange-gold | Complete tour found (best so far) |
| Thick black ring | The node being worked on in this step |

**DP table (Page 2)**

| Colour | Meaning |
|---|---|
| Blue | Cell being calculated now |
| Light yellow | Candidate cells being compared |
| Green | Already computed |
| Grey | Not computed yet |
| `-` (pale) | City *j* is not inside this subset, so there is no cell |

### Page 3: comparison

- A table of the Big-O notations (see section 6).
- A slider for **n (2 to 20 cities)**. Moving it updates everything live.
- Two line charts: **time growth** and **space growth**. Red is Branch and Bound, blue is DP, and the green vertical line marks the selected n.
- A **log scale** checkbox. Without it, n! is so large that the DP line looks flat at the bottom.
- A table with the exact numbers for the selected n and which algorithm is better.
- A written section on resource constraints.

---

## 4. The two algorithms

### 4.1 Dynamic Programming (the algorithm given by sir)

```
C({1}, 1) = 0
for s = 2 to n
    for all subsets S of {1..n} of size s that contain 1
        C(S, 1) = infinity
        for all j in S, j != 1
            C(S, j) = min { C(S - {j}, i) + d(i, j)   for i in S, i != j }
return min over j of  C({1..n}, j) + d(j, 1)
```

**Meaning of C(S, j):** the shortest path that starts at city 1, visits every city in the subset S exactly once, and ends at city j.

**Idea:** to find the best path through S ending at j, remove j and look up the best path through the smaller subset S − {j} ending at some city i. Then add the road i → j. Try every i and keep the smallest. Smaller subsets are solved first (s = 2, then 3, and so on), so their answers are always ready. Reusing those stored answers is called **overlapping subproblems**.

**Final answer:** once the full set {1..n} is solved, add the road back to city 1 and take the minimum over j. The actual tour is found by going **backwards** through the table, using a record of which *i* gave each minimum.

> Note: in the pasted notes the last line read `d(j, i)`. The code uses `d(j, 1)`, because the tour must return to city **1**. Confirm this with sir.

**Real example from the program (5 cities):**

```
C({1,2},2)   = min{ C({1},1)+d(1,2)=0+20 }                = 20
C({1,2,3},3) = min{ C({1,2},2)+d(2,3)=20+16 }             = 36
Final: min{ C(all,2)+d(2,1)=25+15 , C(all,3)+d(3,1)=25+3 ,
            C(all,4)+d(4,1)=27+19 , C(all,5)+d(5,1)=35+16 } = 28
```

For 5 cities the table has 32 cells, so the animation has 33 steps (32 cells plus the final step).

### 4.2 Branch and Bound: LCBB (Least Cost Branch and Bound)

**Idea:** build a tree of partial tours. Every node has a **cost**, a *lower bound* on the cheapest full tour that could start with that partial path. We always expand the **live node with the least cost**. If a node's cost is not below the best complete tour found so far, we **prune** it and never explore it.

**Matrix reduction** (this is how the cost is calculated):

1. For each row, subtract the smallest number in that row from the whole row.
2. For each column, subtract the smallest number in that column from the whole column.
3. Add up everything you subtracted. That total is the reduction cost.

**Algorithm steps:**

1. **Root node:** reduce the original matrix. Root cost = total reduction.
2. Keep all live nodes. Repeatedly take the one with the **least cost**.
3. If its cost is not lower than the best tour found so far, **prune** it.
4. Otherwise **expand** it. For every city *j* not yet visited, make a child for the road *i → j*:
   - set row *i* and column *j* of the matrix to ∞;
   - set d(j, 1) = ∞ (so we do not go home too early; the exception is the last city);
   - reduce the new matrix;
   - **child cost = parent cost + d(i, j) + reduction of the new matrix**.
5. A child that has visited all cities is a complete tour. If it is cheaper than the best so far, it becomes the new best.
6. Stop when no live nodes are left.

**Real example from the program (5 cities):**

```
Root node: cost (lower bound) = 25     (rows give 21, columns give 4)
Edge 1->2: cost = parent 25 + d(1,2) 10 + reduction 0  = 35
Edge 1->3: cost = parent 25 + d(1,3) 17 + reduction 11 = 53
Edge 1->4: cost = parent 25 + d(1,4) 0  + reduction 0  = 25   <- least cost, expanded next
```

Here the algorithm creates only **11 nodes**, expands 4 and prunes 6. A full search would look at 4! = 24 tours.

---

## 5. How the project works (the big idea)

The most important design decision is to separate **thinking** from **drawing**.

```
 [ algorithm file ]                          [ page file ]
 solves the problem and saves   --steps-->   plays the list like a movie
 EVERY step in a list                        and draws the colours
```

1. When you click **Start**, the algorithm runs **completely and instantly** and builds a list called `steps`.
2. Each item in the list is one moment of the algorithm: the text, the matrix or table state, the counters and so on.
3. The page then **plays** the list: show step 0, wait, show step 1, and so on.
4. **Previous / Next / Pause / Speed** are easy because the whole story is already stored. We just change which step number we show.

An example step from Branch and Bound:

```js
{ id: 1, parent: 0, label: '2', cost: 35, status: 'live',
  path: [1, 2],
  matrix: [[...]],
  text: 'Edge 1->2: cost = parent 25 + d(1,2) 10 + reduction 0 = 35. Added to live nodes',
  created: 2, expanded: 1, pruned: 0, maxQueue: 2 }
```

An example step from Dynamic Programming:

```js
{ final: false, s: 3, name: '{1,2,3}', restName: '{1,3}', j: 2,
  cands: [{ i: 3, c: 30, d: 5, total: 35 }],
  best: 35, from: 3, count: 5,
  text: 'C({1,2,3},2) = min{ C({1,3},3)+d(3,2)=30+5 } = 35' }
```

---

## 6. Complexity

*n* = number of cities.

| | Time | Space |
|---|---|---|
| **Branch and Bound (LCBB)** | **O(n!)** in the worst case. Usually far less because pruning removes many branches. | **O(n²)** per node (each node stores an n × n matrix). Up to n! nodes in the worst case. |
| **Dynamic Programming** | **O(n² · 2ⁿ)** | **O(n · 2ⁿ)** |

**Why DP is O(n² · 2ⁿ):** there are about 2ⁿ⁻¹ subsets. For each subset there are up to n choices of *j*, and for each *j* up to n choices of *i*. That is 2ⁿ × n × n.

**Why DP space is O(n · 2ⁿ):** the table stores one value for each (subset, j) pair, which is about n × 2ⁿ cells. The program shows this as `(n-1) × 2^(n-2)` cells, for example 32 cells for n = 5 and 2304 cells for n = 10.

**Why B&B is O(n!):** in the worst case no branch is pruned and every possible ordering of cities is explored.

**Resource constraints:**
- DP uses a lot of **memory**. Every extra city doubles the table. For n = 20 it needs more than 20 million cells.
- B&B is **unpredictable**. Good pruning makes it very fast, but a bad input can push it towards n! nodes. It also stores a matrix for every live node.
- Use DP when n is small or medium and you need a guaranteed running time. Use B&B when pruning works well on your data.

> On Page 3 the Branch and Bound numbers are **worst-case theory**. That is why DP looks better there. Real runs of B&B usually create far fewer nodes, which you can see on Page 1.

---

## 7. Project structure

```
tsp-simple/
├── index.html            Page 1: Branch and Bound
├── dp.html               Page 2: Dynamic Programming
├── compare.html          Page 3: Comparison
├── README.md             This file
├── css/
│   └── style.css         All the styling
└── js/
    ├── common.js         Shared code (buttons, input, drawing, truck)
    ├── bb_algorithm.js   LCBB algorithm (the thinking)
    ├── branch_bound.js   Draws Branch and Bound steps (the drawing)
    ├── dp_algorithm.js   DP algorithm (the thinking)
    ├── dp.js             Draws DP steps (the drawing)
    └── compare.js        Complexity numbers, slider and charts
```

Each page loads its scripts in this order, because the later files use functions from the earlier ones:

| Page | Scripts loaded (in order) |
|---|---|
| `index.html` | `common.js` → `bb_algorithm.js` → `branch_bound.js` |
| `dp.html` | `common.js` → `dp_algorithm.js` → `dp.js` |
| `compare.html` | `common.js` → `compare.js` |

---

## 8. Code walkthrough

### 8.1 HTML files

All three pages share the same layout: a navigation bar, a content area, and the scripts at the bottom. `index.html` and `dp.html` each contain:

- the toggle switch, the city-count selector, the matrix box and the control buttons;
- `<canvas>` elements for the city graph (`graphCanvas`), the tree (`treeCanvas`, Page 1 only) and the bars (`barCanvas`);
- empty boxes that the JavaScript fills in (`explain`, `log`, `matrixView`, `tableBox`, `result` and so on);
- the written explanation.

The buttons call JavaScript functions with `onclick`, for example `onclick="nextStep()"`.

### 8.2 `css/style.css`

Plain styling: the navigation bar, white "boxes" on a grey page, tables, the colour legend squares, and the toggle switch. The switch is a hidden checkbox with a styled `<span>` that slides a white circle left and right. The DP table colours are CSS classes: `.done`, `.cand`, `.now` and `.na`.

### 8.3 `js/common.js` (shared code)

**Global variables**

| Variable | Purpose |
|---|---|
| `PREDEFINED` | The built-in 5-city matrix (`Infinity` on the diagonal) |
| `steps` | The list of steps produced by the algorithm |
| `current` | The step number now on screen |
| `timer` | The timer that plays the steps one by one |
| `drawFunction` | The page's own function that draws one step |
| `truck`, `truckTimer` | State and timer of the salesman truck |

**Player functions**

| Function | What it does |
|---|---|
| `setSteps(list, fn)` | Stores the steps and the draw function, then shows step 0 |
| `showStep(number)` | Sets `current`, calls the page's draw function, updates "Step x of y" |
| `nextStep()` / `prevStep()` | Move one step forward or back |
| `playSteps()` | Starts `setInterval(nextStep, delay)`. The delay is calculated from the speed slider: `1100 - speed * 10` ms. |
| `stopSteps()` | Stops the timer (Pause) |
| `resetSteps()` | Stops everything and goes back to step 0 |

**Input functions**

| Function | What it does |
|---|---|
| `initInput(max)` | Fills the city-count dropdown from 3 to `max` and shows the matrix |
| `isUserMode()` | True when the toggle switch is ON |
| `showMatrix()` | Draws the matrix as an HTML table: fixed numbers in predefined mode, `<input>` boxes (with random starting values) in user mode |
| `readMatrix()` | Returns the matrix to solve. In user mode it reads each input box and shows an alert if a value is not a number or is negative. |
| `matrixHtml(m)` | Turns any matrix into an HTML table (used for the reduced matrix on Page 1) |

**Drawing functions**

| Function | What it does |
|---|---|
| `cityPositions(w, h, n)` | Puts n cities evenly on a circle using sine and cosine |
| `drawLine(ctx, a, b, color, thickness)` | Draws one line on the canvas |
| `drawGraph(id, matrix, path, isFinal, visited)` | Draws the city graph in three layers: grey roads with distances, then the thick path, then the coloured cities |
| `drawBars(id, labels, values, colors)` | Draws a simple bar chart. The biggest value gets the tallest bar. |
| `showLog(k)` | Writes the text of steps 0..k into the log box and scrolls to the bottom |

**Salesman truck**

`driveSalesman()` stores the route in the `truck` object and starts a timer that calls `moveTruck()` every 40 ms. `moveTruck()` redraws the gold tour, draws 🚚 at a point between two cities (`progress` goes from 0 to 1), then increases `progress` by 0.05. When `progress` reaches 1, it adds that road's distance to `travelled` and moves on to the next road. At the end it prints "Back home! Total distance = …".

### 8.4 `js/bb_algorithm.js` (Branch and Bound: the thinking)

Variables at the top are shared by all functions: `steps`, `live` (the live nodes), `bestCost`, `bestPath`, and the counters `created`, `expanded`, `pruned`, `maxQueue`.

| Function | What it does |
|---|---|
| `copyMatrix(m)` | Makes a real copy, so changing a child's matrix does not change the parent's |
| `cityNumbers(path)` | Converts internal city numbers (0 to n-1) to display numbers (1 to n) |
| `reduceMatrix(m)` | Row reduction, then column reduction. It changes the matrix and returns the total subtracted. Infinity entries are skipped. |
| `addStep(node, status, text)` | Saves one step with the current counters |
| `takeLeastCostNode()` | Finds the live node with the smallest cost and removes it from the list |
| `solveBB(matrix)` | The main algorithm |

**Inside `solveBB`:**

1. Reset the variables and make the **root node** from the reduced matrix.
2. `while (live.length > 0)`: take the least-cost node.
3. If `node.cost >= bestCost`, **prune** it and continue.
4. Otherwise **expand** it: for each unvisited city `j`, copy the matrix, set row `i` and column `j` to `Infinity`, block `m[j][0]` unless this is the last city, reduce, and compute `childCost = node.cost + distance + reduction`.
5. Decide what the child is:
   - all cities visited and cheaper than best → status `'best'`;
   - all cities visited but not cheaper → `'pruned'`;
   - `childCost >= bestCost` → `'pruned'`;
   - otherwise → add to `live` as `'live'`.
6. Return the steps, best cost, best path and the time taken.

A node is a simple object: `{ id, parent, label, path, matrix, cost }`.

### 8.5 `js/branch_bound.js` (Page 1: the drawing)

| Function | What it does |
|---|---|
| `startRun()` | Reads the matrix, calls `solveBB`, fills the result box, then calls `setSteps` and `playSteps` |
| `drawBB(k)` | Draws everything for step k: tree, graph, reduced matrix, explanation, log, bars, memory text |
| `buildTree(k)` | Goes through steps 0..k and rebuilds the tree. When a new best tour appears, the older best node is recoloured as expanded. |
| `drawTree(tree, currentId)` | Counts nodes on each level, spreads them left to right, draws the lines first and then the coloured circles with their city number and cost. The current node gets a thick black ring. |
| `sendSalesman()` | Starts the truck on `result.best_path` |

**Memory estimate on Page 1:** `max live nodes × n × n` numbers, because every live node stores an n × n matrix.

### 8.6 `js/dp_algorithm.js` (Dynamic Programming: the thinking)

Cities are numbered **1 to n** inside this file, so the code matches sir's formula. d(i, j) is `matrix[i-1][j-1]`.

| Function | What it does |
|---|---|
| `subsetText(list)` | `[1,2,3]` becomes `"{1,2,3}"`, used as the name of a subset |
| `removeCity(list, city)` | Returns the subset without one city (S − {j}) |
| `getSubsets(s, n)` | Returns all subsets of size s that contain city 1 (see below) |
| `solveDP(matrix)` | The main algorithm |

**How `getSubsets` works:** every number `mask` from 0 to 2ⁿ⁻¹ − 1 stands for one subset. Binary digit *b* being 1 means city *b + 2* is inside. For example, with n = 5, mask 5 = binary `101` means cities 2 and 4 are inside, so the subset is {1, 2, 4}. We keep only the subsets whose size equals s.

**How the table is stored:** a JavaScript object called `C` with text keys. For example `C["{1,2,3}|3"]` means C({1,2,3}, 3). A second object, `parent`, remembers which *i* gave each minimum.

**Inside `solveDP`:**

1. `C['{1}|1'] = 0`, which is the base case.
2. `for s = 2 to n`, then for each subset, then for each city *j* in the subset except city 1:
   - build `rest` = S − {j};
   - for every *i* in `rest`, look up `C[rest|i]` and add d(i, j). Skip combinations that do not exist.
   - keep the smallest total, store it in `C` and note which *i* produced it;
   - save a step.
3. **Final step:** for every *j*, compute `C[all|j] + d(j, 1)` and pick the smallest.
4. **Backtrack:** start at the best last city, repeatedly use `parent` to find the previous city and remove the current one from the subset, until city 1 is reached. Reverse the list and add city 1 at the end.

### 8.7 `js/dp.js` (Page 2: the drawing)

| Function | What it does |
|---|---|
| `startRun()` | Runs `solveDP`, builds the list of table rows from the steps, shows the result and starts playing |
| `getSubsetCities(name)` | Turns `"{1,2,3}"` back into `[1,2,3]` |
| `drawDP(k)` | Draws everything for step k |
| `sendSalesman()` | Starts the truck on the best tour |

**Inside `drawDP(k)`:**

1. Collect the value of every cell finished up to step k into an object called `filled`.
2. Work out the **current cell** (blue) and the **candidate cells** (yellow) that are being compared in this step.
3. Build the HTML table: one row per subset and one column per city j = 2..n. Each cell gets a CSS class: `done`, `cand`, `now`, or `na` when j is not in that subset.
4. Scroll the table box so the current cell stays in view.
5. Draw the city graph. For a normal step it shows the road *from → j* with the subset's cities in green. For the final step it shows the whole gold tour.
6. Update the round label (`s = 3 of 5`), the explanation text, the log, the bars (cells computed vs total cells) and the memory text.

### 8.8 `js/compare.js` (Page 3)

- At the start, a loop builds the `data` list for n = 2..20, keeping a running factorial. For each n it stores `bb_time = n!`, `dp_time = n²·2ⁿ`, `bb_space = n²·n!` and `dp_space = n·2ⁿ`.
- `update()` runs whenever the slider or the log-scale box changes. It redraws both charts and rebuilds the values table, including which algorithm is better.
- `drawChart()` finds the biggest value, draws grid lines and labels, draws the two lines point by point, and then the vertical line for the selected n.
- On **log scale**, `Math.log10` is applied to every value first (1,000,000 becomes 6). That is how n! and 2ⁿ fit in one chart.

---

## 9. Customising the project

| I want to… | Change this |
|---|---|
| Use sir's own example matrix | Edit `PREDEFINED` at the top of `js/common.js` (use `Infinity` on the diagonal) |
| Change the city limit | `initInput(6)` at the top of `js/branch_bound.js`, or `initInput(10)` in `js/dp.js` |
| Change the colours | The `statusColors` object in `js/branch_bound.js`, the colours in `drawGraph` in `js/common.js`, and the `.dp td` classes in `css/style.css` |
| Change animation speed range | The formula in `playSteps()` in `js/common.js` |

---

## 10. Testing done

- Both algorithms give the **same best cost** on the 5-city example (28, tour 1→4→2→5→3→1).
- Both agree on **300 random matrices** of 3 to 7 cities.
- Every step of both pages (predefined and user-defined mode), the salesman truck and the comparison charts (log and linear) were run in a scripted test with a simulated page, and no errors occurred.

Please also click through all 3 pages once in your own browser before presenting.

---

## 11. Glossary

| Term | Meaning |
|---|---|
| **Distance matrix** | Table where row *i*, column *j* is d(i, j) |
| **Lower bound** | A value the true answer can never be below |
| **Live node** | A tree node that has been created but not yet expanded |
| **Expand** | Create the children of a node |
| **Prune** | Cut off a branch because it cannot beat the best tour |
| **Reduction** | Subtracting row and column minimums to make the matrix cheaper to bound |
| **Subset S** | A group of cities (always containing city 1 in DP) |
| **Overlapping subproblems** | The same smaller problem is needed again and again, so we store its answer |
| **Backtracking (in DP)** | Going backwards through the table to rebuild the tour |
| **Canvas** | The HTML element we draw on with JavaScript |
