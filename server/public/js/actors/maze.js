/* global Actors, Actor */

Actors.Maze = function (env, refs, attrs) {
  this.env = env
  this.refs = refs
  this.opts = this.genOpts()
  this.attrs = this.genAttrs(attrs)
  this.init()
}

Actors.Maze.prototype = Object.create(Actor.prototype)

Actors.Maze.prototype.title = 'Maze'

Actors.Maze.prototype.genAttrs = function (attrs) {
  return {
    max: Math.min(this.opts.max_x, this.opts.max_y),
    escape: false
  }
}

Actors.Maze.prototype.init = function () {
  this.makeGrid();
};

Actors.Maze.prototype.makeGrid = function () {

  // init blank grid
  this.cells = new Array(this.opts.rows * this.opts.cols);
  x = 0;
  y = 0;
  for (i = 0, ii = this.cells.length; i<ii; i++) {
    this.cells[i] = new Actors.Cell(
      this.env, {
        maze: this,
        cells: this.cells
      }, {
        // position on grid
        i: i,
        x: x,
        y: y
      });
    x ++;
    if(x === this.opts.cols){
      x = 0;
      y ++;
    }
  }

  this.makeGridmates();

  this.generatePerfectMaze();

  this.randomBreeders(this.opts.breeders);
  // this.maze.randomJoins(20);
  //this.maze.randomReactors(1);
  //this.maze.randomHumans(1);
  this.attrs.entry_cell = 0;
  this.attrs.reactor_cell = this.cells.length-1;
  this.addReactor(this.attrs.reactor_cell);
  this.human = this.addHuman(this.attrs.entry_cell);
}

Actors.Maze.prototype.makeGridmates = function () {
  var dirs = [[0,-1], [1,0], [0,1], [-1,0]];
  var i, ix, exit;
  var other;
  for (i = 0, ii = this.cells.length; i<ii; i++) {
    cell = this.cells[i]
    for (exit = 0; exit<4; exit++) {
      x = cell.attrs.x + dirs[exit][0];
      y = cell.attrs.y + dirs[exit][1];
      if(y<0 || x<0 || x>=this.opts.cols || y>=this.opts.rows){
        continue;
      }
      ix = (y * this.opts.cols) + x;
      cell.gridmates[exit] = this.cells[ix]
    }
  }
}


Actors.Maze.prototype.randomJoins = function (max) {

  if(!max){
    max = 1
  }
  
  for(var i=0; i<max; i++){
    this.randomJoin();
  }

}

Actors.Maze.prototype.generatePerfectMaze = function (max) {

  var stack = [];
  var cells = this.cells
  var total = cells.length
  var cell
  var visited = 1;
  var n; // neighbours
  var i, j, k, c;
  var pick, other, dir;
  var flip = [2,3,0,1];

  var cell = pickOne(cells)
  while(visited < total){
    n = [];
    // find all neighbors of Cell with all walls intact 
    for(i=0; i<4; i ++){
      if(cell.gridmates[i]){
        c = 0;
        other = cell.gridmates[i]
        for(j=0; j<4; j++){
          if(!other.exits[j]){
            c++;
          }
        }
        if(c === 4){
          n.push([i, other])
        }
      }
    }
    if(n.length > 0){
      pick = pickOne(n)
      dir = pick[0]
      other = pick[1]
      cell.exits[dir] = other
      other.exits[flip[dir]] = cell
      stack.push(cell)
      cell = other
      visited ++
    } else {
      cell = stack.pop()
    }
  }

}


Actors.Maze.prototype.randomJoin = function () {

  var cell, dir, other;

  cell = pickOne(this.cells);

  while(!other){
    dir = random.from0to(3);
    if(!cell.gridmates[dir]){
      continue;
    }
    other = cell.gridmates[dir];
  }

  cell.exits[dir] = other;
  var flip = [2,3,0,1];
  other.exits[flip[dir]] = cell;

}


Actors.Maze.prototype.randomSplit = function (max) {

  if(!max){
    max = 1
  }
  
  for(var i=0; i<max; i++){
    this.randomSplit();
  }

}

Actors.Maze.prototype.randomSplit = function () {

  var cell, dir, other;

  cell = pickOne(this.cells);

  while(!other){
    dir = random.from0to(3);
    if(!cell.gridmates[dir]){
      continue;
    }
    other = cell.gridmates[dir];
  }

  cell.exits[dir] = null;
  var flip = [2,3,0,1];
  other.exits[flip[dir]] = null;

}

