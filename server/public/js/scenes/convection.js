/*global Scenes:true, Actors:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Scenes.convection = function(env, opts){
  this.env = env;
  this.opts = this.genOpts(opts);
  this.attrs = this.genAttrs();
  this.init();
};

Scenes.convection.prototype = Object.create(Scene.prototype);

Scenes.convection.prototype.title = 'Convection';
Scenes.convection.prototype.nozoom = true;

Scenes.convection.prototype.init = function(){

  this.grid = [];

  var length = this.opts.grid_x * this.opts.grid_y;
  for(var i = 0; i<length; i++){
    this.grid[i] = 0.5; //Math.random();
  }

}


Scenes.convection.prototype.getCast = function(){  return {
  }
};

Scenes.convection.prototype.defaults = [{
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
  value: 16,
  min: 4,
  max: 320
}, {
  key: 'grid_y',
  value: 12,
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
}, {
  key: 'threshold',
  value: 0.5,
  min: 0,
  max: 1,
  step: 0.01
}, {
  key: 'decay',
  value: 0.99,
  min: 0,
  max: 1,
  step: 0.001
}, {
  key: 'boundary',
  value: 0.1,
  min: 0,
  max: 1,
  step: 0.01
}, {
  key: 'probability',
  value: 0.9,
  min: 0,
  max: 1,
  step: 0.01
}, {
  key: 'top',
  value: 0.1,
  min: 0,
  max: 0.5,
  step: 0.01
}, {
  key: 'side',
  value: 0.02,
  min: 0,
  max: 0.1,
  step: 0.01
}, {
  key: 'down',
  value: 0.005,
  min: 0,
  max: 0.5,
  step: 0.01
}];

Scenes.convection.prototype.genAttrs = function(){
  return {
    tick: 0
  };
};

Scenes.convection.prototype.update = function(delta){

  if(this.attrs.tick < this.opts.delay){
    this.attrs.tick ++;
    return;
  }

  this.attrs.tick = 0;

  // compare neighbours, colder cell accepts heat
  // 10% of heat goes up
  // 4% left and right
  // 2% down

  var grid = [];
  var cell, next, lost;
  var top, left, right, down;
  var i, ii;
  var x, y;

  for(i = 0, ii = this.grid.length; i<ii; i++){
    grid[i] = this.grid[i];
  }

  for(y = 0; y<this.opts.grid_y; y++){
    for(x = 0; x<this.opts.grid_x; x++){
      i = (this.opts.grid_x * y) + x;

      cell = this.grid[i];

      // thermal decay with threshold to create contrast
      if(grid[i] < this.opts.threshold){
        grid[i] *= this.opts.decay;
      }

      // top
      if (y > 0){
        j = (this.opts.grid_x * (y-1)) + x;
        top = this.grid[j];
        if (top < cell){
          lost = cell * this.opts.top;
          grid[i] -= lost;
          grid[j] += lost;
        }
      }

      // left
      if (x > 1){
        j = (this.opts.grid_x * y) + x - 1;
        left = this.grid[j];
        if (left < cell){
          lost = cell * this.opts.side;
          if(y == 0){
            // top cell distributes more out sides
            lost += cell * (this.opts.top/2);
          }
          grid[i] -= lost;
          grid[j] += lost;
        }
      }

      // right
      if (x < this.opts.grid_x){
        j = (this.opts.grid_x * y) + x + 1;
        right = this.grid[j];
        if (right < cell){
          lost = cell * this.opts.side;
          if(y == 0){
            // top cell distributes more out sides
            lost += cell * (this.opts.top/2);
          }
          grid[i] -= lost;
          grid[j] += lost;
        }
      }

      // left/right

      // down
      if (y < this.opts.grid_y-1){
        j = (this.opts.grid_x * (y+1)) + x + 1;
        down = this.grid[j];
        if (down < cell){
          lost = cell * this.opts.down;
          if(x === 0){
            // side distributes more out bottom
            lost += cell * (this.opts.side);
          }
          if(x === this.opts.grid_x - 1){
            // side distributes more out bottom
            lost += cell * (this.opts.side);
          }
          grid[i] -= lost;
          grid[j] += lost;
        }
      }

      //
    }

  }

  // random noise
  if(Math.random() < this.opts.probability){
    j = Math.floor(Math.random() * this.grid.length);
    grid[j] *= 1.1;
    if(grid[j]< this.opts.boundary){
      grid[j] = 0.5 + (Math.random() * 0.5);
    }
  }


  this.grid = grid;

}

Scenes.convection.prototype.onClick = function(x, y, e){
  // right click to add boom
  x = Math.floor((x / this.opts.max_x) * this.opts.grid_x);
  y = Math.floor((y / this.opts.max_y) * this.opts.grid_y);
  var i = (this.opts.grid_x * y) + x;
  this.grid[i] += (Math.random() * 5);

}


Scenes.convection.prototype.paint = function(fx, gx){

  var xf = this.opts.max_x / this.opts.grid_x;
  var yf = this.opts.max_y / this.opts.grid_y;
  var f = Math.min(xf, yf);

  var offset_x = (this.opts.max_x * 0.5) - (f * this.opts.grid_x / 2);
  var offset_y = (this.opts.max_y * 0.5) - (f * this.opts.grid_y / 2);

  gx.ctx.save();
  gx.ctx.translate (offset_x, offset_y);

  var i, x, xx, y, yy;
  var grid = this.grid;
  var cell;

  for(y = 0; y<this.opts.grid_y; y++){
    for(x = 0; x<this.opts.grid_x; x++){
      i = (this.opts.grid_x * y) + x;

      cell = grid[i];
      gx.ctx.beginPath();
      gx.ctx.fillStyle = 'rgba(0,255,255,' + cell + ')';
      gx.ctx.strokeStyle = 'rgba(0,255,255,' + cell + ')';
      gx.ctx.lineWidth = f/8;
      gx.ctx.rect(x*f, y*f, f, f);
      gx.ctx.fill();

      if(cell > 1){
        gx.ctx.beginPath();
        gx.ctx.rect((x*f) + (f/4), (y*f) + (f/4), f/2, f/2);
        gx.ctx.fillStyle = 'rgba(255,0,90,' + (cell-1) + ')';
        gx.ctx.fill();
      }

      if(this.env.show_meta){
        gx.ctx.font = '10pt ubuntu mono, monospace';
        gx.ctx.textAlign='center';
        gx.ctx.textBaseline='middle';
        gx.ctx.fillStyle = '#666';
        gx.ctx.strokeStyle = '#666';
        gx.ctx.strokeStyle = '#666';
        //gx.ctx.fillText(x + ' - ' + y, (x*f)+(f/2), (y*f)-(f/4));
        //gx.ctx.fillText(i, (x*f)+(f/2), (y*f)+(f/2));
        gx.ctx.fillText(cell.toFixed(2), (x*f)+(f/2), (y*f)+(f/2));
      }


    }
  }

  gx.ctx.restore();

}
