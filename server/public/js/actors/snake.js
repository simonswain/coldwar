/* global Actors, Actor, Vec3, VecR */

Actors.Snake = function (env, refs, attrs) {
  this.env = env
  this.refs = refs
  this.opts = this.genOpts()
  this.attrs = this.genAttrs(attrs)
  this.init(attrs)
}

Actors.Snake.prototype = Object.create(Actor.prototype)

Actors.Snake.prototype.title = 'Snake'

Actors.Snake.prototype.init = function (attrs) {
  this.memory = [];
  for(var i = 0, ii=this.opts.rows * this.opts.cols; i < ii; i++){
    this.memory.push(false);
  }

  this.tries = 0;
  this.tried = [];
  this.snake = [];
  this.makeSnake();
  this.score = this.snake.length;
  this.plan = null;
  this.makeWalls();

}

Actors.Snake.prototype.genAttrs = function (attrs) {
  return {
    ttl: 0,
    frame_index: 0,
    step_index: 0,
    time: 0,
    hold: 0,
    dead: false
  };
}

Actors.Snake.prototype.defaults = [{
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
  value: 16,
  min: 3,
  max: 24
}, {
  key: 'cols',
  value: 16,
  min: 8,
  max: 32
}, {
  key: 'hold',
  value: 8,
  min: 0,
  max: 32
}]

Actors.Snake.prototype.vec = function () {
  var i = this.snake[0];
  var x = i % this.opts.rows;
  var y = Math.floor(i / this.opts.cols);
  return new Vec3(x * (this.opts.max_x / this.opts.cols), y * (this.opts.max_y/this.opts.rows));
}

Actors.Snake.prototype.update = function (delta, intent) {
  this.attrs.ttl -= delta;

  if(this.attrs.ttl > 0){
    return;
  }

  this.attrs.ttl = this.opts.hold
  
  if(!this.food){
    this.makeFood();
    this.plan = this.route();
  }

  if(this.plan.length > 0){
    var tx = this.plan.shift();
    this.snake.unshift(tx);
    if(this.snake[0] === this.food){
      this.score += 2;
      this.food = false;
    }
    while(this.snake.length > this.score){
      this.snake.pop();
    }
  }

  if(this.snake.length > 16){
    this.split();
  }

  if(this.plan.length === 0){
    this.tries ++;
    if(this.tries > 50){
      this.kill()
    }
  }

}

Actors.Snake.prototype.split = function () {

  // find empty neighbour cell
  // if none, kill this snake, done
  
  // create another snake in neighbour
  // make this snake 

  var exits = [];
  for(var i = 0, ii=this.refs.cell.exits.length; i<ii; i++){
    if(!this.refs.cell.exits[i]) {
      continue;
    }
    if(this.refs.cell.exits[i].snake) {
      continue;
    }
    if(this.refs.cell.exits[i].logo) {
      continue;
    }
    if(this.refs.cell.exits[i].capacitor) {
      continue;
    }
    if(this.refs.cell.exits[i].capacitors) {
      continue;
    }
    if(this.refs.cell.exits[i].machine) {
      continue;
    }
    if(this.refs.cell.exits[i].breeders.length > 0) {
      continue;
    }
    if(this.refs.cell.exits[i].reactor) {
      continue;
    }
    if(this.refs.cell.exits[i].portal) {
      continue;
    }
    if(this.refs.cell.exits[i].logo) {
      continue;
    }
    exits.push(this.refs.cell.exits[i]);
  }

  if(exits.length === 0){
    this.kill();
    return;
  }
  
  var cell = pickOne(exits);
  cell.addSnake();

  // shorten remaining snake
  while(this.snake.length > 8){
    this.snake.pop();
  }
   
}

Actors.Snake.prototype.kill = function () {
  if (this.attrs.dead) {
    return
  }
  this.attrs.dead = true;
}

Actors.Snake.prototype.makeSnake = function(){
  var ok = false;
  var x, y, ix;
  x = Math.floor(Math.random() * this.opts.cols);
  y = Math.floor(Math.random() * this.opts.rows);
  ix = (this.opts.rows*y)+x;
  this.snake.push(ix);

  while (!ok) {
    switch(Math.floor(Math.random() * 4)) {
    case 0: x--; break;
    case 1: x++; break;
    case 2: y--; break;
    case 3: y++; break;
    }

    if(x < 0 || x >= this.opts.cols) {
      continue;
    }
    if(y < 0 || y >= this.opts.rows) {
      continue;
    }

    ix = (this.opts.rows*y)+x;
    this.snake.push(ix);
    ok = true;
  }
};