Actors.Maze.prototype.randomBreeders = function (max) {
  if(!max){
    max = 0
  }
  for(var i=0; i<max; i++){
    this.randomBreeder();
  }
}

Actors.Maze.prototype.addBreeder = function (ix) {
  this.cells[ix].addBreeder();
}

Actors.Maze.prototype.addReactor = function (ix) {
  this.cells[ix].addReactor();
}

Actors.Maze.prototype.randomBreeder = function (max) {
  var x = 5; // attempts
  var ix;
  while (x>0){
    ix = random.from0upto(this.cells.length)
    if(this.cells[ix].breeders.length > 0){
      x --;
      continue;
    }
    if(this.cells[ix].reactors.length > 0){
      x --;
      continue;
    }
    this.cells[ix].addBreeder();
    break;
  }
}


Actors.Maze.prototype.randomReactors = function (max) {
  if(!max){
    max = 1
  }
  for(var i=0; i<max; i++){
    this.randomReactor();
  }
}


Actors.Maze.prototype.randomReactor = function (max) {
  var ix = random.from0upto(this.cells.length)
  this.cells[ix].addReactor();
}

Actors.Maze.prototype.addHuman = function (ix) {
  var human = this.cells[ix].addHuman();
  return human
}

Actors.Maze.prototype.randomHuman = function (max) {
  var ix = random.from0upto(this.cells.length)
  this.cells[ix].addHuman();
}

Actors.Maze.prototype.randomHumans = function (max) {
  if(!max){
    max = 1
  }
  for(var i=0; i<max; i++){
    this.randomHuman();
  }
}

Actors.Maze.prototype.route = function (cell, other) {

  function distanceFunction(pos0, pos1){
    var d1 = Math.abs(pos1.attrs.x - pos0.attrs.x);
    var d2 = Math.abs(pos1.attrs.y - pos0.attrs.y);
    return d1 + d2;
  }

  var worldSize = this.opts.rows * this.opts.cols

  var nodes = [];
  for(i=0; i<worldSize; i++){
    nodes[i] = {
      i: i,
      f:0,
      g:0,
      h:0,
      visited: false,
      closed: false,
      parent: null,
      cell: this.cells[i]
    }
  }

  // Path function, executes AStar algorithm operations

  // create an array that will contain all world cells
  var astar = new Array(worldSize);
  // list of currently open Nodes
  var open = [cell.attrs.i];
  // list of closed Nodes
  var closed = [];
  // list of the final output array
  var result = [];
  // reference to a Node (that is nearby)
  var myNeighbours;
  // reference to a Node (that we are considering now)
  var node;
  // reference to a Node (that starts a path in question)
  var path;
  // temp integer variables used in the calculations
  var length, max, min, i, j;
  var exits;

  // iterate through the open list until none are left
  while(length = open.length) {

    max = worldSize;
    min = -1;

    for(i = 0; i < length; i++) {
      if(nodes[i].f) {
	max = nodes[i].f;
	min = i;
      }
    }

    // grab the next node and remove it from open array
    node = open.splice(min, 1)[0];

    // is it the destination node?
    nodes[cell.attrs.i].parent = null;
    if(node === other.attrs.i) {
      
      // open.push(other.attrs.i);
      //open.push(path.i)
      //
      //console.log(path);
      do {
        result.push(path.i);
      } while (path = path.parent);
      // // we want to return start to finish
      result.reverse();
      //console.log('RESULT', result);
      break;
    }

    // find which nearby nodes are walkable
    exits = this.cells[node].exits;

    // test each one that hasn't been tried already
    for(i = 0, j = exits.length; i < j; i++) {
      // no other cell in that direction
      if(!exits[i]){
        continue;
      }
      var gScore = nodes[node].g + 1; // 1 is the distance from a node to it's neighbor
      var gScoreIsBest = false;
      //console.log('node ', node, ' -> ', exits[i].attrs.i);
      path = nodes[exits[i].attrs.i];
      if (!astar[path.i]) {
	gScoreIsBest = true;
	// estimated cost of this particular route so far
	nodes[path.i].h = distanceFunction(exits[i], nodes[node].cell);
	nodes[path.i].g = nodes[node].g + distanceFunction(exits[i], nodes[node].cell);
        //console.log('path', path.i, 'h =', nodes[path.i].h, 'g =', nodes[path.i].g);
	// estimated cost of entire guessed route to the destination
	nodes[path.i].f = nodes[node].g + distanceFunction(exits[i], other);

	// remember this new path for testing above
	// mark this node in the world graph as visited
	open.push(path.i);
	astar[path.i] = true;
      } else if(gScore < nodes[path.i].g) {
        gScoreIsBest = true;
      }

      if(gScoreIsBest) {
	// Found an optimal (so far) path to this node.	 Store info on how we got here and
	//	just how good it really is...
	//console.log('Parent', path.i, node);
	nodes[path.i].parent = nodes[node];
	nodes[path.i].g = gScore;
	nodes[path.i].f = nodes[path.i].g + nodes[path.i].h;

      }        
    }
    
    // remember this route as having no more untested options
    closed.push(node);
    //console.log('open', open, 'closed', closed);
    
  } // keep iterating until until the open list is empty
  return result;
  
};


