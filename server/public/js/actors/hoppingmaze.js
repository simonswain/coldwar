/* global Actors, Actor */

Actors.Hoppingmaze = function (env, refs, attrs, opts) {

  this.env = env
  this.refs = refs
  this.opts = this.genOpts(opts)
  this.attrs = this.genAttrs(attrs)
  this.init()
}

Actors.Hoppingmaze.prototype = Object.create(Actor.prototype)

Actors.Hoppingmaze.prototype.title = 'Hoppingmaze'

Actors.Hoppingmaze.prototype.genAttrs = function (attrs) {
  return {
    ttl: 0,
    //ttl: (this.opts.rows * this.opts.cols > 24) ? 0 : 8,
    phase: 'gen',
    max: Math.min(this.opts.max_x, this.opts.max_y),
    escape: false,
    escape_done: false,
    rows: attrs.rows || this.opts.rows,
    cols: attrs.cols || this.opts.cols,
    human: attrs.human,
    humanCountdown: 60,
    boom: false,
    boomCountdown: 0
  }
}

Actors.Hoppingmaze.prototype.init = function () {
  this.makeGrid();
  this.human = false;

  this._steps = {
    ttl: this.attrs.ttl,
    cell: -1,
    other: false,
    other_dir: null,
    stack: [],
    total: this.cells.length,
    visited: 1,
    done: false
  }; 
};

