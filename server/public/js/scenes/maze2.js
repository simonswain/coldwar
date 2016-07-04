/* global Scenes, Scene, Actors */

Scenes.maze2 = function (env, opts) {
  this.env = env
  this.opts = this.genOpts(opts)
  this.attrs = this.genAttrs()
  this.init()
}

Scenes.maze2.prototype = Object.create(Scene.prototype)

Scenes.maze2.prototype.title = 'Maze 1'

Scenes.maze2.prototype.init = function () {
  this.maze = new Actors.Maze(
    this.env, {
      scene: this
    }, {
    }, {
      rows: 6,
      cols: 8,
      breeders: 10,
    });
  this.target_zoom = 1;
  this.target_x = 0;
  this.target_y = 0;
}

Scenes.maze2.prototype.getCast = function () {
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

Scenes.maze2.prototype.defaults = [{
  key: 'max_x',
  info: 'Max X',
  value: 640,
  min: 100,
  max: 1600
}, {
  key: 'max_y',
  info: 'Max Y',
  value: 480,
  min: 100,
  max: 1000
}]

Scenes.maze2.prototype.genAttrs = function () {
  return {
  }
}

Scenes.maze2.prototype.update = function (delta) {
  this.maze.update(delta);
  var speed = 5.5;
  if(this.maze.human){
    var cell = this.maze.human.refs.cell;
    var gx = this.env.views.gx;
    var max = Math.max(this.maze.opts.max_x, this.maze.opts.max_y);
    var rc = Math.max(this.maze.attrs.rows, this.maze.attrs.cols);
    var w = this.maze.opts.max_x / this.maze.attrs.cols;
    var h = this.maze.opts.max_y / this.maze.attrs.rows;

    this.target_x = (gx.w / 2) - (((w * cell.attrs.x * this.target_zoom)) * gx.scale);
    this.target_y = (gx.h / 2) - (((h * cell.attrs.y * this.target_zoom)) * gx.scale);
    
    this.target_zoom = 2.5;
  }

  if(this.maze.attrs.boom){
    this.target_zoom = 1;
    this.target_x = 0;
    this.target_y = 0;
    speed = 15;
  }
  
  if(this.env.zoom < this.target_zoom){
    this.env.zoom += 0.01;
  }

  if(this.env.zoom > this.target_zoom){
    this.env.zoom -= 0.01;
  }

  if(this.env.page_x < this.target_x){
    this.env.page_x += speed;
  }

  if(this.env.page_x > this.target_x){
    this.env.page_x -= speed;
  }

  if(this.env.page_y < this.target_y){
    this.env.page_y += speed;
  }

  if(this.env.page_y > this.target_y){
    this.env.page_y -= speed;
  }  

}


Scenes.maze2.prototype.flash = function(fx, gx, sx){
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

Scenes.maze2.prototype.paint = function (fx, gx, sx) {
  this.maze.paint(gx)
}
