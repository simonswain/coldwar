/* global Scenes, Scene, Actors */

Scenes.rat_logic_seek = function (env, opts) {
  this.env = env
  this.opts = this.genOpts(opts)
  this.attrs = this.genAttrs()
  this.init()
}

Scenes.rat_logic_seek.prototype = Object.create(Scene.prototype)

Scenes.rat_logic_seek.prototype.title = 'Rat Logic Seec'

Scenes.rat_logic_seek.prototype.init = function () {
  this.maze = new Actors.Logicmaze(
    this.env, {
      scene: this
    }, {
      human: true
    }, {
      rows: 3,
      cols: 3
    })
}

Scenes.rat_logic_seek.prototype.getCast = function () {
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

Scenes.rat_logic_seek.prototype.defaults = [{
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

Scenes.rat_logic_seek.prototype.genAttrs = function () {
  return {
  }
}

Scenes.rat_logic_seek.prototype.update = function (delta) {
  this.maze.update(delta);
}


Scenes.rat_logic_seek.prototype.flash = function(fx, gx, sx){
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

Scenes.rat_logic_seek.prototype.paint = function (fx, gx, sx) { 
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
