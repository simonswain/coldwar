/* global Actors, Actor */

Actors.Maze = function (env, refs, attrs, opts) {

  this.env = env
  this.refs = refs
  this.opts = this.genOpts(opts)
  this.attrs = this.genAttrs(attrs)
  this.init()
}

Actors.Maze.prototype = Object.create(Actor.prototype)

Actors.Maze.prototype.title = 'Maze'

Actors.Maze.prototype.genAttrs = function (attrs) {
  return {
    max: Math.min(this.opts.max_x, this.opts.max_y),
    escape: false,
    escape_done: false,
    rows: attrs.rows || this.opts.rows,
    cols: attrs.cols || this.opts.cols,
    humanCountdown: 60,
    boom: false,
    boomCountdown: 0
  }
}

Actors.Maze.prototype.init = function () {
  this.makeGrid();
};

Actors.Maze.prototype.defaults = [{
  key: 'max_x',
  value: 640,
  min: 100,
  max: 1600
}, {
  key: 'max_y',
  value: 480,
  min: 100,
  max: 1000
}, {
  key: 'rows',
  value: 3,
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
  value: 2,
  min: 0,
  max: 16
}]

Actors.Maze.prototype.makeGrid = function () {

  // init blank grid
  this.booms = [];

  this.cells = new Array(this.attrs.rows * this.attrs.cols);
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
    if(x === this.attrs.cols){
      x = 0;
      y ++;
    }
  }

  this.makeGridmates();

  this.generatePerfectMaze();
  this.attrs.entry_cell = 0;
  this.attrs.reactor_cell = this.cells.length-1;
  this.addReactor(this.attrs.reactor_cell);
  this.portal = this.addPortal(this.attrs.entry_cell);
  this.randomBreeders(this.opts.breeders);

}

Actors.Maze.prototype.makeGridmates = function () {
  var dirs = [[0,-1], [1,0], [0,1], [-1,0]];
  var i, ix, exit;
  var other, cell;
  for (i = 0, ii = this.cells.length; i<ii; i++) {
    cell = this.cells[i]
    for (exit = 0; exit<4; exit++) {
      x = cell.attrs.x + dirs[exit][0];
      y = cell.attrs.y + dirs[exit][1];
      if(y<0 || x<0 || x>=this.attrs.cols || y>=this.attrs.rows){
        continue;
      }
      ix = (y * this.attrs.cols) + x;
      cell.gridmates[exit] = this.cells[ix]
    }
  }
}

