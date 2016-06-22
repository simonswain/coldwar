/* global Actors, Actor */

Actors.TitleMaze = function (env, refs, attrs) {

  this.env = env
  this.refs = refs
  this.opts = this.genOpts()
  this.attrs = this.genAttrs(attrs)
  this.init()
}

Actors.TitleMaze.prototype = Object.create(Actor.prototype)

Actors.TitleMaze.prototype.title = 'TitleMaze'

Actors.TitleMaze.prototype.genAttrs = function (attrs) {
  return {
    max: Math.min(this.opts.max_x, this.opts.max_y),
    escape: false,
    rows: attrs.rows || this.opts.rows,
    cols: attrs.cols || this.opts.cols,
  }
}

Actors.TitleMaze.prototype.init = function () {
  this.makeGrid();
};

Actors.TitleMaze.prototype.defaults = [{
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
  value: 8,
  min: 3,
  max: 24
}, {
  key: 'cols',
  value: 12,
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
  value: 10,
  min: 0,
  max: 16
}]

Actors.TitleMaze.prototype.makeGrid = function () {
  // init blank grid
  this.cells = new Array(this.attrs.rows * this.attrs.cols);
  x = 0;
  y = 0;
  for (i = 0, ii = this.cells.length; i<ii; i++) {
    this.cells[i] = new Actors.TitleCell(
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
  //this.connectAllCells();
}

Actors.TitleMaze.prototype.makeGridmates = function () {
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

Actors.TitleMaze.prototype.connectAllCells = function () {
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

Actors.TitleMaze.prototype.randomJoins = function (max) {

  if(!max){
    max = 1
  }

  for(var i=0; i<max; i++){
    this.randomJoin();
  }

}

Actors.TitleMaze.prototype.randomJoin = function () {

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


Actors.TitleMaze.prototype.randomSplit = function (max) {

  if(!max){
    max = 1
  }

  for(var i=0; i<max; i++){
    this.randomSplit();
  }

}

Actors.TitleMaze.prototype.randomSplit = function () {

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

Actors.TitleMaze.prototype.update = function (delta) {
  this.randomJoins(1);
  this.randomSplit(1);

  var i, ii;
  for (i = 0, ii = this.cells.length; i<ii; i++) {
    this.cells[i].update(delta);
  }
}

Actors.TitleMaze.prototype.paint = function (view) {

  var x, y, i, ii;
  var cell;

  view.ctx.save()

  // view.ctx.strokeStyle = '#f00'
  // view.ctx.beginPath()
  // view.ctx.rect(0, 0, this.opts.max_x, this.opts.max_y)
  // view.ctx.stroke()

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

  view.ctx.restore()

}
