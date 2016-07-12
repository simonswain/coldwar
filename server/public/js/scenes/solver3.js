/*global Scenes:true, Actors:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Scenes.solver3 = function(env, opts){
  this.env = env;
  this.opts = this.genOpts(opts);
  this.attrs = this.genAttrs();
  this.init();
};

Scenes.solver3.prototype = Object.create(Scene.prototype);

Scenes.solver3.prototype.title = 'Solver3';

Scenes.solver3.prototype.genAttrs = function(){
  return {
    rows: this.opts.rows,
    cols: this.opts.cols,
    phase: 'gen'
  };
};

Scenes.solver3.prototype.init = function(){

  //this.makeGrid();
  //this.generatePerfectMaze();

  this.cells = [{
	  "i": 0,
	  "x": 0,
	  "y": 0,
	  "exits": [null, 1, 4, null]
  }, {
	  "i": 1,
	  "x": 1,
	  "y": 0,
	  "exits": [null, 2, null, 0]
  }, {
	  "i": 2,
	  "x": 2,
	  "y": 0,
	  "exits": [null, 3, null, 1]
  }, {
	  "i": 3,
	  "x": 3,
	  "y": 0,
	  "exits": [null, null, 7, 2]
  }, {
	  "i": 4,
	  "x": 0,
	  "y": 1,
	  "exits": [0, 5, null, null]
  }, {
	  "i": 5,
	  "x": 1,
	  "y": 1,
	  "exits": [null, 6, null, 4]
  }, {
	  "i": 6,
	  "x": 2,
	  "y": 1,
	  "exits": [null, null, 10, 5]
  }, {
	  "i": 7,
	  "x": 3,
	  "y": 1,
	  "exits": [3, null, 11, null]
  }, {
	  "i": 8,
	  "x": 0,
	  "y": 2,
	  "exits": [null, 9, 12, null]
  }, {
	  "i": 9,
	  "x": 1,
	  "y": 2,
	  "exits": [null, null, 13, 8]
  }, {
	  "i": 10,
	  "x": 2,
	  "y": 2,
	  "exits": [6, null, null, null]
  }, {
	  "i": 11,
	  "x": 3,
	  "y": 2,
	  "exits": [7, null, 15, null]
  }, {
	  "i": 12,
	  "x": 0,
	  "y": 3,
	  "exits": [8, null, null, null]
  }, {
	  "i": 13,
	  "x": 1,
	  "y": 3,
	  "exits": [9, 14, null, null]
  }, {
	  "i": 14,
	  "x": 2,
	  "y": 3,
	  "exits": [null, 15, null, 13]
  }, {
	  "i": 15,
	  "x": 3,
	  "y": 3,
	  "exits": [11, null, null, 14]
  }];
   
}

Scenes.solver3.prototype.defaults = [{
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
  value: 4,
  min: 2,
  max: 24
}, {
  key: 'cols',
  value: 4,
  min: 2,
  max: 32
}];

Scenes.solver3.prototype.makeGrid = function () {
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

Scenes.solver3.prototype.generatePerfectMaze = function () {
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

  for(var i = 0, ii = cells.length; i < ii; i++){
    delete cells[i].gridmates
    for(var j = 0; j < 4; j++){
      if(cells[i].exits[j]){
        cells[i].exits[j] = cells[i].exits[j].i
      }
    }

  }

  //console.log(JSON.stringify(cells));
  
}

Scenes.solver3.prototype.update = function(delta){
}

Scenes.solver3.prototype.paint = function(fx, gx, sx){

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

    if(i === 0){
      gx.ctx.fillStyle = '#f00';
      if(Date.now() % 300 < 100){ 
        gx.ctx.fillStyle = '#ff0';
      }
      gx.ctx.beginPath();
      gx.ctx.fillRect((x * ww), (y * hh), ww, hh);
    }

    if(i === 1){
      gx.ctx.fillStyle = '#f00';
      gx.ctx.beginPath();
      gx.ctx.fillRect((x * ww), (y * hh), ww, hh);

      gx.ctx.save();
      gx.ctx.translate(x * ww, (y + 0.5) * hh);
      gx.ctx.strokeStyle='rgba(0, 0, 0, 0.5)';
      gx.ctx.lineWidth=4;
      gx.ctx.beginPath(); 
      gx.ctx.moveTo(0, 0);
      gx.ctx.lineTo(0.2 * ww, 0);
      gx.ctx.stroke();

      gx.ctx.beginPath(); 
      gx.ctx.moveTo(0, 0);
      gx.ctx.lineTo(0.1 * ww, -0.1 * hh);
      gx.ctx.stroke();

      gx.ctx.beginPath(); 
      gx.ctx.moveTo(0, 0);
      gx.ctx.lineTo(0.1 * ww, 0.1 * hh);
      gx.ctx.stroke();
      gx.ctx.restore();
     

      gx.ctx.font = '18pt robotron';
      gx.ctx.textAlign = 'center';
      gx.ctx.textBaseline = 'middle';
      gx.ctx.fillStyle = '#fff';
      gx.ctx.fillText('1', (x * ww) + ww/2, (y * hh) + hh*0.5);
    }

    if(i === 4){
      gx.ctx.fillStyle = '#f00';
      gx.ctx.beginPath();
      gx.ctx.fillRect((x * ww), (y * hh), ww, hh);

      gx.ctx.save();
      gx.ctx.translate((x + 0.5) * ww, y * hh);
      gx.ctx.strokeStyle='rgba(0, 0, 0, 0.5)';
      gx.ctx.lineWidth=4;
      gx.ctx.beginPath(); 
      gx.ctx.moveTo(0, 0);
      gx.ctx.lineTo(0, 0.2 * hh);
      gx.ctx.stroke();

      gx.ctx.beginPath(); 
      gx.ctx.moveTo(0, 0);
      gx.ctx.lineTo(-0.1 * ww, 0.1 * hh);
      gx.ctx.stroke();

      gx.ctx.beginPath(); 
      gx.ctx.moveTo(0, 0);
      gx.ctx.lineTo(0.1 * ww, 0.1 * hh);
      gx.ctx.stroke();
      gx.ctx.restore();

      gx.ctx.font = '18pt robotron';
      gx.ctx.textAlign = 'center';
      gx.ctx.textBaseline = 'middle';
      gx.ctx.fillStyle = '#fff';
      gx.ctx.fillText('1', (x * ww) + ww/2, (y * hh) + hh*0.5);
    }
    
    if(i === 15){
      gx.ctx.fillStyle = '#ff0';
      if(Date.now() % 250 < 150){ 
        gx.ctx.fillStyle = '#f00';
      }
      gx.ctx.beginPath();
      gx.ctx.fillRect((x * ww), (y * hh), ww, hh);
    }

    gx.ctx.lineWidth = 4;
    gx.ctx.strokeStyle = 'rgba(0,255,0,1)';

    if(cell.exits[0] === null){
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
    if(cell.exits[1] === null){
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

    if(cell.exits[2] === null){
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

    if(cell.exits[3] === null){
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
