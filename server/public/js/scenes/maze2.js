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
      rows: 12,
      cols: 16,
      breeders: 10,
    })
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
