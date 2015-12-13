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

  var xf = this.refs.scene.opts.max_x / this.opts.cols
  var yf = this.refs.scene.opts.max_y / this.opts.rows

  return {
    max: Math.max(this.opts.max_x, this.opts.max_y),
    f: Math.min(xf, yf),
    s: Math.min(this.opts.rows, this.opts.cols),
  }
}

Actors.Maze.prototype.init = function () {

  var x, y, i, ii

  this.makeGridBlank();
  this.makeGridmates();

  this.randomJoins(20);

  this.randomBreeders(4);
  this.randomReactors(1);
  this.randomHumans(1);
  
};

Actors.Maze.prototype.makeGridBlank = function () {

  // init blank grid
  this.cells = new Array(this.opts.rows * this.opts.cols);
  x = 0;
  y = 0;
  for (i = 0, ii = this.cells.length; i<ii; i++) {
    this.cells[i] = new Actors.Cell(
      this.env, {
        scene: this,
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

Actors.Maze.prototype.randomBreeders = function (max) {

  if(!max){
    max = 1
  }
  
  for(var i=0; i<max; i++){
    this.randomBreeder();
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

Actors.Maze.prototype.randomHumans = function (max) {

  if(!max){
    max = 1
  }
  
  for(var i=0; i<max; i++){
    this.randomHuman();
  }

}

Actors.Maze.prototype.randomBreeder = function (max) {
  var ix = random.from0upto(this.cells.length)
  this.cells[ix].addBreeder();
}


Actors.Maze.prototype.randomReactor = function (max) {
  var ix = random.from0upto(this.cells.length)
  this.cells[ix].addReactor();
}

Actors.Maze.prototype.randomHuman = function (max) {
  var ix = random.from0upto(this.cells.length)
  this.cells[ix].addHuman();
}

Actors.Maze.prototype.joinCells = function (cell, other) {

  cell.exits
  
  console.log('join', cell, other);
}

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
  
  // view.ctx.lineWidth = 4;
  // view.ctx.strokeStyle = '#f00'
  // view.ctx.beginPath()
  // view.ctx.rect(0, 0, this.opts.max_x, this.opts.max_y)
  // view.ctx.stroke()

  view.ctx.save()
  view.ctx.translate(this.attrs.max * 0.05, this.attrs.max * 0.05);
  view.ctx.scale(0.9, 0.9);
  
  for (i = 0, ii = this.cells.length; i<ii; i++) {
    x = i % this.opts.cols;
    y = Math.floor(i/this.opts.rows); 
    cell = this.cells[i]
    //console.log(x, y);
    view.ctx.save()
    view.ctx.translate(cell.attrs.x * this.attrs.f, cell.attrs.y * this.attrs.f);
    view.ctx.scale(this.attrs.s/this.opts.cols, this.attrs.s/this.opts.rows);

    cell.paint(view);
    view.ctx.restore()
  }

  view.ctx.restore()
  
}
