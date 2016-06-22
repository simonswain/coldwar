/*global Scenes:true, Actors:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Scenes.snake = function(env, opts){
  this.env = env;
  this.opts = this.genOpts(opts);
  this.attrs = this.genAttrs();
  this.init();
};

Scenes.snake.prototype = Object.create(Scene.prototype);

Scenes.snake.prototype.title = 'Snake';

Scenes.snake.prototype.layout = '';

Scenes.snake.prototype.init = function(){
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

Scenes.snake.prototype.genAttrs = function(){
  return {
    x: Math.floor(this.opts.cols/2),
    y: Math.floor(this.opts.rows/2),
    time: 0,
    index: 0,
    value: 0,
    duration: this.opts.duration,
    failed: 0,
  };
};

Scenes.snake.prototype.defaults = [{
  key: 'max_x',
  value: 640,
  min: 32,
  max: 1024
}, {
  key: 'max_y',
  value: 640,
  min: 32,
  max: 1024
}, {
  key: 'rows',
  value: 32,
  min: 3,
  max: 24
}, {
  key: 'cols',
  value: 32,
  min: 8,
  max: 32
}, {
  key: 'duration',
  value: 60,
  min: 1,
  max: 120
}];

Scenes.snake.prototype.update = function(delta){

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

  if(this.plan.length === 0){
    this.tries ++;
    if(this.tries > 20  && ! this.env.gameover){
      this.env.gameover = true;
      setTimeout(this.env.restart, 1000)
    }
  }
  
  // if(this.attrs.failed > 50 && ! this.env.gameover){
  //   this.env.gameover = true;
  //   setTimeout(this.env.restart, 1000)
  // }
  
}


Scenes.snake.prototype.makeSnake = function(){
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

    if(x < 0 || x >= this.opts.cols) continue;
    if(y < 0 || y >= this.opts.rows) continue;

    ix = (this.opts.rows*y)+x;
    this.snake.push(ix);
    ok = true;
  }
};


Scenes.snake.prototype.makeWalls = function(){
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


Scenes.snake.prototype.makeFood = function(){
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


Scenes.snake.prototype.route = function () {

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

  function distanceFunction(a, b){
    var ax = a % opts.cols;
    var ay = Math.floor(a/opts.rows);
    var bx = b % opts.cols;
    var by = Math.floor(b/opts.rows);

    var d1 = Math.abs(ax - bx);
    var d2 = Math.abs(by - by);
    return d1 + d2;
  };
 
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


Scenes.snake.prototype.paint = function(fx, gx, sx){
  var ww = this.opts.max_x / this.opts.rows;
  var hh = this.opts.max_y / this.opts.cols;

  gx.ctx.save();
  
  var x, y;
  for(let i = 0, ii=this.opts.rows * this.opts.cols; i < ii; i++){
    x = i % this.opts.cols;
    y = Math.floor(i/this.opts.rows);

    gx.ctx.fillStyle = '#000';

    if(this.memory[i] === 'w'){
      gx.ctx.fillStyle = '#009';
    }

    if(this.food === i){
      gx.ctx.fillStyle = '#0f0';
    }

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

  // snake
  var step = 1 / this.snake.length;
  for(let i = 0, ii=this.snake.length; i < ii; i++){
    x = this.snake[i] % this.opts.cols;
    y = Math.floor(this.snake[i]/this.opts.rows);

    gx.ctx.fillStyle = 'rgba(255, 0, 0,' + (((ii-i) * step)) + ')';
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
  
  gx.ctx.restore();
  
}