Actors.Hoppingmaze.prototype.defaults = [{
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

Actors.Hoppingmaze.prototype.makeGrid = function () {

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

  if(!this.attrs.phase){
    this.generatePerfectMaze();
    this.seedActors();
  }

}

Actors.Hoppingmaze.prototype.seedActors = function () {
  this.attrs.entry_cell = 0;
  //this.attrs.reactor_cell = this.cells.length-1;
  //this.addReactor(this.attrs.reactor_cell);
  //this.portal = this.addPortal(this.attrs.entry_cell);
  this.addBreeder(this.cells.length-1);
};

Actors.Hoppingmaze.prototype.makeGridmates = function () {
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

Actors.Hoppingmaze.prototype.connectAllCells = function () {
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

Actors.Hoppingmaze.prototype.randomJoins = function (max) {

  if(!max){
    max = 1
  }

  for(var i=0; i<max; i++){
    this.randomJoin();
  }

}

Actors.Hoppingmaze.prototype.generatePerfectMaze = function (max) {
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


Actors.Hoppingmaze.prototype.randomJoin = function () {

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


Actors.Hoppingmaze.prototype.randomSplits = function (max) {

  if(!max){
    max = 1
  }

  for(var i=0; i<max; i++){
    this.randomSplit();
  }

}

Actors.Hoppingmaze.prototype.randomSplit = function () {

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

Actors.Hoppingmaze.prototype.randomBreeders = function (max) {
  if(!max){
    max = 0
  }
  for(var i=0; i<max; i++){
    this.randomBreeder();
  }
}

Actors.Hoppingmaze.prototype.addBreeder = function (ix) {
  this.cells[ix].addBreeder();
}

Actors.Hoppingmaze.prototype.addReactor = function (ix) {
  this.cells[ix].addReactor();
}

Actors.Hoppingmaze.prototype.randomBreeder = function (max) {
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


Actors.Hoppingmaze.prototype.randomReactors = function (max) {
  if(!max){
    max = 1
  }
  for(var i=0; i<max; i++){
    this.randomReactor();
  }
}


Actors.Hoppingmaze.prototype.randomReactor = function (max) {
  var ix = random.from0upto(this.cells.length)
  this.cells[ix].addReactor();
}

Actors.Hoppingmaze.prototype.addHuman = function (ix) {
  var human = this.cells[ix].addHuman();
  return human
}

Actors.Hoppingmaze.prototype.addPortal = function (ix) {
  var portal = this.cells[ix].addPortal();
  return portal
}

Actors.Hoppingmaze.prototype.randomHuman = function (max) {
  var ix = random.from0upto(this.cells.length)
  this.cells[ix].addHuman();
}

Actors.Hoppingmaze.prototype.randomHumans = function (max) {
  if(!max){
    max = 1
  }
  for(var i=0; i<max; i++){
    this.randomHuman();
  }
}

Actors.Hoppingmaze.prototype.route = function (cell, other) {

  if(!cell || !other){
    return []
  }
  
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

Actors.Hoppingmaze.prototype.doGenPhase = function (delta) {
  if(this._steps.ttl >= 0){
    this._steps.ttl -= delta
    return
  }

  this.env.play('computer')
  
  this._steps.ttl += this.attrs.ttl

  if (this._steps.cell === -1) {
    this._steps.cell = pickOne(this.cells);
    return;
  }

  var n, i, j, k, c;
  var cell, pick, other, dir
  var flip = [2,3,0,1];
  var plucked = false;

  if(this._steps.other){
    this._steps.showCell = this._steps.cell;
    this._steps.cell.exits[this._steps.other_dir] = this._steps.other
    this._steps.other.exits[flip[this._steps.other_dir]] = this._steps.cell
    this._steps.stack.push(this._steps.cell)
    this._steps.cell = this._steps.other;
    this._steps.other = false;
    this._steps.visited ++
    return;
  }
  
  cell = this._steps.cell;
  while(this._steps.visited < this._steps.total && !plucked){
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
      this._steps.other_dir = pick[0]
      this._steps.other = pick[1]
      plucked = true;
      break;
    } else {
      this._steps.cell = this._steps.stack.pop()
      break;
    }
  }
  
  if(this._steps.visited === this._steps.total){
    if(this._steps.stack.length > 0){
      this._steps.cell = this._steps.stack.pop();
      return;
    }

    if(this._steps.done){
      if(!this.env.gameover){
        this._steps.cell = false;
        if(this.attrs.rows < 24){
          this.attrs.rows ++;
          this.attrs.cols ++;
          this.attrs.ttl *= 0.25; 
          if(this.attrs.ttl < 0.1){
            this.attrs.ttl = 0
          }
          
        }
        this.init();
      }
      return;
    }

    if(this._steps.stack.length === 0){
      this.attrs.phase = 'seed'
      this._steps.done = true;
      //this._steps.cell = false;
      return;
    }
  }

};

Actors.Hoppingmaze.prototype.update = function (delta) {

  if(this.attrs.phase == 'gen'){
    this.doGenPhase(delta);
    return;
  } 

  if(this.attrs.phase == 'seed'){
    this.seedActors();
    this.attrs.phase = null;
    return;
  } 
  
  if(this.attrs.human) {
    if(this.attrs.humanCountdown > 0){
      if(this.attrs.humanCountdown%10 === 0){
        this.env.play('rad-short')
      }
      
      this.attrs.humanCountdown --;
      if(this.attrs.humanCountdown === 15){
        this.env.play('entry')
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
  }

  if(this.attrs.escape_done && !this.human.attrs.escaped){
    this.human.attrs.escaped = true;
    this.attrs.boom = true;;
    this.attrs.boomCountdown = 60;
      this.env.play('warpout')
    
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

  if(this.attrs.boom && this.attrs.boomCountdown === 15){
    this.cells[this.attrs.reactor_cell].reactors[0].detonate();
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

Actors.Hoppingmaze.prototype.paint = function (view) {

  var max = Math.max(this.opts.max_x, this.opts.max_y);
  var min = Math.min(this.opts.max_x, this.opts.max_y);
  var rc = Math.max(this.attrs.rows, this.attrs.cols);

  var w = (max/rc);
  var f = (w/this.opts.cell_w);
  
  view.ctx.save()

  // if(this.opts.fit){
  //   view.ctx.translate(this.attrs.max * 0.05, this.attrs.max * 0.05);
  //   view.ctx.scale(0.9, 0.9);
  // }

  view.ctx.translate(
    (this.opts.max_x - (this.attrs.cols * w))/2,
    (this.opts.max_y - (this.attrs.rows * w))/2
  );


  var x, y, i, ii;
  var cell;

  if(this.attrs.phase == 'gen'){
    var x, y, i, ii;
    var cell;

    for(i = 0, ii=this.attrs.rows * this.attrs.cols; i < ii; i++){
      x = i % this.attrs.rows
      y = Math.floor(i / this.attrs.cols);

      cell = this.cells[i];
      view.ctx.save();
      if(this._steps.stack.indexOf(cell) > -1){
        view.ctx.fillStyle = '#300';
        view.ctx.strokeStyle = '#300';
        view.ctx.beginPath();
        view.ctx.rect((cell.attrs.x * w), (cell.attrs.y * w), w, w); 
        view.ctx.fill();
        view.ctx.stroke();
      }

      if(this._steps.other && this._steps.other.attrs.i === i){
        view.ctx.fillStyle = '#ff0';
        view.ctx.beginPath();
        view.ctx.fillRect((cell.attrs.x * w), (cell.attrs.y * w), w, w);
      }      

      if(this._steps.cell && this._steps.cell !== -1 && this._steps.cell.attrs.i === i){
        view.ctx.fillStyle = '#f00';
        view.ctx.beginPath();
        view.ctx.fillRect((cell.attrs.x * w), (cell.attrs.y * w), w, w);
      }      

      view.ctx.restore();
    }
  }



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

  
  if(this.attrs.human && !this.attrs.phase && this.attrs.humanCountdown > 10){
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
