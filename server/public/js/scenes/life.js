/*global Scenes:true, Actors:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Scenes.life = function(env, opts){
  this.env = env;
  this.opts = this.genOpts(opts);
  this.attrs = this.genAttrs();
  this.init();
};

Scenes.life.prototype = Object.create(Scene.prototype);

Scenes.life.prototype.title = 'Life';

Scenes.life.prototype.init = function(){

  this.grid = [];
  var i, x, y;
  this.grid = [];
  for(x = 0; x < this.opts.grid_x; x ++){
    this.grid[x] = [];
    for(y = 0; y < this.opts.grid_y; y ++){
      this.grid[x][y] = (Math.random() < this.opts.density);
    }
  }
}


Scenes.life.prototype.getCast = function(){  return {
  }
};

Scenes.life.prototype.defaults = [{
  key: 'max_x',
  info: 'Max X',
  value: 480,
  min: 100,
  max: 1000
}, {
  key: 'max_y',
  info: 'Max Y',
  value: 480,
  min: 100,
  max: 1000
}, {
  key: 'grid_x',
  value: 48,
  min: 4,
  max: 320
}, {
  key: 'grid_y',
  value: 32,
  min: 4,
  max: 320
}, {
  key: 'density',
  value: 0.5,
  min: 0.1,
  max: 1.0,
  step: 0.1
}, {
  key: 'delay',
  value: 2,
  min: 0,
  max: 60
}];

Scenes.life.prototype.genAttrs = function(){
  return {
    tick: 0
  };
};

Scenes.life.prototype.update = function(delta){

  if(this.attrs.tick < this.opts.delay){
    this.attrs.tick ++;
    return;
  }

  this.attrs.tick = 0;

  var next = [];
  var grid = this.grid;

  var x, xx, y, yy, xxx, yyy;
  var i, ii, c, list; // count of neighbours
  for(x = 0, xx = grid.length; x<xx; x ++){
    next[x] = [];
    for(y = 0, yy = grid[x].length; y<yy; y ++){

      next[x][y] = grid[x][y];

      list = [
        [x-1, y-1], [x,y-1], [x+1,y-1],
        [x-1, y], [x+1,y],
        [x-1, y+1], [x,y+1], [x+1,y+1]
      ];
      c = 0;

      //console.log(x,y, grid[x][y]);
      for(i=0, ii = list.length; i<ii; i++){         
        xxx = list[i][0];
        if(xxx < 0){
          xxx = xx - 1;
        }
        if(xxx >= xx){
          xxx = 0;
        }
        if(typeof grid[xxx] === 'undefined'){
          continue;
        }
        yyy = list[i][1];
        if(yyy < 0){
          yyy = yy - 1;
        }
        if(yyy >= yy){
          yyy = 0;
        }
        if(grid[xxx][yyy]){
          c ++;
        }
      }

      if(grid[x][y] && c === 2){
        next[x][y] = true;
      } else if(c === 3){
        next[x][y] = true;
      } else {
        next[x][y] = false;
      }
    }
  }
  //console.log(next);
  this.grid = next;

}

Scenes.life.prototype.paint = function(fx, gx){

  var xf = this.opts.max_x / this.opts.grid_x;
  var yf = this.opts.max_y / this.opts.grid_y;
  var f = Math.min(xf, yf);

  var offset_x = (this.opts.max_x * 0.5) - (f * this.opts.grid_x / 2);
  var offset_y = (this.opts.max_y * 0.5) - (f * this.opts.grid_y / 2);

  gx.ctx.save();
  gx.ctx.translate (offset_x, offset_y);

  var x, xx, y, yy;
  var grid = this.grid;
  for(x = 0, xx = grid.length; x<xx; x ++){
    for(y = 0, yy = grid[x].length; y<yy; y ++){
      if(!grid[x][y]){
        continue;
      }
      gx.ctx.beginPath();
      gx.ctx.fillStyle = '#0ff';
      gx.ctx.lineStyle = '#000';
      gx.ctx.lineWidth = f/8;
      gx.ctx.rect(x * f, y * f, f, f);
      gx.ctx.fill();
      gx.ctx.stroke();
      gx.ctx.closePath();
    }
  }

  gx.ctx.restore();

}

Scenes.life.prototype.captions = [{
  text: 'Conway\'s Game of Life'
}];

