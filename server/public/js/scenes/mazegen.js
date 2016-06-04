/*global Scenes:true, Actors:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Scenes.mazegen = function(env, opts){
  this.env = env;
  this.opts = this.genOpts(opts);
  this.attrs = this.genAttrs();
  this.init();
};

Scenes.mazegen.prototype = Object.create(Scene.prototype);

Scenes.mazegen.prototype.title = 'Mazegen';

Scenes.mazegen.prototype.genAttrs = function(){
  return {
    ttl: 128,
    rows: 2,
    cols: 2,
    
  };
};

Scenes.mazegen.prototype.init = function(){
  this.makeGrid();
  this._steps = {
    ttl: this.attrs.ttl,
    cell: pickOne(this.cells),
    other: false,
    stack: [],
    total: this.cells.length,
    visited: 1,
    hot: false,
  };
}

Scenes.mazegen.prototype.defaults = [{
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
  value: 2,
  min: 3,
  max: 24
}, {
  key: 'cols',
  value: 2,
  min: 8,
  max: 32
}, {
  key: 'step_delay',
  value: 1,
  min: 1,
  max: 120
}, {
  key: 'step_hold',
  value: 85,
  min: 1,
  max: 1000
}, {
  key: 'step_skip',
  value: 1,
  min: 1,
  max: 20
}, {
  key: 'frame_hold',
  value: 140,
  min: 1,
  max: 2400
}, {
  key: 'font-size',
  value: 24,
  min: 8,
  max: 64
}];

Scenes.mazegen.prototype.makeGrid = function () {
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

Scenes.mazegen.prototype.update = function(delta){

  if(this._steps.ttl >= 0){
    this._steps.ttl -= delta
    return
  }

  this._steps.ttl += this.attrs.ttl

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
    if(this._steps.stack.length === 0 && !this.env.gameover){
      this._steps.cell = false;
      if(this.attrs.rows < 16){
        this.attrs.rows ++;
        this.attrs.cols ++;
        this.attrs.ttl /= 2;
      }
      this.init();
    }
  }
  

}

Scenes.mazegen.prototype.paint = function(fx, gx, sx){

  var ww = this.opts.max_x / this.attrs.rows;
  var hh = this.opts.max_y / this.attrs.cols;

  gx.ctx.save();
  
  gx.ctx.lineWidth = 6;
  gx.ctx.strokeStyle = 'rgba(255,0,0,1)';
  //gx.ctx.strokeStyle = 'rgba(255,0,0,' + (0.5-(Math.sin(Math.PI * (Date.now()%2000)/1000)/2)) + ')';

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

      if(this._steps.hot && this._steps.cell.i === i){
        gx.ctx.fillStyle = '#ff0';
        gx.ctx.beginPath();
        gx.ctx.fillRect((x * ww), (y * hh), ww, hh);
      }      
    }

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
