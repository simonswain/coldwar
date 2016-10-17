/* global Scenes, Scene, Actors */

Scenes.cell_hopping = function (env, opts) {
  this.env = env
  this.opts = this.genOpts(opts)
  this.attrs = this.genAttrs()
  this.init()
}

Scenes.cell_hopping.prototype = Object.create(Scene.prototype)

Scenes.cell_hopping.prototype.title = 'Cell Hopping'

Scenes.cell_hopping.prototype.init = function () {
  this.maze = new Actors.Hoppingmaze(
    this.env, {
      scene: this
    }, {
      human: false
    }, {
      rows: 1,
      cols: 2
    })
}

Scenes.cell_hopping.prototype.getCast = function () {
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

Scenes.cell_hopping.prototype.defaults = [{
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

Scenes.cell_hopping.prototype.genAttrs = function () {
  return {
  }
}

Scenes.cell_hopping.prototype.update = function (delta) {
  this.maze.update(delta);
}


Scenes.cell_hopping.prototype.flash = function(fx, gx, sx){
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

Scenes.cell_hopping.prototype.paint = function (fx, gx, sx) { 
  gx.ctx.save();
  gx.ctx.translate(this.opts.max_x * 0.05, this.opts.max_y * 0.05);
  gx.ctx.scale(0.9, 0.9);
  this.maze.paint(gx)
  gx.ctx.restore();
}
