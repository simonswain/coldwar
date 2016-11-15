/* global Scenes, Scene, Actors */

Scenes.maze5 = function (env, opts) {
  this.env = env
  this.opts = this.genOpts(opts)
  this.attrs = this.genAttrs()
  this.init()
}

Scenes.maze5.prototype = Object.create(Scene.prototype)

Scenes.maze5.prototype.title = 'Maze 4'

Scenes.maze5.prototype.init = function () {
  this.maze = new Actors.Maze(
    this.env, {
      scene: this
    }, {
      exciting: true
    }, {
      rows: 4,
      cols: 5,
      breeders: 6
    });

  this.target_zoom = 1;
  this.target_x = 0;
  this.target_y = 0;
  this.x = 0;
  this.y = 64;
  this.zoom = 1;
}

Scenes.maze5.prototype.getCast = function () {
  return {
    Maze: Actors.Maze,
    Cell: Actors.Cell,
    Human: Actors.Human,
    Zap: Actors.Zap,
    Breeder: Actors.Breeder,
    Rat: Actors.Rat,
    Boom: Actors.Boom,
    Reactor: Actors.Reactor,
  }
}

Scenes.maze5.prototype.defaults = [{
  key: 'max_x',
  info: 'Max X',
  value: 640,
  min: 100,
  max: 1600
}, {
  key: 'max_y',
  info: 'Max Y',
  value: 640,
  min: 100,
  max: 1000
}]

Scenes.maze5.prototype.genAttrs = function () {
  return {
  }
}

Scenes.maze5.prototype.update = function (delta) {
  this.maze.update(delta);
  var speed = 10;

  var max = Math.max(this.maze.opts.max_x, this.maze.opts.max_y);
  var min = Math.min(this.maze.opts.max_x, this.maze.opts.max_y);
  var rc = Math.max(this.maze.attrs.rows, this.maze.attrs.cols);

  var w = (max/rc);
  this.w = w;
 
  
  // if(this.maze.human){
  //   var cell = this.maze.human.refs.cell;
  //   var gx = this.env.views.gx;
  //   var max = Math.max(this.maze.opts.max_x, this.maze.opts.max_y);
  //   var rc = Math.max(this.maze.attrs.rows, this.maze.attrs.cols);
  //   var w = this.maze.opts.max_x / this.maze.attrs.cols;
  //   var h = this.maze.opts.max_y / this.maze.attrs.rows;

  //   this.target_zoom = 2.5;
  //   w *= this.target_zoom;
  //   this.target_x = 0 - (cell.attrs.x * w) - (this.w/2) + (this.maze.attrs.cols/2 * this.w);
  //   this.target_y = 0 - (cell.attrs.y * w) - (this.w/2) + (this.maze.attrs.rows/2 * this.w);
  // }
  
  // if(this.maze.attrs.boom){
  //   this.target_zoom = 1;
  //   this.target_x = 0;
  //   this.target_y = 0;
  //   speed = 15;
  // }
 
  // if(this.zoom < this.target_zoom){
  //   this.zoom += 0.01;
  // }

  // if(this.zoom > this.target_zoom){
  //   this.zoom -= 0.01;
  // }

  // if(this.x < this.target_x){
  //   this.x += speed;
  // }

  // if(this.x > this.target_x){
  //   this.x -= speed;
  // }

  // if(this.y < this.target_y){
  //   this.y += speed;
  // }

  // if(this.y > this.target_y){
  //   this.y -= speed;
  // }  

}


Scenes.maze5.prototype.flash = function(fx, gx, sx){
  if(this.maze.attrs.boom && this.maze.attrs.boomCountdown <= 0){
    if(Math.random() < 0.5){
      gx.ctx.fillStyle = '#ffffff'
      gx.ctx.fillRect(0, 0, gx.w, gx.h)
    }
    if(Math.random() < 0.15){
      fx.ctx.fillStyle = '#f00'
      fx.ctx.fillRect(0, 0, fx.w, fx.h)
    }
    if(Math.random() < 0.15){
      fx.ctx.fillStyle = '#ff0'
      fx.ctx.fillRect(0, 0, fx.w, fx.h)
    }
  }
}

Scenes.maze5.prototype.paint = function (fx, gx, sx) {
  fx.ctx.save();
  fx.ctx.translate(this.x, this.y);
  fx.ctx.scale(this.zoom, this.zoom); 
  gx.ctx.save();
  gx.ctx.translate(this.x, this.y);
  gx.ctx.scale(this.zoom, this.zoom);
  this.maze.paint(gx, fx)
  gx.ctx.restore();
  fx.ctx.restore();
}
