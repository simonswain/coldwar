/* global Scenes, Scene, Actors */

Scenes.cellhop1 = function (env, opts) {
  this.env = env
  this.opts = this.genOpts(opts)
  this.attrs = this.genAttrs()
  this.init()
}

Scenes.cellhop1.prototype = Object.create(Scene.prototype)

Scenes.cellhop1.prototype.title = 'Cell Hopping'

Scenes.cellhop1.prototype.init = function () {
  this.env.mute = true;
  this.maze = new Actors.Hoppingmaze(
    this.env, {
      scene: this
    }, {
      human: true,
    }, {
      breeders: 0,
      rows: 1,
      cols: 1
    })
}

Scenes.cellhop1.prototype.getCast = function () {
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

Scenes.cellhop1.prototype.defaults = [{
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

Scenes.cellhop1.prototype.genAttrs = function () {
  return {
  }
}

Scenes.cellhop1.prototype.update = function (delta) {
  this.maze.update(delta);
}


Scenes.cellhop1.prototype.flash = function(fx, gx, sx){
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

Scenes.cellhop1.prototype.paint = function (fx, gx, sx) { 
  gx.ctx.save();
  gx.ctx.translate(this.opts.max_x * 0.05, this.opts.max_y * 0.05);
  gx.ctx.scale(0.9, 0.9);
  fx.ctx.save();
  fx.ctx.translate(this.opts.max_x * 0.05, this.opts.max_y * 0.05);
  fx.ctx.scale(0.9, 0.9);
  this.maze.paint(gx, fx)
  gx.ctx.restore();
  fx.ctx.restore();
}
