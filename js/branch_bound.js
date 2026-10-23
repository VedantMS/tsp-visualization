	// branch_bound.js - draws one step of the Branch and Bound page
initInput(6);                 // at most 6 cities
var matrix = [];
var result = null;
var statusColors = {live: '#ffe066', expanded: '#90cdf4', pruned: '#fc8181', best: '#f59e0b'};

function startRun() {
	matrix = readMatrix();

	if (matrix == null) {
		return;
	}
	
	result = solveBB(matrix);
	document.getElementById('result').innerHTML = '';
	setSteps(result.steps, drawBB);
	playSteps();
}

// draws everything for step number k
function drawBB(k) {
	var step = steps[k];
	drawTree(buildTree(k), step.id);

	if (step.status == 'done') {                     // last frame: show the answer
		drawGraph('graphCanvas', matrix, result.best_path, true, []);
		document.getElementById('matrixView').innerHTML = matrixHtml(matrix);
		document.getElementById('result').innerHTML = '<b>Best cost: ' + result.best_cost + '</b><br>Best path: ' +
		result.best_path.join(' -> ') + '<br>Time taken: ' + result.time_ms + ' ms';
	}
	
	else {
		drawGraph('graphCanvas', matrix, step.path, false, step.path);
		document.getElementById('matrixView').innerHTML = matrixHtml(step.matrix);
		document.getElementById('result').innerHTML = '';
	}

	document.getElementById('explain').innerText = step.text;
	
	showLog(k);
	
	drawBars('barCanvas', ['Created', 'Expanded', 'Pruned', 'Max queue'], [step.created, step.expanded, step.pruned, step.maxQueue], ['#ecc94b', '#4299e1', '#fc8181', '#9f7aea']);
	
	var n = matrix.length;
	
	document.getElementById('resources').innerText = 'Memory used: about ' + step.maxQueue + ' live matrices x ' + (n * n) + ' numbers = ' + (step.maxQueue * n * n) + ' numbers';
}

// the tree as it looks after step k (tree[id] = information of node id)
function buildTree(k) {
	var tree = [];

	for (var t = 0; t <= k; t++) {
		var s = steps[t];

		if (s.status == 'done') {		// <-- new
			continue;
		}

		if (s.status == 'best') {                      // the old best tour is not the best anymore
		
			for (var id = 0; id < tree.length; id++) {
				if (tree[id].status == 'best') {
					tree[id].status = 'expanded';
				}
			}
		}

		tree[s.id] = {parent: s.parent, label: s.label, cost: s.cost, status: s.status, depth: s.path.length};
	}

	return tree;
}

function drawTree(tree, currentId) {
	var canvas = document.getElementById('treeCanvas');
	var ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	var n = matrix.length;

	// how many nodes are on each level?
	var total = [];
	var seen = [];

	for (var d = 0; d <= n; d++) {
		total.push(0);
		seen.push(0);
	}
	
	for (var id = 0; id < tree.length; id++) {
		total[tree[id].depth]++;
	}

	// position of every node: levels go down, nodes of one level are spread left to right
	var xs = [];
	var ys = [];
	
	for (id = 0; id < tree.length; id++) {
		var level = tree[id].depth;
		seen[level]++;
		xs.push(seen[level] * canvas.width / (total[level] + 1));
		ys.push(30 + (level - 1) * (canvas.height - 60) / (n - 1));
	}
	
	// lines
	for (id = 0; id < tree.length; id++) {
		var p = tree[id].parent;
		if (p != null) {
			drawLine(ctx, {x: xs[p], y: ys[p]}, {x: xs[id], y: ys[id]}, '#a0aec0', 1);
		}
	}
	
	// circles
	for (id = 0; id < tree.length; id++) {
		ctx.fillStyle = statusColors[tree[id].status];
		ctx.beginPath();
		ctx.arc(xs[id], ys[id], 11, 0, 2 * Math.PI);
		ctx.fill();
		ctx.strokeStyle = '#718096';
		ctx.lineWidth = 1;

		if (id == currentId) {
			ctx.strokeStyle = 'black'; ctx.lineWidth = 3;		   // thick ring = current node
		}

		ctx.stroke();
		ctx.fillStyle = 'black';
		ctx.font = 'bold 11px Arial';
		ctx.fillText(tree[id].label, xs[id] - 3, ys[id] + 4);
		ctx.font = '10px Arial';
		ctx.fillText(tree[id].cost, xs[id] - 8, ys[id] + 24);
	}
}

function sendSalesman() {
	if (result == null) {
		alert('Press Start first');
		return;
	}

	driveSalesman('graphCanvas', matrix, result.best_path);
}