Actors.Maze.prototype.defaults = [{
  key: 'max_x',
  value: 480,
  min: 100,
  max: 1600
}, {
  key: 'max_y',
  value: 480,
  min: 100,
  max: 1000
}, {
  key: 'rows',
  value: 4,
  min: 3,
  max: 24
}, {
  key: 'cols',
  value: 4,
  min: 8,
  max: 32
}, {
  key: 'cell_w',
  value: 480,
  min: 100,
  max: 1600
}, {
  key: 'fit',
  value: 1,
  min: 0,
  max: 1
}, {
  key: 'breeders',
  value: 0,
  min: 0,
  max: 16
}]

Actors.Maze.prototype.update = function (delta) {
  var i, ii;
  for (i = 0, ii = this.cells.length; i<ii; i++) {
    this.cells[i].update(delta);
  }  
}

Actors.Maze.prototype.paint = function (view) {
  
  var x, y, i, ii;
  var cell;
  
  // view.ctx.strokeStyle = '#f00'
  // view.ctx.beginPath()
  // view.ctx.rect(0, 0, this.opts.max_x, this.opts.max_y)
  // view.ctx.stroke()

  view.ctx.save()

  // if(this.opts.fit){
  //   view.ctx.translate(this.attrs.max * 0.05, this.attrs.max * 0.05);
  //   view.ctx.scale(0.9, 0.9);
  // }
  

  var max = Math.max(this.opts.max_x, this.opts.max_y);
  var min = Math.min(this.opts.max_x, this.opts.max_y);
  var rc = Math.max(this.opts.rows, this.opts.cols);

  var w = (max/rc);
  var f = (w/this.opts.cell_w);

  view.ctx.translate(
    (this.opts.max_x - (this.opts.cols * w))/2,
    (this.opts.max_y - (this.opts.rows * w))/2
  );

  
  for (i = 0, ii = this.cells.length; i<ii; i++) {
    x = i % this.opts.cols;
    y = Math.floor(i/this.opts.rows); 
    
    cell = this.cells[i]
    view.ctx.save()
    view.ctx.translate(cell.attrs.x * w, cell.attrs.y * w);
    view.ctx.scale(f, f);

    cell.paint(view);
    view.ctx.restore()
  }

  if(this.human && this.human.attrs.route){
    for(i = 0, ii=this.human.attrs.route.length; i<ii; i++){

      // view.ctx.fillStyle = '#fff'
      // view.ctx.font = '14pt ubuntu mono, monospace'
      // view.ctx.textAlign='center';
      // view.ctx.textBaseline='middle';
      // view.ctx.fillText(this.human.attrs.route[i], (w/2) + (i * w/4), w/8);

      x = this.human.attrs.route[i] % this.opts.cols
      y = Math.floor(this.human.attrs.route[i] / this.opts.rows)
      
      view.ctx.fillStyle = '#222'
      view.ctx.font = '14pt ubuntu mono, monospace'
      view.ctx.textAlign='center';
      view.ctx.textBaseline='middle';
      view.ctx.beginPath()
      view.ctx.arc((x * w) + (w/2), (y * w) + (w/2), w/12, 0, 2*Math.PI);
      view.ctx.fill()
      view.ctx.fillStyle = '#fff'
      view.ctx.fillText(this.human.attrs.route[i], (x * w) + (w/2), (y * w) + (w/2));

    }
  }

  
  view.ctx.restore()
  
}
