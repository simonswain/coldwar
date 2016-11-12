/* global Scenes, Scene, Actors */

Scenes.linear_path = function (env, opts) {
  this.env = env
  this.opts = this.genOpts(opts)
  this.attrs = this.genAttrs()
  this.init()
}

Scenes.linear_path.prototype = Object.create(Scene.prototype)

Scenes.linear_path.prototype.title = 'Rat Logic Seec'

Scenes.linear_path.prototype.init = function () {
  this.env.mute = true;
  this.maze = new Actors.Linearmaze(
    this.env, {
      scene: this
    }, {
    }, {
      rows: 6,
      cols: 8
    })
}

Scenes.linear_path.prototype.getCast = function () {
  return {
    Maze: Actors.Maze,
    Cell: Actors.Cell,
    Zap: Actors.Zap,
    Breeder: Actors.Breeder,
    Rat: Actors.Rat,
    Boom: Actors.Boom,
    Reactor: Actors.Reactor,
  }
}

Scenes.linear_path.prototype.defaults = [{
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

Scenes.linear_path.prototype.genAttrs = function () {
  return {
  }
}

Scenes.linear_path.prototype.update = function (delta) {
  this.maze.update(delta);
}


Scenes.linear_path.prototype.flash = function(fx, gx, sx){
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

Scenes.linear_path.prototype.paint = function (fx, gx, sx) { 
  gx.ctx.save();
  gx.ctx.translate(this.opts.max_x * 0.15, this.opts.max_y * 0.15);
  gx.ctx.scale(0.7, 0.7);
  fx.ctx.save();
  fx.ctx.translate(this.opts.max_x * 0.15, this.opts.max_y * 0.15);
  fx.ctx.scale(0.7, 0.7);
  this.maze.paint(gx, fx)
  gx.ctx.restore();
  fx.ctx.restore();
}
