/*global Scenes:true, Actors:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Scenes.rabbits = function(env, opts){
  this.env = env;
  this.opts = this.genOpts(opts);
  this.attrs = this.genAttrs();
  this.init();
};

Scenes.rabbits.prototype = Object.create(Scene.prototype);

Scenes.rabbits.prototype.title = 'Rabbits';

Scenes.rabbits.prototype.init = function(){

  this.foxhist = [];
  this.rabbithist = [];

  this.numFox = 0;
  this.numRabbit = 0;
  var x, y;
  this.grid = grid = [];

  for (x = 0; x < this.opts.grid_x; x++) {
    grid[x] = [];
    for (y = 0; y < this.opts.grid_y; y++) {
      grid[x][y] = this.makeCell();
    }
  }
};


Scenes.rabbits.prototype.makeCell = function(){
  var b = Math.random();
  var a = 1;
  if (b < this.opts.fox_num) {
    a = 2;
    this.numFox++
  } else {
    if (b < this.opts.fox_num + this.opts.rabbit_num) {
      a = 3;
      this.numRabbit++
    }
  }
  return a;
};


Scenes.rabbits.prototype.getCast = function(){
  return {
  }
};

Scenes.rabbits.prototype.defaults = [{
  key: 'max_x',
  value: 640,
  min: 120,
  max: 640
}, {
  key: 'max_y',
  value: 320,
  min: 120,
  max: 640
}, {
  key: 'grid_x',
  value: 64,
  min: 32,
  max: 256
}, {
  key: 'chart_fat',
  value: 8,
  min: 1,
  max: 64
}, {
  key: 'grid_y',
  value: 24,
  min: 24,
  max: 256
}, {
  key: 'density',
  value: 0.5,
  min: 0.1,
  max: 1.0,
  step: 0.1
}, {
  key: 'chart_limit',
  value: 50,
  min: 50,
  max: 1000
}, {
  key: 'fox_num',
  value: 0.03,
  min: 0.01,
  max: 0.09
}, {
  key: 'fox_death',
  value: 0.04,
  min: 0.01,
  max: 0.09
}, {
  key: 'fox_birth',
  value: 0.8,
  min: 0.1,
  max: 0.9
}, {
  key: 'rabbit_num',
  value: 0.3,
  min: 0.1,
  max: 0.9
}, {
  key: 'rabbit_birth',
  value: 0.07,
  min: 0.01,
  max: 0.09
}];

Scenes.rabbits.prototype.genAttrs = function(){
  return {
    val_max: (this.opts.max_x * this.opts.max_y) / this.opts.max_y
  };
};

Scenes.rabbits.prototype.update = function(delta){

  // tick here

  for (var l = 0; l < this.opts.grid_x; l++) {
    for (var h = 0; h < this.opts.grid_y; h++) {
      var n = this.grid[l][h];
      // grass
      if (n === 1) {
        continue
      }
      // no action
      if (Math.random() > 0.5) {
        continue
      }

      var e = Math.ceil(Math.random() * 3) - 2;
      var c;
      if (e != 0) {
        c = Math.ceil(Math.random() * 3) - 2
      } else {
        c = (Math.random() > 0.5 ? 1 : -1)
      }

      var f = l + e, d = h + c;

      if (f < 0) {
        f = this.opts.grid_x - 1
      } else {
        if (f >= this.opts.grid_x) {
          f = 0
        }
      }

      if (d < 0) {
        d = this.opts.grid_y - 1
      } else {
        if (d >= this.opts.grid_y) {
          d = 0
        }
      }

      var m = this.grid[f][d];
      var b = n + m;
      if (n === 2) {
        if (m === 3) {
          if (Math.random() > this.opts.fox_birth) {
            this.grid[f][d] = 1
          } else {
            this.grid[f][d] = 2
          }
        } else {
          if (Math.random() < this.opts.fox_death) {
            this.grid[l][h] = 1
          } else {
            if (m === 1) {
              this.grid[l][h] = 1;
              this.grid[f][d] = 2
            }
          }
        }
      } else {
        if (n === 3) {
          if (m === 2) {
            this.grid[l][h] = 1
          } else {
            if (m === 1) {
              if (Math.random() < this.opts.rabbit_birth) {
                this.grid[f][d] = 3
              } else {
                this.grid[l][h] = 1
              }
              this.grid[f][d] = 3
            }
          }
        }
      }
      delta = (this.grid[l][h] + this.grid[f][d]) - b;
      if (delta === -1) {
        if (b < 5) {
          this.numFox--;
        } else {
          this.numFox++;
          this.numRabbit--;
        }
      } else {
        if (delta === -2) {
          this.numRabbit--;
        } else {
          if (delta === 2) {
            this.numRabbit++;
          }
        }
      }
    }
  }


  //
  this.foxhist.push(this.numFox);
  while(this.foxhist.length > this.opts.chart_limit){
    this.foxhist.shift();
  }

  this.rabbithist.push(this.numRabbit);
  while(this.rabbithist.length > this.opts.chart_limit){
    this.rabbithist.shift();
  }

}

Scenes.rabbits.prototype.paintGrid = function(view){
  // snapshot bottom half for sliding chart
  //var slideframe = ctx.getImageData(0,this.ch/2,this.cw,this.ch/2);
  var view = view;

  var xw = this.opts.max_x / this.opts.grid_x;
  var xh = this.opts.max_y / this.opts.grid_y;
  var f = Math.min(xw, xh);

  var offset_x = (this.opts.max_x * 0.5) - (f * this.opts.grid_x / 2);
  var offset_y = (this.opts.max_y * 0.5) - (f * this.opts.grid_y / 2);

  view.ctx.save();
  view.ctx.translate (offset_x, offset_y);

  view.ctx.strokeStyle='#000';
  var grid = this.grid;
  var x, xx, y, yy;
  for(x = 0, xx = grid.length; x<xx; x ++){
    for(y = 0, yy = grid[x].length; y<yy; y ++){
      view.ctx.beginPath();
      view.ctx.lineWidth = 1;
      // grass
      view.ctx.fillStyle = '#000';
      // fox
      if(grid[x][y] === 2){
        view.ctx.fillStyle = '#f05';
      }
      // rabbit
      if(grid[x][y] === 3){
        view.ctx.fillStyle = '#0aa';
      }
      view.ctx.rect(x * f, y * f, f, f);
      view.ctx.fill();
      view.ctx.stroke();
      view.ctx.closePath();
    }
  }

  view.ctx.restore();

}

Scenes.rabbits.prototype.paintChart = function(view){

  // chart
  var segments = {
    numFox: '#f05',
    numRabbit: '#0ff'
  };

  view.ctx.save();

  view.ctx.lineWidth = this.opts.chart_fat;
  view.ctx.strokeStyle = '#f05';
  var xf = view.w / this.opts.chart_limit;
  var yf = view.h / this.attrs.val_max;

  view.ctx.beginPath();
  view.ctx.moveTo(0, view.h - (yf * this.foxhist[0]));
  this.foxhist.forEach(function(val, ix){
    val = yf * val;
    view.ctx.lineTo(1+ix * xf, view.h - val);
  }, this);
  view.ctx.stroke();
  view.ctx.closePath();

  view.ctx.lineWidth = this.opts.chart_fat;
  view.ctx.strokeStyle = '#0ff';

  view.ctx.beginPath();
  view.ctx.moveTo(0, view.h - ((view.h/this.attrs.val_max) * this.rabbithist[0]));
  this.rabbithist.forEach(function(val, ix){
    val = (view.h/this.attrs.val_max) * val;
    view.ctx.lineTo(1+ix * xf, view.h - val);
  }, this);
  view.ctx.stroke();
  view.ctx.closePath();

  view.ctx.restore();

}


Scenes.rabbits.prototype.paint = function(fx, gx, sx, ex){
  this.paintGrid(gx)
  this.paintChart(ex)
}

Scenes.rabbits.prototype.getHelp = function(){
  return '';
};

Scenes.rabbits.prototype.captions = [{
  style: 'xx',
  text: 'Foxes and Rabbits'
}, {
  text: 'Foxes eat Rabbits'
}];

