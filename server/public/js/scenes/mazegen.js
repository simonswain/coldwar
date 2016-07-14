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
    ttl: 0,
    rows: 4,
    cols: 4
    
  };
};

Scenes.mazegen.prototype.init = function(){
  this.makeGrid();
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

  if (this._steps.cell === -1) {
    this._steps.cell = pickOne(this.cells);
    return;
  }

  var n, i, j, k, c;
  var cell, pick, other, dir
  var flip = [2,3,0,1];
  var plucked = false;

  if(this._steps.other){
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
      this._steps.done = true;
      this._steps.cell = false;
      return;
    }
  }


}

Scenes.mazegen.prototype.paint = function(fx, gx, sx){

  var ww = this.opts.max_x / this.attrs.cols
  var hh = this.opts.max_y / this.attrs.rows

  gx.ctx.save();
  gx.ctx.translate(this.opts.max_x * 0.05, this.opts.max_y * 0.05);
  gx.ctx.scale(0.9, 0.9);
  
  gx.ctx.lineCap='round';
  gx.ctx.lineWidth = 4;
  gx.ctx.strokeStyle = 'rgba(255,0,0,1)';

  var x, y, i, ii;
  var cell;
  
  for(i = 0, ii=this.attrs.rows * this.attrs.cols; i < ii; i++){
    x = i % this.attrs.rows
    y = Math.floor(i / this.attrs.cols);

    cell = this.cells[i];

    gx.ctx.save();

    if(this._steps){
      if(this._steps.stack.indexOf(this.cells[i]) > -1){
        gx.ctx.fillStyle = '#033';
        gx.ctx.strokeStyle = '#033';
        gx.ctx.beginPath();
        gx.ctx.rect((x * ww), (y * hh), ww, hh); 
        gx.ctx.fill();
        gx.ctx.stroke();
      }

      if(this._steps.other && this._steps.other.i === i){
        gx.ctx.fillStyle = '#ff0';
        gx.ctx.beginPath();
        gx.ctx.fillRect((x * ww), (y * hh), ww, hh);
      }      

      if(this._steps.cell && this._steps.cell.i === i){
        gx.ctx.fillStyle = '#0ff';
        gx.ctx.beginPath();
        gx.ctx.fillRect((x * ww), (y * hh), ww, hh);
      }      

    gx.ctx.restore();
      
    }
  }
  
  for(i = 0, ii=this.attrs.rows * this.attrs.cols; i < ii; i++){
    x = i % this.attrs.rows
    y = Math.floor(i / this.attrs.cols);

    cell = this.cells[i];

    gx.ctx.save();

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