Actors.Snake.prototype.makeWalls = function(){
  var total = Math.random() * 16;
  for(var i = 0; i < total; i++) {
    var wall = {}
    var x = Math.floor(Math.random() * this.opts.cols);
    var y = Math.floor(Math.random() * this.opts.rows);

    var ix = (this.opts.rows*y)+x;
    if(this.memory[ix]){
      i--;
      continue;
    }
    this.memory[ix] = 'w';
  }
};

Actors.Snake.prototype.makeFood = function(){
  var ok = false;
  var x, y, ix;
  var inSnake;
  while(!ok){
    inSnake = false;
    x = Math.floor(Math.random() * this.opts.cols);
    y = Math.floor(Math.random() * this.opts.rows);
    ix = (this.opts.rows * y) + x;
    if(this.memory[ix]){
      continue;
    }
    for(var i = 0; i <= this.snake.length; i++) {
      if(this.snake[i] === ix){
        inSnake = true;
        break;
      }
    }
    if(inSnake){
      continue;
    }
    this.food = ix;
    ok = true;
  }
};

Actors.Snake.prototype.route = function () {

  var i, j;
  var from_i = this.snake[0];
  var to_i = this.food;

  var opts = this.opts;
  var memory = this.memory;
  var snake = this.snake;

  var worldSize = this.opts.rows * this.opts.cols

  var nodes = [];
  for(i=0; i < worldSize; i++){
    nodes[i] = {
      i: i,
      f: 0, // g + h
      g: 0, // cost
      h: 0, // heuristic
      parent: null
    }
  }

  var self = this;

  function distanceFunction(a, b){
    var ax = a % opts.cols;
    var ay = Math.floor(a/opts.rows);
    var bx = b % opts.cols;
    var by = Math.floor(b/opts.rows);

    var d1 = Math.abs(ax - bx);
    var d2 = Math.abs(by - by);
    return d1 + d2;
  }

  var findExits = function(ix){
    var exits = [];
    var adds = [[0,-1],[1,0],[0,1],[-1,0]];
    var x, y, xx, yy, q, inSnake, i, j;
    x = ix % opts.cols;
    y = Math.floor((ix - x)/opts.rows);

    for(i=0; i<4; i++){
      xx = x + adds[i][0];
      yy = y + adds[i][1];
      if(xx < 0 || xx >= opts.cols){
        continue;
      }
      if(yy < 0 || yy >= opts.rows){
        continue;
      }
      q = (yy * opts.cols) + xx;
      if(q >= worldSize){
        continue;
      }
      if(memory[q]){
        continue;
      }
      inSnake = false;
      for(j = 0; j < snake.length; j++) {
        if(snake[j] === q){
          inSnake = true;
          break;
        }
      }
      if(inSnake){
        continue;
      }
      exits.push(q);
    }
    return exits;
  }

  nodes[from_i].f = distanceFunction(from_i, to_i);

  // create an array that will contain all world cells
  var astar = new Array(worldSize);
  var open = [from_i]; // discoverd nodes to be evaluated
  var result = []; // final output
  var x; // node we are considering
  var path; // reference to a Node (that starts a path in question)
  var length, max, min;
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
    x = open.splice(min, 1)[0];
    // is it the destination node?
    if(x === to_i) {
      path = nodes[to_i];
      nodes[from_i].parent = null;
      do {
        result.push(path.i);
      } while (path = path.parent);
      result.reverse();
      break;
    } else {
      // find which nearby nodes are walkable
      exits = findExits(x);
      // test each one that hasn't been tried already
      for(i = 0, j = exits.length; i < j; i++) {
        gScore = nodes[x].g + 1; // 1 is the distance from a node to it's neighbor
        gScoreIsBest = false;
        path = exits[i];
        if (!astar[path]) {
          astar[path] = true;
          gScoreIsBest = true;
          // estimated cost of this particular route so far
          nodes[path].h = 1;
          nodes[path].g = nodes[x].g + 1;
          // estimated cost of entire guessed route to the destination
          nodes[path].f = nodes[x].g + distanceFunction(exits[i], to_i);
          // remember this new path for testing above
          // mark this node in the world graph as visited
          open.push(path);
        } else if(gScore < nodes[path].g) {
          gScoreIsBest = true;
        }

        if(gScoreIsBest) {
          nodes[path].parent = nodes[x];
          nodes[path].g = gScore;
          nodes[path].f = nodes[path].g + 1;
        }
      }
    }
  } // keep iterating until until the open list is empty
  return result;

};


