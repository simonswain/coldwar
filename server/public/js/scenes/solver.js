/*global Scenes:true, Actors:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Scenes.solver = function(env, opts){
  this.env = env;
  this.opts = this.genOpts(opts);
  this.attrs = this.genAttrs();
  this.init();
};

Scenes.solver.prototype = Object.create(Scene.prototype);

Scenes.solver.prototype.title = 'Solver';

Scenes.solver.prototype.genAttrs = function(){
  return {
    ttl: 1,
    rows: this.opts.rows,
    cols: this.opts.cols,
    phase: 'gen'
  };
};

Scenes.solver.prototype.init = function(){
  this.makeGrid();
  this.attrs.ttl = this.opts.ttl;
  // this._steps = {
  //   cell: pickOne(this.cells),
  //   other: false,
  //   stack: [],
  //   total: this.cells.length,
  //   visited: 1,
  //   hot: false,
  // };
  this.generatePerfectMaze();
  this._solve = null;
}

Scenes.solver.prototype.defaults = [{
  key: 'max_x',
  value: 480,
  min: 32,
  max: 1024
}, {
  key: 'max_y',
  value: 480,
  min: 32,
  max: 1024
}, {
  key: 'rows',
  value: 8,
  min: 2,
  max: 24
}, {
  key: 'cols',
  value: 8,
  min: 2,
  max: 32
}, {
  key: 'ttl',
  value: 1,
  min: 1,
  max: 32
}];

Scenes.solver.prototype.makeGrid = function () {
  // init blank grid
  this.cells = new Array(this.attrs.rows * this.attrs.cols);
  x = 0;
  y = 0;
  for (i = 0, ii = this.cells.length; i<ii; i++) {
    this.cells[i] = {
      i: i,
      x: x,
      y: y,
      exits: [
        null, null, null, null
      ],
      gridmates: [
        null, null, null, null
      ]
    };
    x ++;
    if(x === this.attrs.cols){
      x = 0;
      y ++;
    }
  }

  var dirs = [[0,-1], [1,0], [0,1], [-1,0]];
  var i, ix, exit;
  var other, cell;
  for (i = 0, ii = this.cells.length; i<ii; i++) {
    cell = this.cells[i]
    for (exit = 0; exit<4; exit++) {
      x = cell.x + dirs[exit][0];
      y = cell.y + dirs[exit][1];
      if(y<0 || x<0 || x>=this.attrs.cols || y>=this.attrs.rows){
        continue;
      }
      ix = (y * this.attrs.cols) + x;
      cell.gridmates[exit] = this.cells[ix]
    }
  }
}

Scenes.solver.prototype.update = function(delta){
  if(this.attrs.phase === 'gen'){
    this.makeGrid();
    this.generatePerfectMaze();
    this.attrs.phase = 'solve'
    //this.gen(delta);
  } else {
    this.solve(delta);
  }
}

Scenes.solver.prototype.solve = function(delta){

  if(this.attrs.ttl >= 0){
    this.attrs.ttl -= delta / 10
    return
  }
  this.attrs.ttl += this.opts.ttl
  
  function distanceFunction(pos0, pos1){
    var d1 = Math.abs(pos1.x - pos0.x);
    var d2 = Math.abs(pos1.y - pos0.y);
    return d1 + d2;
  }

  var worldSize = this.cells.length;
  var from_i = 0;
  var to_i = worldSize - 1;

  var cell = this.cells[from_i];
  var other = this.cells[to_i];

  var solve;
  solve = this._solve;
  if(!solve){
    solve = {};
    solve.nodes = [];
    for(i=0; i<worldSize; i++){
      solve.nodes[i] = {
        i: i,
        f: 0, // g + h
        g: 0, // cost
        h: 0, // heuristic
        parent: null,
        cell: this.cells[i]
      }
    }
    solve.nodes[from_i].f = distanceFunction(this.cells[from_i], this.cells[to_i]);
    solve.astar = new Array(worldSize);
    solve.astar[from_i] = true;
    solve.open = [from_i]; // discovered nodes to be evaluated 
    solve.result = []; // final output
    solve.x = null;
    solve.path = null
    solve.length = null;
    solve.max = null;
    solve.min = null;
    solve.i = null;
    solve.j = null;
    solve.exits = null
    solve.gScore = null;
    solve.gScoreIsBest = null;
    solve.from_i = from_i;
    solve.to_i = to_i;
    this._solve = solve;
  }

  var nodes = solve.nodes;
  var astar = solve.astar
  var open = solve.open;
  var result = solve.result;
  var x = solve.x;
  var path = solve.path;
  var length = solve.length;
  var max = solve.max;
  var min = solve.min;
  var i = solve.i;
  var j = solve.j;
  var exits = solve.exist;
  var gScore = solve.gScore;
  var gScoreIsBest = solve.gScoreIsBest;

  // iterate through the open list until none are left
  if(length = open.length) {
    max = worldSize;
    min = -1;
    for(i = 0; i < length; i++) {
      if(nodes[i].f < max) {
        max = nodes[i].f;
        min = i;
      }
    }

    // grab the next node and remove it from open array
    //console.log('open', open);
    x = open.splice(min, 1)[0];
    //console.log('checking', x);
    // is it the destination node?
    if(x === to_i) {
      path = nodes[to_i];
      nodes[from_i].parent = null;
      //console.log('FOUND', to_i, 'path', path.i);
      do {
        //console.log('>>', path.i);
        result.push(path.i);
      } while (path = path.parent);
      // we want to return start to finish
      //console.log('>>>', to_i);
      //result.unshift(to_i);
      result.reverse();
      //console.log('RESULT', result);

      //this._steps.cell = false;
      this.attrs.phase = 'gen'
      this.init();
      return;
    }
    
    // find which nearby nodes are walkable
    exits = this.cells[x].exits;
    // test each one that hasn't been tried already
    for(i = 0, j = exits.length; i < j; i++) {
      // no other cell in that direction
      if(!exits[i]){
        continue;
      }
      gScore = nodes[x].g + 1; // 1 is the distance from a node to it's neighbor
      gScoreIsBest = false;
      //console.log('node ', x, ' -> ', exits[i].i, gScore);
      path = nodes[exits[i].i];
      if (!astar[path.i]) {
        //console.log('exit', i, '>>', path.i);
        astar[path.i] = true;
        gScoreIsBest = true;
        // estimated cost of this particular route so far
        nodes[path.i].h = 1;
        nodes[path.i].g = nodes[x].g + 1;
        //console.log('path', path.i, 'h =', nodes[path.i].h, 'g =', nodes[path.i].g);
        // estimated cost of entire guessed route to the destination
        nodes[path.i].f = nodes[x].g + distanceFunction(exits[i], other);
        //console.log(nodes[path.i].f, nodes[path.i].g, nodes[path.i].h);
        // remember this new path for testing above
        // mark this node in the world graph as visited
        open.push(path.i);
      } else if(gScore < nodes[path.i].g) {
        //console.log('NODE ', x, ' => ', path.i, gScore);
        gScoreIsBest = true;
      }

      if(gScoreIsBest) {
        // Found an optimal (so far) path to this node.  Store info on how we got here and
        //	just how good it really is...
        //console.log('PARENT', path.i, x);
        //          console.log('BEST', path.i);
        nodes[path.i].parent = nodes[x];
        nodes[path.i].g = gScore;
        nodes[path.i].f = nodes[path.i].g + 1;
      }
    }
  } // keep iterating until until the open list is empty
  return result;
  
  // if(solved){
  // }
}

Scenes.solver.prototype.generatePerfectMaze = function () {

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

Scenes.solver.prototype.gen = function(delta){

  // if(this.attrs.ttl >= 0){
  //   this.attrs.ttl -= delta
  //   return
  // }
  // this.attrs.ttl += this.opts.ttl

  var n, i, j, k, c;
  var cell, pick, other, dir
  var flip = [2,3,0,1];
  var plucked = false;
  
  cell = this._steps.cell;
  this._steps.other = false;
  while(this._steps.visited < this._steps.total && ! plucked){
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
      this._steps.hot = [cell, other, dir];
      cell.exits[dir] = other
      other.exits[flip[dir]] = cell
      this._steps.stack.push(cell)
      this._steps.other = cell;
      this._steps.cell = other
      this._steps.visited ++
      plucked = true;
      break;
    } else {
      this._steps.cell = this._steps.stack.pop()
      break;
    }
  }

  if(this._steps.visited === this._steps.total && this._steps.stack.length > 0){
    this._steps.cell = this._steps.stack.pop()
    if(this._steps.stack.length === 0){
      this._steps.cell = null;      
      this.attrs.phase = 'solve';
    }
  }
}

Scenes.solver.prototype.paint = function(fx, gx, sx){
  if(this.attrs.phase === 'gen'){
    this.paintGen(fx, gx, sx);
  } else {
    this.paintSolve(fx, gx, sx);
  }
}

Scenes.solver.prototype.paintGen = function(fx, gx, sx){

  var ww = this.opts.max_x / this.attrs.rows;
  var hh = this.opts.max_y / this.attrs.cols;

  gx.ctx.save();
  
  gx.ctx.lineWidth = 6;
  gx.ctx.strokeStyle = 'rgba(255,0,0,1)';
  gx.ctx.strokeStyle = 'rgba(255,0,0,' + (0.5-(Math.sin(Math.PI * (Date.now()%2000)/1000)/2)) + ')';

  var x, y;
  
  for(var i = 0, ii=this.attrs.rows * this.attrs.cols; i < ii; i++){
    x = i % this.attrs.cols;
    y = Math.floor(i / this.attrs.rows);

    var cell = this.cells[i];

    gx.ctx.save();
    gx.ctx.translate(ww * x * 0.1, hh * y * 0.1);
    gx.ctx.scale(0.9, 0.9);

    if(this._steps){

      if(this._steps.stack.indexOf(this.cells[i]) > -1){
        gx.ctx.fillStyle = '#033';
        gx.ctx.beginPath();
        gx.ctx.fillRect((x * ww), (y * hh), ww, hh);
      }

      if(this._steps.cell){
        if(this._steps.hot && this._steps.cell.i === i){
          gx.ctx.fillStyle = '#ff0';
          gx.ctx.beginPath();
          gx.ctx.fillRect((x * ww), (y * hh), ww, hh);
        }
      }
    }

    gx.ctx.lineWidth = 6;
    gx.ctx.strokeStyle = 'rgba(255,0,0,1)';
    
    if(!cell.exits[0]){
      gx.ctx.beginPath();
      gx.ctx.moveTo(
        (x * ww),
        (y * hh)
      )
      gx.ctx.lineTo(
        (x * ww) + ww,
        (y * hh)
      )
      gx.ctx.stroke();
    }

    if(!cell.exits[1]){
      gx.ctx.beginPath();
      gx.ctx.moveTo(
        (x * ww) + ww,
        (y * hh)
      )
      gx.ctx.lineTo(
        (x * ww) + ww,
        (y * hh) + hh
      )
      gx.ctx.stroke();
    }

    if(!cell.exits[2]){
      gx.ctx.beginPath();
      gx.ctx.moveTo(
        (x * ww) + ww,
        (y * hh) + hh
      )
      gx.ctx.lineTo(
        (x * ww) ,
        (y * hh) + hh
      )
      gx.ctx.stroke();
    }

    if(!cell.exits[3]){
      gx.ctx.beginPath();
      gx.ctx.moveTo(
        (x * ww),
        (y * hh) + hh
      )
      gx.ctx.lineTo(
        (x * ww),
        (y * hh)
      )
      gx.ctx.stroke();
    }

    gx.ctx.restore();

  }

  gx.ctx.restore();

  
}


Scenes.solver.prototype.paintSolve = function(fx, gx, sx){

  if(!this._solve){
    return;
  }
  
  var ww = this.opts.max_x / this.attrs.rows;
  var hh = this.opts.max_y / this.attrs.cols;

  gx.ctx.save();
  gx.ctx.translate(this.opts.max_x * 0.05, this.opts.max_y * 0.05);
  gx.ctx.scale(0.9, 0.9);
  
  var x, y;
  
  for(var i = 0, ii=this.attrs.rows * this.attrs.cols; i < ii; i++){
    x = i % this.attrs.cols;
    y = Math.floor(i / this.attrs.rows);

    var cell = this.cells[i];

    gx.ctx.lineCap='round';
    
    gx.ctx.save();

    if(this._solve.nodes[i].g > 0){
      gx.ctx.fillStyle = '#009';
      gx.ctx.beginPath();
      gx.ctx.fillRect((x * ww), (y * hh), ww, hh);
    }
    

    if(this._solve.open.indexOf(i) > -1){
      gx.ctx.fillStyle = '#f00';
      gx.ctx.beginPath();
      gx.ctx.fillRect((x * ww), (y * hh), ww, hh);
    }

    if(this._solve.from_i === i){
      gx.ctx.fillStyle = '#f00';
      if(Date.now() % 300 < 100){ 
        gx.ctx.fillStyle = '#ff0';
      }
      gx.ctx.beginPath();
      gx.ctx.fillRect((x * ww), (y * hh), ww, hh);
    }

    if(this._solve.to_i === i){
      gx.ctx.fillStyle = '#ff0';
      if(Date.now() % 250 < 150){ 
        gx.ctx.fillStyle = '#f00';
      }
      gx.ctx.beginPath();
      gx.ctx.fillRect((x * ww), (y * hh), ww, hh);
    }

    if(this._solve.nodes[i].g > 0){
      gx.ctx.fillStyle = '#c00';
      gx.ctx.font = '18pt robotron';
      gx.ctx.textAlign = 'center';
      gx.ctx.textBaseline = 'middle';
      gx.ctx.fillStyle = '#fff';
      gx.ctx.fillText(this._solve.nodes[i].g, (x * ww) + ww/2, (y * hh) + hh/2);
    };
    
    gx.ctx.lineWidth = 4;
    gx.ctx.strokeStyle = 'rgba(0,255,0,1)';

    if(!cell.exits[0]){
      gx.ctx.beginPath();
      gx.ctx.moveTo(
        (x * ww),
        (y * hh)
      )
      gx.ctx.lineTo(
        (x * ww) + ww,
        (y * hh)
      )
      gx.ctx.stroke();
    }

    if(!cell.exits[1]){
      gx.ctx.beginPath();
      gx.ctx.moveTo(
        (x * ww) + ww,
        (y * hh)
      )
      gx.ctx.lineTo(
        (x * ww) + ww,
        (y * hh) + hh
      )
      gx.ctx.stroke();
    }

    if(!cell.exits[2]){
      gx.ctx.beginPath();
      gx.ctx.moveTo(
        (x * ww) + ww,
        (y * hh) + hh
      )
      gx.ctx.lineTo(
        (x * ww) ,
        (y * hh) + hh
      )
      gx.ctx.stroke();
    }

    if(!cell.exits[3]){
      gx.ctx.beginPath();
      gx.ctx.moveTo(
        (x * ww),
        (y * hh) + hh
      )
      gx.ctx.lineTo(
        (x * ww),
        (y * hh)
      )
      gx.ctx.stroke();
    }

    gx.ctx.restore();

  }

  gx.ctx.restore();

  
}