Actors.Maze.prototype.connectAllCells = function () {
  var dirs = [[0,-1], [1,0], [0,1], [-1,0]];
  var i, ix, exit;
  var other;
  for (i = 0, ii = this.cells.length; i<ii; i++) {
    cell = this.cells[i]
    for (exit = 0; exit<4; exit++) {
      x = cell.attrs.x + dirs[exit][0];
      y = cell.attrs.y + dirs[exit][1];
      if(y<0 || x<0 || x>=this.attrs.cols || y>=this.attrs.rows){
        continue;
      }
      ix = (y * this.attrs.cols) + x;
      cell.exits[exit] = this.cells[ix]
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


Actors.Maze.prototype.randomSplits = function (max) {

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
    if(this.cells[ix].portals.length > 0){
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

Actors.Maze.prototype.addPortal = function (ix) {
  var portal = this.cells[ix].addPortal();
  return portal
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

  var from_i = cell.attrs.i;
  var to_i = other.attrs.i;

  function distanceFunction(pos0, pos1){
    var d1 = Math.abs(pos1.attrs.x - pos0.attrs.x);
    var d2 = Math.abs(pos1.attrs.y - pos0.attrs.y);
    return d1 + d2;
  }

  var worldSize = this.attrs.rows * this.attrs.cols

  var nodes = [];
  for(i=0; i<worldSize; i++){
    nodes[i] = {
      i: i,
      f: 0, // g + h
      g: 0, // cost
      h: 0, // heuristic
      parent: null,
      cell: this.cells[i]
    }
  }

  nodes[from_i].f = distanceFunction(this.cells[from_i], this.cells[to_i]);

  // create an array that will contain all world cells
  var astar = new Array(worldSize);
  var open = [from_i]; // discoverd nodes to be evaluated
  var result = []; // final output
  var x; // node we are considering
  var path; // reference to a Node (that starts a path in question)
  var length, max, min, i, j;
  var exits;
  var gScore, gScoreIsBest;

  astar[from_i] = true;

  // iterate through the open list until none are left
  while(length = open.length) {
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
      break;
    } else {
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
        //console.log('node ', x, ' -> ', exits[i].attrs.i, gScore);
        path = nodes[exits[i].attrs.i];
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
    }
  } // keep iterating until until the open list is empty
  return result;

};

Actors.Maze.prototype.update = function (delta) {

  if(this.attrs.humanCountdown > 0){
    this.attrs.humanCountdown --;

    if(this.attrs.humanCountdown === 15){
      this.booms.push(new Actors.Boom(
        this.env, {
        }, {
          style: 'decolonize',
          radius: 128,
          x: 0,
          y: 0,
          color: '0,255,255'
        }
      ))

      this.booms.push(new Actors.Boom(
        this.env, {
        }, {
          style: 'decolonize',
          radius: 132,
          x: 0,
          y: 0,
          color: '255,255,255',
          ttl: 20
        }
      ))

      this.booms.push(new Actors.Boom(
        this.env, {
        }, {
          style: 'decolonize',
          radius: 82,
          x: 0,
          y: 0,
          color: '255,255,255',
          ttl: 60
        }
      ))
    }

    if(this.attrs.humanCountdown === 0){
      this.human = this.addHuman(this.attrs.entry_cell);
    }
  }

  if(this.attrs.escape_done && !this.human.attrs.escaped){
    this.human.attrs.escaped = true;
    this.attrs.boom = true;;
    this.attrs.boomCountdown = 60;
      this.booms.push(new Actors.Boom(
        this.env, {
        }, {
          style: 'colonize',
          radius: 128,
          x: 0,
          y: 0,
          color: '0,255,255'
        }
      ))

      this.booms.push(new Actors.Boom(
        this.env, {
        }, {
          style: 'colonize',
          radius: 132,
          x: 0,
          y: 0,
          color: '255,255,255',
          ttl: 20
        }
      ))

      this.booms.push(new Actors.Boom(
        this.env, {
        }, {
          style: 'colonize',
          radius: 82,
          x: 0,
          y: 0,
          color: '255,255,255',
          ttl: 60
        }
      ))
  }
  
  if(this.attrs.boom && this.attrs.boomCountdown > 0){
    this.attrs.boomCountdown --;
    if(this.attrs.boomCountdown === 0){

      var i, ii;
      for (i = 0, ii = this.cells.length; i<ii; i++) {
        this.cells[i].killAllActors();
      }

      setTimeout(this.env.restart, 2500)
      //setTimeout(this.env.goNext, 2500)
    }
  }
  
  var i, ii;
  for (i = 0, ii = this.cells.length; i<ii; i++) {
    this.cells[i].update(delta);
  }

  for (i = 0, ii = this.booms.length; i<ii; i++) {
    if(this.booms[i]){
      this.booms[i].update(delta);
    }
  }

  for (i = 0, ii = this.booms.length; i<ii; i++) {
    if(!this.booms[i] || this.booms[i].attrs.dead){
      this.booms.splice(i, 1);
      i--
      ii--
    }
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
  var rc = Math.max(this.attrs.rows, this.attrs.cols);

  var w = (max/rc);
  var f = (w/this.opts.cell_w);

  view.ctx.translate(
    (this.opts.max_x - (this.attrs.cols * w))/2,
    (this.opts.max_y - (this.attrs.rows * w))/2
  );

  for (i = 0, ii = this.cells.length; i<ii; i++) {
    x = i % this.attrs.cols;
    y = Math.floor(i/this.attrs.rows);

    cell = this.cells[i]
    view.ctx.save()
    view.ctx.translate(cell.attrs.x * w, cell.attrs.y * w);
    view.ctx.scale(f, f);

    cell.paint(view);
    view.ctx.restore()
  }

  var routes, route, from, to, dx, dy;

  // show route
  
  if(this.human && this.human.attrs.route){
    routes = this.human.attrs.route; 
    
    if(!this._routeIndex){
      this._routeIndex = 0;
    }
    if(this._routeIndex >=  routes.length){
      this._routeIndex = 0;
    }

    for(i = 0, ii<routes.length; i<ii; i++){
      route = routes[i];
      // view.ctx.fillStyle = '#fff'
      // view.ctx.font = '14pt ubuntu mono, monospace'
      // view.ctx.textAlign='center';
      // view.ctx.textBaseline='middle';
      // view.ctx.fillText(routes[i], (w/2) + (i * w/4), w/8);

      // view.ctx.fillStyle = 'rgba(255,255,255,0.25)'
      // view.ctx.font = '12pt ubuntu mono, monospace'
      // view.ctx.textAlign='center';
      // view.ctx.textBaseline='middle';
      // view.ctx.beginPath()
      // view.ctx.arc((x * w) + (w/2), (y * w) + (w/2), w/12, 0, 2*Math.PI);
      // view.ctx.fill()
      // view.ctx.fillText(route, (x * w) + (w/4), (y * w) + (w/2));

      x = routes[i] % this.attrs.cols
      y = Math.floor(routes[i] / this.attrs.cols)
      
      from = this.cells[routes[i]];
      to = this.cells[routes[i+1]];

      if(from && from.breeders.length > 0){
        continue;
      }
      
      if(from && to){
        if(Math.floor(this._routeIndex) === i){
          if(this.attrs.escape){
            view.ctx.strokeStyle='rgba(255,0,0,0.75)';
          } else { 
            view.ctx.strokeStyle='rgba(0,255,255,0.75)';
          }
        } else {
          if(this.attrs.escape){
            view.ctx.strokeStyle='rgba(255,0,0,0.25)';
          } else { 
            view.ctx.strokeStyle='rgba(0,255,255,0.25)';
          }
        }
        view.ctx.lineWidth = 1
        view.ctx.beginPath();
        if(to.attrs.x > from.attrs.x){
          view.ctx.moveTo((x * w) + (w*0.5), (y * w) + (w*0.4));
          view.ctx.lineTo((x * w) + (w*0.6), (y * w) + (w*0.5));
          view.ctx.lineTo((x * w) + (w*0.5), (y * w) + (w*0.6));
        } else if(to.attrs.x < from.attrs.x){ 
         view.ctx.moveTo((x * w) + (w*0.5), (y * w) + (w*0.4));
          view.ctx.lineTo((x * w) + (w*0.4), (y * w) + (w*0.5));
          view.ctx.lineTo((x * w) + (w*0.5), (y * w) + (w*0.6));
        } else if(to.attrs.y > from.attrs.y){
          view.ctx.moveTo((x * w) + (w*0.4), (y * w) + (w*0.5));
          view.ctx.lineTo((x * w) + (w*0.5), (y * w) + (w*0.6));
          view.ctx.lineTo((x * w) + (w*0.6), (y * w) + (w*0.5));
        } else if(to.attrs.y < from.attrs.y){
          view.ctx.moveTo((x * w) + (w*0.4), (y * w) + (w*0.5));
          view.ctx.lineTo((x * w) + (w*0.5), (y * w) + (w*0.4));
          view.ctx.lineTo((x * w) + (w*0.6), (y * w) + (w*0.5));
        }
        view.ctx.stroke();
      }

    }
    this._routeIndex += 0.2
    5;
  }

  var boom;
  for (i = 0, ii = this.booms.length; i < ii; i++) {
    boom = this.booms[i]
    if(!boom){
      continue
    }      
    view.ctx.save()
    view.ctx.translate(w/2 + boom.attrs.x * w, w/2 + boom.attrs.y * w);
    this.booms[i].paint(view)
    view.ctx.restore()
  }

  if(this.attrs.humanCountdown > 10){
    view.ctx.save()
    view.ctx.fillStyle = '#0ff'
    view.ctx.font = '12pt robotron'
    view.ctx.textAlign='center';
    view.ctx.textBaseline='middle';
    view.ctx.fillText(Math.floor(this.attrs.humanCountdown/10), w * 0.5, w * 0.5);
    view.ctx.restore()
  }
 

  view.ctx.restore()

}