Actors.Snake.prototype.paint = function (gx) {

  var ww = this.opts.max_x / this.opts.rows;
  var hh = this.opts.max_y / this.opts.cols;

  gx.ctx.save();

  var x, y;
  for(var i = 0, ii=this.opts.rows * this.opts.cols; i < ii; i++){
    x = i % this.opts.cols;
    y = Math.floor(i/this.opts.rows);

    gx.ctx.fillStyle = '#222';
    gx.ctx.strokeStyle = '#222';

    if(this.memory[i] === 'w'){
      // gx.ctx.fillStyle = '#090';
      // gx.ctx.beginPath();
      // gx.ctx.lineWidth = 2;
      // gx.ctx.rect(
      //   x * ww,
      //   y * hh,
      //   ww,
      //   hh
      // )
      // gx.ctx.fill();
      // gx.ctx.stroke();
    } else {
      // gx.ctx.fillStyle = '#090';
      // gx.ctx.beginPath();
      // gx.ctx.lineWidth = 2;
      // gx.ctx.rect(
      //   x * ww,
      //   y * hh,
      //   ww,
      //   hh
      // )
      // gx.ctx.stroke();
    }
  }

  // snake
  var step = 1 / this.snake.length;
  for(var i = 0, ii=this.snake.length; i < ii; i++){
    x = this.snake[i] % this.opts.cols;
    y = Math.floor(this.snake[i]/this.opts.rows);

    gx.ctx.fillStyle = 'rgba(0, 255, 0,' + (((ii-i) * step)) + ')';
    gx.ctx.beginPath();
    gx.ctx.lineWidth = 2;
    gx.ctx.rect(
      x * ww,
      y * hh,
      ww,
      hh
    )
    gx.ctx.fill();
    gx.ctx.stroke();
  }

  // head
  x = this.snake[0] % this.opts.cols;
  y = Math.floor(this.snake[0]/this.opts.rows);
  var h = (Date.now()%360 * 0.22) - 10;
  var c;
  c = 'hsl(' + h + ', 100%, 50%)';

  if(Math.random() < 0.025){
    c = 'rgba(255,255,0,0.5)';
  }

  if(Math.random() < 0.15){
    c = 'rgba(255,255,255,1)';
  }

  gx.ctx.shadowColor = c;
  gx.ctx.shadowBlur = 40;
  gx.ctx.shadowOffsetX = 0;
  gx.ctx.shadowOffsetY = 0;
  gx.ctx.shadowBlur = ww * 5;

  gx.ctx.fillStyle = c;
  gx.ctx.stroketyle = c;
  gx.ctx.beginPath();
  gx.ctx.lineWidth = 2;
  gx.ctx.rect(
    x * ww,
    y * hh,
    ww,
    hh
  )
  gx.ctx.fill();
  gx.ctx.stroke();
  gx.ctx.shadowBlur = 0;
  
  // // food
  // if(this.food){
  //   x = this.food % this.opts.cols;
  //   y = Math.floor(this.food/this.opts.rows);
  //   var h = (Date.now()%360 * 0.22) - 10;
  //   var c;
  //   c = 'hsl(' + h + ', 100%, 50%)';

  //   if(Math.random() < 0.025){
  //     c = 'rgba(255,255,0,0.5)';
  //   }

  //   if(Math.random() < 0.15){
  //     c = 'rgba(255,255,255,1)';
  //   }

  //   gx.ctx.shadowColor = c;
  //   gx.ctx.shadowBlur = 40;
  //   gx.ctx.shadowOffsetX = 0;
  //   gx.ctx.shadowOffsetY = 0;
  //   gx.ctx.shadowBlur = ww * 5;

  //   gx.ctx.fillStyle = c;
  //   gx.ctx.stroketyle = c;
  //   gx.ctx.beginPath();
  //   gx.ctx.lineWidth = 2;
  //   gx.ctx.rect(
  //     x * ww,
  //     y * hh,
  //     ww,
  //     hh
  //   )
  //   gx.ctx.fill();
  //   gx.ctx.stroke();
  //   gx.ctx.shadowBlur = 0;
  // }

  gx.ctx.restore();

}
